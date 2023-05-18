const { fstat } = require('fs');

//read InputFile json File
const jsonObj = require('../Simod_output/input.json')

//read Input bpmn File
var bpmnObj;
const xml2js = require('xml2js');
const fs = require('fs');
const parser = new xml2js.Parser({attrkey: "ATTR"})
let xml_string = fs.readFileSync("./Simod_output/input.bpmn", "utf8");

//parse xml-bpmn-string to json
parser.parseString(xml_string, function(error, result){
    if (error == null){console.log(result); bpmnObj = result}
    else{console.log(error)}
});

//create Array which contains Scenario Objects
let dataPetriSim = new Array;
let Scenario = new Object;

//Get Scenario parameters which are needed in the internal Representation of PetriSim
Scenario.scenarioName = getScenarioName(jsonObj);
Scenario.startingDate = getStartingDate(jsonObj);
Scenario.startingTime = getstartingTime(jsonObj);
Scenario.NumberOfInstances = getNumberOfInstances(jsonObj);
Scenario.getInterArrivalTime = getInterArrivalTime(jsonObj);
Scenario.timeUnit = getTimeUnit(jsonObj);
Scenario.currency = getCurrency(jsonObj);
Scenario.resourceParameters = getResourceParameters(jsonObj);
Scenario.model = getModel(bpmnObj, jsonObj);
dataPetriSim.push(Scenario)

//write to Ouput File
writeToFile(dataPetriSim)

//write to Ooutput File
function writeToFile(dataPetriSim){
    var dataPetriSimJson = JSON.stringify(dataPetriSim, null, 4)
    const fs = require('fs');
    fs.writeFile('./converterOutput/outputConverter.json', dataPetriSimJson, 'utf8', err =>{
        if(err){
            console.error(err);
            return;
        }
    })
}

function getScenarioName(jsonObj){
    //No Scenario name in Simod, choose default name
    return "Scenario 1"
}

function getStartingDate(jsonObj){
    //No Scenario name in Simod, choose default date
    return "00-00-0000"
}

function getstartingTime(jsonObj){
    //get the starting date from the arrival_time_calendar from Simod
    return jsonObj.arrival_time_calendar[0].beginTime.substring(0,5)
}

function getNumberOfInstances(jsonObj){
    //get the Number of instances startet in inter arrival time calendar
    let NumberofSeconds = 0;
    jsonObj.arrival_time_calendar.forEach(element => {
        let StartingDay = getDayAsNumber(element.from);
        let StartingTime = getTimeInSeconds(element.beginTime);
        let EndDay = getDayAsNumber(element.to);
        let EndTime = getTimeInSeconds(element.endTime);
        let secondsPerDay = 86400;
        
        let Seconds = EndTime - StartingTime;
        Seconds = secondsPerDay * (EndDay - StartingDay);
        NumberofSeconds = NumberofSeconds + Seconds
    })
    //multiply seconds with mean per seconds of distribution
    let NumberOfInstances = 0;
    switch(getDistributionName(jsonObj.arrival_time_distribution)){
        case "constant": NumberOfInstances = (NumberofSeconds/60) * getValues(jsonObj.arrival_time_distribution)[0].value; break;
        case "uniform": NumberOfInstances = (NumberofSeconds/60) * (getValues(jsonObj.arrival_time_distribution)[1].value - getValues(jsonObj.arrival_time_distribution)[0].value); break;
        case "expon": NumberOfInstances = (NumberofSeconds/60) * getValues(jsonObj.arrival_time_distribution)[0].value; break;
        case "norm": NumberOfInstances = (NumberofSeconds/60) * getValues(jsonObj.arrival_time_distribution)[0].value; break;
    }
    return NumberOfInstances
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

function getTimeUnit(jsonObj){
    //this converter provides the disributions in minutes
    return "mins"
}

function getCurrency(jsonObj){
    //no Currency in Simod, choose default currency
    return "Money Unit"
}

function getInterArrivalTime(jsonObj){
    //provides the interarrivalTime which contains a distribution Name and values
    let interArrivalTime = new Object;
    interArrivalTime.distribution = getDistributionName(jsonObj.arrival_time_distribution)
    interArrivalTime.values = getValues(jsonObj.arrival_time_distribution)
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
        case 'default': return 'default';
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
            values.push({id: "constant_value", value: 60/mean})
            break;
        }; //Not in Scylla //Using mean for fix distribution
        case 'fix': {
            let constant_value = distribution.distribution_params[0].value;
            values.push({id: "constant_value", value: 60/constant_value});
            break;
        };
        case 'uniform':{
            let min = distribution.distribution_params[0].value;
            let max = distribution.distribution_params[1].value + min;
            values.push({id: "min", value: 60/min});
            values.push({id: "max", value: 60/max});
            break;
        };
        case 'expon': {
            mean = distribution.distribution_params[1].value; 
            values.push({id: "mean", value: 60/mean})
            break;
        };
        case 'lognorm': {
            mean = distribution.distribution_params[2].value;
            values.push({
                id: "constant_value", value: 60/mean
            })
            break;
        }; //Not in Scylla //Using math.exp(mu) for fix duration
        case 'norm': {
            mean = distribution.distribution_params[0].value; 
            let st_dev = distribution.distribution_params[1].value;
            values.push({id: 'mean', value: 60/mean})
            values.push({id: 'standard_deviation', value: st_dev})
            break;
        };
        case 'default': return values;
    }
    return values
}

