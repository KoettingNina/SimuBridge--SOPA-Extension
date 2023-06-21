export const TimeUnits = {
    SECONDS : "secs",
    MINUTES : "mins",
    HOURS : "hours"
}

export const Currencies = {
    EURO : "euro",
    DOLLAR : "dollar",
    UNSPECIFIED : 'Money Unit'
}

export const distributionTypes = {
    exponential: { distribution_params: ["mean"] },
    normal: { distribution_params: ["mean", "variance"] },
    uniform: { distribution_params: ["lower", "upper"] },
    constant: { distribution_params: ["constantValue"] },
    erlang: { distribution_params: ["order", "mean"] },
    triangular: { distribution_params: ["lower", "peak", "upper"] },
    binomial: { distribution_params: ["probabiliy", "amount"] },
    arbitraryFiniteProbabilityDistribution: { distribution_params: [] }
}

export function scenario(scenarioName) {
    return {
        scenarioName: scenarioName,
        startingDate: "01-01-0000",
        startingTime: "00:00",
        numberOfInstances: 1,
        currency: Currencies.EURO,
        resourceParameters: {
            roles: [],
            resources: [],
            timeTables: []
        },
        models: []
    }
}

//TODO role
//TODO resource
//TODO timetables

export function model(modelName, bpmnXml) {
    return {
        BPMN : bpmnXml,
        name : modelName,
        modelParameter : {
            activities : [],
            events : [],
            gateways : [],
        }
    }
}

export function activity(elementId) {
    return {
        id : elementId,
        resources: [],
        cost: 0,
        duration: distribution()
      }
}

export function event(elementId) {
    return {
        id : elementId,
        interArrivalTime: distribution()
    }
}

export function gateway(elementId) {
    return {
        id : elementId,
        probabilities : {}
    }
}

export function distribution() {
    return {
        distributionType: undefined,
        timeUnit : TimeUnits.MINUTES,
        values: []
    }
}

// Eg. limitToDataScheme(myScenario, scenario /** the function */)
export function limitToDataScheme(object, dataScheme) {
    return Object.fromEntries(Object.entries(object).filter(([key, value]) => Object.keys(dataScheme()).includes(key)));
}