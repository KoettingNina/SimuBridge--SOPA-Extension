import { Currencies, TimeUnits, activity, distribution, event, scenario, distributionTypes } from 'simulation-bridge-datamodel/DataModel.js';

import xml2js from 'browser-xml2js'



export function convertSimodOutput(jsonOutput, bpmnOutput) {

    const jsonObj = JSON.parse(jsonOutput);
    
    //TODO replace xml2js with bpmn-moddle
    
    let bpmnParsed;
    const parser = new xml2js.Parser({attrkey: "ATTR"})
    parser.parseString(bpmnOutput, function(error, result){
        if (error == null){console.log(result); bpmnParsed = result}
        else{console.log(error)}
    });

    //create Scenario Object, use default for name, starting date, no. process instances, and currency
    let Scenario = scenario("Scenario 1");

    //Get Scenario parameters which are needed in the internal Representation of SimuBridge
    Scenario.startingTime = getstartingTime(jsonObj);
    Object.assign(Scenario.resourceParameters, getResourceParameters(jsonObj));
    Object.assign(Scenario.models, getModel(bpmnParsed, jsonObj, bpmnOutput));

    return Scenario;
}

function getstartingTime(jsonObj){
    //get the starting date from the arrival_time_calendar from Simod
    return jsonObj.arrival_time_calendar[0].beginTime.substring(0,5)
}

function getTimeUnit(){
    //Simod always returns values in seconds (see https://github.com/AutomatedProcessImprovement/Prosimos/blob/main/README.md)
    return TimeUnits.SECONDS
}

function getCaseArrivalRate(jsonObj) {
    return makeDistribution(jsonObj.arrival_time_distribution);
}

function makeDistribution(simodDistribution){

    function createDistributionConfig (distributionType, ...values) {
        return Object.assign(distribution(), {
            distributionType, 
            values : distributionTypes[distributionType].distribution_params.map((id, index) => ({id, value : values[index] })),
            timeUnit : getTimeUnit()
        })
    }

    switch(simodDistribution.distribution_name.toLocaleLowerCase()) {
        case 'gamma':  { // Gamma distribution not supported by SimuBridge, approximate with normal distribution of same mean and variance
            // Param documentation: https://github.com/AutomatedProcessImprovement/Prosimos/blob/34bf0e2367428cc4b87d626dde9161d82c89efb4/prosimos/probability_distributions.py#L165
            const param1 = simodDistribution.distribution_params[0].value;
            const param2 = simodDistribution.distribution_params[2].value
            const mean = param1 * param2; // pow(mean, 2) / variance * variance / mean = pow(mean, 2) / mean = mean
            const variance = param2 * mean; // variance / mean * mean = variance
            return createDistributionConfig('normal', mean, variance);
        }; 
        case 'fix': {
            const constantValue = simodDistribution.distribution_params[0].value;
            return createDistributionConfig('constant', constantValue);
        };
        case 'uniform': case 'default':{ //TODO confirm that default distribution is indeed a uniform distribution
            const lower = simodDistribution.distribution_params[0].value;
            const upper = simodDistribution.distribution_params[1].value + lower;
            return createDistributionConfig('uniform', lower, upper);
        };
        case 'expon': {
            const mean = simodDistribution.distribution_params[1].value; 
            return createDistributionConfig('exponential', mean)
        };
        case 'norm': {
            const mean = simodDistribution.distribution_params[0].value; 
            const variance = simodDistribution.distribution_params[1].value;
            return createDistributionConfig('normal', mean, variance);
        };
        case 'lognorm': { //TODO translation semantic to be counterchecked
            const logMean = simodDistribution.distribution_params[0].value;
            const logVariance = simodDistribution.distribution_params[1].value;

            const mean = Math.log(logMean ** 2 / Math.sqrt(logMean ** 2 + logVariance));
            const variance = Math.sqrt(Math.log(1 + logVariance / logMean ** 2));
            return createDistributionConfig('normal', mean, variance);
        }; 
        default: throw new Error(`Distributiontype "${simodDistribution.distribution_name}" not supported`)
    }
}

function getResourceParameters(jsonObj){
    //returns the resource Parameters, which contains Resources, Roles and Timetables
    return {
        roles : getRoles(jsonObj),
        resources : getResources(jsonObj),
        timeTables : getTimeTables(jsonObj)
    }
}