function getResourceParameters(jsonObj){
    //returns the resource Parameters, which contains Resources, Roles and Timetables
    let ResourceParameters = new Object;
    ResourceParameters.resources = getResources(jsonObj);
    ResourceParameters.roles = getRoles(jsonObj);
    ResourceParameters.timeTables = getTimeTables(jsonObj);
    return ResourceParameters
}

function getResources(jsonObj){
    //returns the resources Array, which contains the id, cost per hour, number of instances and schedule for each schedule
    let resources = new Array
    jsonObj.resource_profiles.forEach(element => {
            element.resource_list.forEach(b => {
                resources.push({
                    id: b.id,
                    costHour: b.cost_per_hour,
                    NumberOfInstances: b.amount,
                    schedule: b.calendar
                })
            })
    });
    return resources;
}

function getTaskDuration(jsonObj, Taskid){
    //returns the duraration for a taks, contains the ditribution Name and the values
    let duration = new Object;
    jsonObj.task_resource_distribution.forEach(element =>{
        if(element.task_id == Taskid){
            duration.push({
                distributionType: getDistributionName(element.resources[0]),
                values: getValues(element.resources[0])
            })
        }

    })
    return duration
}

function getRoles(jsonObj){
    //returns the roles, contains for each role the id, a schedule and the specific resources
    let roles = new Array
    jsonObj.resource_profiles.forEach(element =>{
        let resources = new Array
        element.resource_list.forEach(b => {resources.push({id: b.id})})
        roles.push({
            id: element.id,
            schedule: getFirstSchedule(jsonObj, element.id),
            resources: resources
        })
    });
    return roles
}

