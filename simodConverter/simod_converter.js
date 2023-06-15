import { Currencies, TimeUnits } from 'simulation-bridge-datamodel/DataModel.js';

import xml2js from 'browser-xml2js'


export function convertSimodOutput(jsonOutput, bpmnOutput) {

    const jsonObj = JSON.parse(jsonOutput);
    
    //TODO replace xml2js
    // const parser = new DOMParser();
    // const bpmnParsed = parser.parseFromString(bpmnOutput, "text/xml");
    
    let bpmnParsed;
    const parser = new xml2js.Parser({attrkey: "ATTR"})
    parser.parseString(bpmnOutput, function(error, result){
        if (error == null){console.log(result); bpmnParsed = result}
        else{console.log(error)}
    });

    //create Array which contains Scenario Objects
    let Scenario = new Object;

    //Get Scenario parameters which are needed in the internal Representation of SimuBridge
    Scenario.scenarioName = getScenarioName(jsonObj);
    Scenario.startingDate = getStartingDate(jsonObj);
    Scenario.startingTime = getstartingTime(jsonObj);
    Scenario.numberOfInstances = 100 //TODO doesn't work //getNumberOfInstances(jsonObj);
    Scenario.currency = getCurrency();
    Scenario.resourceParameters = getResourceParameters(jsonObj);
    Scenario.models = getModel(bpmnParsed, jsonObj, bpmnOutput);

    return Scenario;
}

function getScenarioName(jsonObj){
    //No Scenario name in Simod, choose default name
    return "Scenario 1"
}

function getStartingDate(jsonObj){
    //No Scenario name in Simod, choose default date
    return "01-01-0000"
}

function getstartingTime(jsonObj){
    //get the starting date from the arrival_time_calendar from Simod
    return jsonObj.arrival_time_calendar[0].beginTime.substring(0,5)
}

function getNumberOfInstances(jsonObj){  //TODO unused
    //get the Number of instances startet in inter arrival time calendar
    let NumberofSeconds = 0;
    jsonObj.arrival_time_calendar.forEach(element => {
        let StartingDay = getDayAsNumber(element.from);
        let StartingTime = getTimeInSeconds(element.beginTime);
        let EndDay = getDayAsNumber(element.to);
        let EndTime = getTimeInSeconds(element.endTime);
        let secondsPerDay = 86400;
        
        let Seconds = EndTime - StartingTime; 
        Seconds += secondsPerDay * (EndDay - StartingDay);
        NumberofSeconds += Seconds
    })
    //multiply seconds with mean per seconds of distribution
    let numberOfInstances = 0;
    switch(getDistributionName(jsonObj.arrival_time_distribution)){ //TODO these might all be wrong
        case "constant": numberOfInstances = (NumberofSeconds/60) * getValues(jsonObj.arrival_time_distribution)[0].value; break;
        case "uniform": numberOfInstances = (NumberofSeconds/60) * (getValues(jsonObj.arrival_time_distribution)[1].value - getValues(jsonObj.arrival_time_distribution)[0].value); break;
        case "expon": numberOfInstances = (NumberofSeconds/60) * getValues(jsonObj.arrival_time_distribution)[1].value; break;
        case "norm": numberOfInstances = (NumberofSeconds/60) * getValues(jsonObj.arrival_time_distribution)[0].value; break;
    }

    return Math.ceil(numberOfInstances);
}

function getTimeInSeconds(timeString){
    //provides the number of seconds for a time input String: "hh:mm:ss"
    let hours = parseInt(timeString);
    timeString = timeString.substring(3);
    var min = parseInt(timeString);
    timeString = timeString.substring(3);
    let seconds = parseInt(timeString);
    return seconds + (60*min) + (60*60*hours)
}

function getDayAsNumber(Day){
    // returns the number of the day (monday = 0; tuesday = 1;..)
    switch(Day.toLocaleLowerCase()){
        case "monday": return 0;
        case "tuesday": return 1;
        case "wednesday": return 2;
        case "thursday": return 3;
        case "friday": return 4;
        case "saturday": return 5;
        case "sunday": return 6;
    }
}

function getTimeUnit(){
    //Simod always returns values in seconds (see https://github.com/AutomatedProcessImprovement/Prosimos/blob/main/README.md)
    return TimeUnits.SECONDS
}

function getCurrency(){
    //no Currency in Simod, choose default currency
    return Currencies.UNSPECIFIED;
}

function getInterArrivalTime(jsonObj){
    //provides the interarrivalTime which contains a distribution Name and values
    let interArrivalTime = new Object;
    interArrivalTime.distributionType = getDistributionName(jsonObj.arrival_time_distribution)
    interArrivalTime.values = getValues(jsonObj.arrival_time_distribution)
    interArrivalTime.timeUnit = getTimeUnit()
    return interArrivalTime
}