function getResources(jsonObj){
    //returns the resources Array, which contains the id, cost per hour, number of instances and schedule for each schedule
    return jsonObj.resource_profiles.flatMap(role => {
        let defaultTimetableId = role.resource_list[0].calendar;
        let defaultCostHour = role.resource_list[0].cost_per_hour;
        return role.resource_list.map(instance => ({
            id: instance.id,
            costHour: instance.cost_per_hour !== defaultCostHour ? instance.cost_per_hour : undefined,
            //TODO unused attribute numberOfInstances: instance.amount,
            schedule: instance.calendar !== defaultTimetableId ? instance.calendar : undefined
        }));
    });
}

function getTaskDuration(jsonObj, taskid){
    const durationPerResourceInstance = jsonObj.task_resource_distribution.find(element => element.task_id == taskid).resources;
    return makeDistribution(durationPerResourceInstance[0])  //Assume that each resource takes the same time
}

function getRoles(jsonObj){
    //returns the roles, contains for each role the id, a schedule and the specific resources
    return jsonObj.resource_profiles.map(role => ({
        id: role.id,
        schedule: role.resource_list[0].calendar, //Take first calendar by default
        costHour: role.resource_list[0].cost_per_hour, // Take first cost per hour by default
        resources: role.resource_list.map(instance => ({id: instance.id}))
    }));
}

function getTimeTables(jsonObj){
    //returns all timetables of the resources
    let timeTables = new Array
    jsonObj.resource_calendars.forEach(element =>{
        let timeTableItems = new Array
        element.time_periods.forEach(b => {timeTableItems.push({
            startWeekday: firstLetterUpperCaseElseLowerCase(b.from),
            startTime: timeToNumber(b.beginTime),
            endWeekday: firstLetterUpperCaseElseLowerCase(b.to),
            endTime: timeToNumber(b.endTime)

        })})
        timeTables.push({
            id: element.id,
            timeTableItems: timeTableItems
        })
    });
    return timeTables
}

function firstLetterUpperCaseElseLowerCase(word){
    //returns a string where only the first letter is UpperCase (MONDAY => Monday)
    word = word.charAt(0).toLocaleUpperCase() + word.toLocaleLowerCase().substring(1, word.length);
    return word
}

function timeToNumber(time){
    //TODO do we really only want to support full hours?
    // returns a from a time (hh:mm:ss) the rounded hour
    var hour = parseInt(time)
    var min = parseInt(time.substring(3))
    if(min > 30){ hour = hour + 1;}
    return hour
}

function getModel(bpmnObj, jsonObj, bpmnXml){
    //returns the model parameters, contains the BPMN, BPMN-name, activities, gateways, events and sequences
    let models = new Array;
    let modelParameter = new Object;
    modelParameter.activities = getActivities(bpmnObj, jsonObj);
    modelParameter.gateways = getGateways(jsonObj);
    modelParameter.events = getEvents(bpmnObj, jsonObj);
    
    models.push({
        BPMN: bpmnXml,
        name: "BPMN_1",
        modelParameter: modelParameter

    })
    return models;
}

function getEvents(bpmnObj, jsonObj) {
    return bpmnObj.definitions.process.flatMap(element => 
        [... element.startEvent.map(b => Object.assign(event(b.ATTR.id), {
            interArrivalTime: getCaseArrivalRate(jsonObj),
        })),
        ... (element.intermediateCatchEvent || []).map(b => Object.assign(event(b.ATTR.id), {
            interArrivalTime: makeDistribution(jsonObj.event_distribution.find(evtDist => evtDist.event_id === b.ATTR.id))
        }))]
    );
}



function getGateways(jsonObj){
    return jsonObj.gateway_branching_probabilities.map(({gateway_id, probabilities}) => ({
        id : gateway_id,
        probabilities : Object.fromEntries(probabilities.map(({path_id, value}) => [path_id, value]))
    }));
}

function getActivities(bpmnObj, jsonObj) {
    return bpmnObj.definitions.process.flatMap(process => {
        return process.task.map(simodActivity => {
            const roles = jsonObj.resource_profiles;
            const assignedRoles = roles
                .filter(role => role.resource_list.some(instance => instance.assignedTasks.includes(simodActivity.ATTR.id)))
                .map(role => role.id);

            return Object.assign(activity(simodActivity.ATTR.id), {
                resources : assignedRoles,
                duration : getTaskDuration(jsonObj, simodActivity.ATTR.id)
            });
        })
    })
}