function getFirstSchedule(jsonObj, RoleID){
    //returns the schedule of a the first resource for a role
    let schedule = "";
    jsonObj.resource_profiles.forEach(element => {
        if(element.id == RoleID){
            schedule = element.resource_list[0].calendar;
        }
    })
    return schedule
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

function getModel(bpmnObj, jsonObj){
    //returns the model parameters, contains the BPMN, BPMN-name, activities, gateways, events and sequences
    let models = new Array;
    let modelParameter = new Object;
    modelParameter.activities = getActivities(bpmnObj, jsonObj);
    modelParameter.gateways = getGateway(bpmnObj, jsonObj);
    modelParameter.events = getEvents(bpmnObj, jsonObj);
    modelParameter.sequences = getSequences(bpmnObj, jsonObj);
    
    models.push({
        BPMN: bpmnObj,
        name: "BPMN_1",
        modelParameter: modelParameter

    })
    return models;
}

function getEvents(bpmnObj, jsonObj){
    //returns all events with id, type, time unit, interarrival time (if start event), incoming sequences and outgoing sequences
    let Events = new Array;
    //getStartEvents
    bpmnObj.definitions.process.forEach(element => {
        element.startEvent.forEach(b => {
            emptyArray = new Array;
            Events.push({
                id: b.ATTR.id,
                type: "bpmn:StartEvent",
                unit: getTimeUnit(),
                interArrivalTime: getInterArrivalTime(jsonObj),
                incoming: emptyArray,
                outgoing: getOutgoingSequences(b.ATTR.id, bpmnObj)
            })
        })
    })
    //getEndEvents
    bpmnObj.definitions.process.forEach(element => {
        element.endEvent.forEach(b => {
            emptyArray = new Array;
            Events.push({
                id: b.ATTR.id,
                type: "bpmn:EndEvent",
                unit: getTimeUnit(),
                interArrivalTime: "",
                incoming: getIncomingSequences(b.ATTR.id, bpmnObj),
                outgoing: emptyArray
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
                    unit: getTimeUnit(),
                    interArrivalTime: "",
                    incoming: getIncomingSequences(b.ATTR.id, bpmnObj),
                    outgoing: getOutgoingSequences(b.ATTR.id, bpmnObj)
                })
            })
        }  
    })
    return Events
}



function getGateway(bpmnObj, jsonObj){
    //returns the gateways with id, type, incoming sequences, outgoing sequences
    let gateways = new Array
    //exclusiveGateways
    if(bpmnObj.definitions.process[0].exclusiveGateway != null){
        bpmnObj.definitions.process[0].exclusiveGateway.forEach(element => {
            gateways.push({
                id: element.ATTR.id,
                type: "bpmn:exclusiveGateway",
                incoming: getIncomingSequences(element.ATTR.id, bpmnObj),
                outgoing: getOutgoingSequences(element.ATTR.id, bpmnObj)
            })
        })
    }
    //inclusiveGateways
    else if(bpmnObj.definitions.process[0].inclusiveGateway != null){
        bpmnObj.definitions.process[0].inclusiveGateway.forEach(element => {
            gateways.push({
                id: element.ATTR.id,
                type: "bpmn:inclusiveGateway",
                incoming: getIncomingSequences(element.ATTR.id, bpmnObj),
                outgoing: getOutgoingSequences(element.ATTR.id, bpmnObj)
            })
        })
    }
    //parallelGateways
    else if(bpmnObj.definitions.process[0].parallelGateway != null){
        bpmnObj.definitions.process[0].parallelGateway.forEach(element => {
            gateways.push({
                id: element.ATTR.id,
                type: "bpmn:parallelGateway",
                incoming: getIncomingSequences(element.ATTR.id, bpmnObj),
                outgoing: getOutgoingSequences(element.ATTR.id, bpmnObj)
            })
        })
    }     
    return gateways
}

function getIncomingSequences(currrentNodeId, bpmnObj){
    //returns an array of the incoming sequence ids for the current node
    let sequences = new Array;
    bpmnObj.definitions.process.forEach(element => {
        element.sequenceFlow.forEach(b => {
            if(currrentNodeId == b.ATTR.targetRef){
                sequences.push(b.ATTR.id)
            }
        })
    })
    return sequences
}

function getOutgoingSequences(currrentNodeId, bpmnObj){
    //returns an array of the outgoing sequence ids for the current node
    let sequences = new Array;
    bpmnObj.definitions.process.forEach(element => {
        element.sequenceFlow.forEach(b => {
            if(currrentNodeId == b.ATTR.sourceRef){
                sequences.push(b.ATTR.id)
            }
        })
    })
    return sequences
}