function getDistributionName(distribution){
    // returns the name of distribution, gamme and lognorm approximated with a constant value
    let distributionName = distribution.distribution_name;
    switch(distributionName.toLocaleLowerCase()){
        case 'gamma':  return 'constant' //Not in Scylla
        case 'fix': return'constant'
        case 'uniform': return 'uniform'
        case 'expon': return 'exponential'
        case 'lognorm': return 'constant'; //Not in scylla
        case 'norm': return 'normal';
        case 'default': return 'uniform'; //NOT in scylla!
    }
}

function getValues(distribution){
    // returns the values of distribution, gamme and lognorm approximated with a constant value
    let values = new Array
    let mean = 0.0;
    let variance = 0.0;
    switch(distribution.distribution_name.toLocaleLowerCase()){
        case 'gamma':  {
            mean = distribution.distribution_params[0].value * distribution.distribution_params[2].value; 
            //variance = mean * distribution.distribution_params[2].value; 
            //values.push({id: "mean", value: mean})
            //values.push({id: "variance", value: variance})
            values.push({id: "constantValue", value: /*60/*/mean})
            break;
        }; //Not in Scylla //Using mean for fix distribution
        case 'fix': {
            let constantValue = distribution.distribution_params[0].value;
            values.push({id: "constantValue", value: /*60/*/constantValue});
            break;
        };
        case 'uniform': case 'default':{
            let lower = distribution.distribution_params[0].value;
            let upper = distribution.distribution_params[1].value + lower;
            values.push({id: "lower", value: /*60/*/lower});
            values.push({id: "upper", value: /*60/*/upper});
            break;
        };
        case 'expon': {
            mean = distribution.distribution_params[1].value; 
            values.push({id: "mean", value: /*60/*/mean})
            break;
        };
        case 'lognorm': {
            mean = distribution.distribution_params[2].value;
            values.push({
                id: "constantValue", value: /*60/*/mean
            })
            break;
        }; //Not in Scylla //Using math.exp(mu) for fix duration
        case 'norm': {
            mean = distribution.distribution_params[0].value; 
            let variance = distribution.distribution_params[1].value;
            values.push({id: 'mean', value: /*60/*/mean})
            values.push({id: 'variance', value: variance})
            break;
        };
        case 'default': return values;
    }
    return values
}

function getResourceParameters(jsonObj){
    //returns the resource Parameters, which contains Resources, Roles and Timetables
    let ResourceParameters = new Object;
    ResourceParameters.roles = getRoles(jsonObj);
    ResourceParameters.resources = getResources(jsonObj);
    ResourceParameters.timeTables = getTimeTables(jsonObj);
    return ResourceParameters
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

function getTaskDuration(jsonObj, Taskid){
    //returns the duraration for a taks, contains the ditribution Name and the values
    let duration = new Object;
    jsonObj.task_resource_distribution.forEach(element =>{
        if(element.task_id == Taskid){
            duration = {
                distributionType: getDistributionName(element.resources[0]),
                values: getValues(element.resources[0]),
                timeUnit : getTimeUnit()
            }
        }

    })
    return duration
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
    // returns a from a time (hh:mm:ss) the rounded hour
    var hour = parseInt(time)
    var time = time.substring(3)
    var min = parseInt(time)
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
    let Events = new Array;
    //getStartEvents
    bpmnObj.definitions.process.forEach(element => {
        element.startEvent.forEach(b => {
            Events.push({
                id: b.ATTR.id,
                type: "bpmn:StartEvent",
                interArrivalTime: getInterArrivalTime(jsonObj),
            })
        })
    })
    //getintermediateCatchEvents
    bpmnObj.definitions.process.forEach(element => {
        if(element.intermediateCatchEvent != null){
            element.intermediateCatchEvent.forEach(b => {
                Events.push({
                    id: b.ATTR.id,
                    type: "bpmn:intermediateCatchEvent",
                    interArrivalTime: "", //TODO this will not work; however, at least simod seems to not give any additional information to intermediate events
                })
            })
        }  
    })
    return Events
}



function getGateways(jsonObj){
    return jsonObj.gateway_branching_probabilities.map(({gateway_id, probabilities}) => ({
        id : gateway_id,
        probabilities : Object.fromEntries(probabilities.map(({path_id, value}) => [path_id, value]))
    }));
}

function getActivities(bpmnObj, jsonObj) {
    let activities = new Array;
    bpmnObj.definitions.process.forEach(element => {
        element.task.forEach(b => {

            let roles = jsonObj.resource_profiles;
            let assignedRoles = roles
                .filter(role => role.resource_list.some(instance => instance.assignedTasks.includes(b.ATTR.id)))
                .map(role => role.id);

            activities.push({
                id: b.ATTR.id,
                name: b.ATTR.name,
                type: "bpmn:Task",
                resources: assignedRoles,
                unit: getTimeUnit(),
                cost: 0,
                duration: getTaskDuration(jsonObj, b.ATTR.id),
            })
        })
    })
    return activities;
}
