import TimeUnits from "../util/TimeUnits";

export function scenario(scenarioName) {
    return {
        scenarioName: scenarioName,
        startingDate: "01-01-0000",
        startingTime: "00:00",
        numberOfInstances: 1,
        timeUnit: TimeUnits.MINUTES,
        currency: "Money Unit", // TODO
        resourceParameters: {
            roles: [],
            resources: [],
            timeTables: []
        },
        models: []
    }
}

export function model(modelName, bpmnXml) {
    return {
        BPMN : bpmnXml,
        name : modelName,
        modelParameter : {
            activities : [],
            events : [],
            gateways : [],
            sequences : []
        }
    }
}

// Eg. limitToDataScheme(myScenario, scenario /** the function */)
export function limitToDataScheme(object, dataScheme) {
    return Object.fromEntries(Object.entries(object).filter(([key, value]) => Object.keys(dataScheme()).includes(key)));
}