function getActivities(bpmnObj, jsonObj){
    //returns an array of the activities, each activity contains the 
    //id, name, tyoe, resources, timeunit, costs, currency, duration incoming sequences and ooutgoing sequences
    let activities = new Array;
    bpmnObj.definitions.process.forEach(element => {
        element.task.forEach(b => {
            let resources = new Array;
            jsonObj.task_resource_distribution.forEach(c => {
                if (c.task_id == b.ATTR.id){
                    c.resources.forEach(d=> {
                        resources.push(d.resource_id);
                    })
                }
            })
            activities.push({
                id: b.ATTR.id,
                name: b.ATTR.name,
                type: "bpmn:Task",
                resources: resources,
                unit: getTimeUnit(),
                cost: 0,
                currency: getCurrency(),
                duration: getTaskDuration(jsonObj, b.ATTR.id),
                incoming: getIncomingSequences(b.ATTR.id, bpmnObj),
                outgoing: getOutgoingSequences(b.ATTR.id, bpmnObj)
            })
        })
    })
    return activities;
}

function getSequences(bpmnObj, jsonObj){
    //returns the sequences wich id, type and probability
    let sequences = new Array;
    bpmnObj.definitions.process.forEach(element => {
        element.sequenceFlow.forEach(b => {
            sequences.push({
                id: b.ATTR.id,
                type: "bpmn:SqequenceFlow", 
                probability: "0"//getSequenceProbability(bpmnObj, jsonObj, b)
            })
        })
    })
    return sequences;
}

function getSourceNode(bpmnObj, Sequence){
    //returns the source of a current sequence
    let SequenceSourceRef = Sequence.ATTR.sourceRef;
    let Node = new Object;
    bpmnObj.definitions.process.forEach(element => {
        if(element.startEvent != null){
            element.startEvent.forEach(b =>{
                if (b.ATTR.id == SequenceSourceRef){Node = b;}
        })}
        if(element.task != null){
            element.task.forEach(b =>{
                if (b.ATTR.id == SequenceSourceRef){Node = b;}
        })}
        if(element.exclusiveGateway != null){
            element.exclusiveGateway.forEach(b =>{
                if (b.ATTR.id == SequenceSourceRef){Node = b;}
        })}
        if(element.inclusiveGateway != null){
            element.inclusiveGateway.forEach(b =>{
                if (b.ATTR.id == SequenceSourceRef){Node = b;}
        })}
        if(element.parallelGateway != null){
        element.parallelGateway.forEach(b =>{
            if (b.ATTR.id == SequenceSourceRef){Node = b;}
        })}
        if(element.intermediateCatchevent != null){
        element.intermediateCatchevent.forEach(b =>{
            if (b.ATTR.id == SequenceSourceRef){Node = b;}
        })}
    })
    return Node;

}
function getNodeType(bpmnObj, NodeId){
    //returns the type of a node
    let NodeTyp = "";
    bpmnObj.definitions.process.forEach(element => {
        if(element.startEvent != null){
            element.startEvent.forEach(b =>{
                if (b.ATTR.id == NodeId){NodeTyp = "startEvent";}
        })}
        if(element.task != null){
            element.task.forEach(b =>{
                if (b.ATTR.id == NodeId){NodeTyp = "task";}
        })}
        if(element.exclusiveGateway != null){
            element.exclusiveGateway.forEach(b =>{
                if (b.ATTR.id == NodeId){NodeTyp = "exclusiveGateway";}
        })}
        if(element.inclusiveGateway != null){
            element.inclusiveGateway.forEach(b =>{
                if (b.ATTR.id == NodeId){NodeTyp = "inclusiveGateway";}
        })}
        if(element.parallelGateway != null){
        element.parallelGateway.forEach(b =>{
            if (b.ATTR.id == NodeId){NodeTyp = "parallelGateway";}
        })}
        if(element.intermediateCatchevent != null){
        element.intermediateCatchevent.forEach(b =>{
            if (b.ATTR.id == NodeId){NodeTyp = "intermediateCatchevent";}
        })}
    })
    return NodeTyp;
}

function getSequenceObject(bpmnObj, sequenceID){
    //returns the whole object of the id of a sequence
    let Sequence = new Object;
    bpmnObj.definitions.process.forEach(element=>{
        element.sequenceFlow.forEach(b=>{
            if(b.ATTR.id == sequenceID){Sequence = b;}
        })
    })
    return Sequence;
}

function getSequenceProbability(Sequence, bpmnObj, jsonObj){
    //returns the distribution probability of a sequence
    let probability = 0.0;
    PreviousNodeObject = getSourceNode(bpmnObj, Sequence);
    PreviousNodeType = getNodeType(bpmnObj, PreviousNodeObject.ATTR.id)

    //If the Source of the current Sequence ain't a start event get the previous sequence;
    let previousSequences = new Array;
    if(PreviousNodeType != "startEvent"){
        previousSequences = getIncomingSequences(PreviousNodeObject);
    }
    
    //handle privious Nodes start recursion
    switch(PreviousNodeType){
        case "startEvent": probability = 1.0; break;
        case "Task": { previousSequences.forEach(s => {
                probability = getSequenceProbability(s, bpmnObj, jsonObj);
            }); break;
        }
        case "intermediateCatchevent": { previousSequences.forEach(s => {
            probability = getSequenceProbability(s, bpmnObj, jsonObj);
        }); break;
        }
        case "exclusiveGateway": {
            let GatewayType = PreviousNodeObject.ATTR.gatewayDirection;
            if(GatewayType == "Converging"){
                previousSequences.forEach(s => {
                    probability = probability + getSequenceProbability(s, bpmnObj, jsonObj);
                });
            }
            else {
                previousSequences.forEach(s => {
                    probability = getGatewaySequenceProbability(Sequence, jsonObj) * getSequenceProbability(s, bpmnObj, jsonObj);
                });
            }
            break;
        }
        case "parallelGateway": {
            let GatewayType = PreviousNodeObject.ATTR.gatewayDirection;
            if(GatewayType == "Converging"){
                previousSequences.forEach(s => {
                    if(probability = 1.0){probability = getSequenceProbability(s, bpmnObj, jsonObj);}
                    else if(getSequenceProbability(s, bpmnObj, jsonObj) > probability){probability = getSequenceProbability(s, bpmnObj, jsonObj);}
                });
            }
            else {
                previousSequences.forEach(s => {
                    probability = getSequenceProbability(s, bpmnObj, jsonObj);
                });
            }
            break;
        }
        case "inclusiveGateway" :{
            if(GatewayType == "Converging"){
                previousSequences.forEach(s => {
                    if(probability = 1.0){probability = getSequenceProbability(s, bpmnObj, jsonObj);}
                    else if(getSequenceProbability(s, bpmnObj, jsonObj) > probability){probability = getSequenceProbability(s, bpmnObj, jsonObj);}
                });
            }
            else {
                previousSequences.forEach(s => {
                    probability = getGatewaySequenceProbability(Sequence, jsonObj) * getSequenceProbability(s, bpmnObj, jsonObj);
                });
            }
            break;
        }
    }
    return probability;
}

function getGatewaySequenceProbability(Sequence, jsonObj){
    //returns the probability of a sequence if the source is a gateway
    let probability = 1.0;
    jsonObj.gateway_branching_probabilities.forEach(element=>{
        if(element.gateway_id == Sequence.ATTR.sourceRef){
            element.probabilities.forEach(b=> {
                if(b.path_id == Sequence.ATTR.targetRef){
                    probability = b.value;
                }
            })
        }
    })
    return probability;
}