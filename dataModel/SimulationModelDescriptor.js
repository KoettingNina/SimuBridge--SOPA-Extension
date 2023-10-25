export const {TimeUnits, Currencies, DistributionTypes, Weekdays} = {
    TimeUnits: {
        SECONDS: "secs",
        MINUTES: "mins",
        HOURS: "hours"
    },

    Currencies : {
        EURO : "euro",
        DOLLAR : "dollar",
        UNSPECIFIED : 'Money Unit'
    },

    DistributionTypes : {
        exponential: { distribution_params: ["mean"] },
        normal: { distribution_params: ["mean", "variance"] },
        uniform: { distribution_params: ["lower", "upper"] },
        constant: { distribution_params: ["constantValue"] },
        erlang: { distribution_params: ["order", "mean"] },
        triangular: { distribution_params: ["lower", "peak", "upper"] },
        binomial: { distribution_params: ["probabiliy", "amount"] },
        arbitraryFiniteProbabilityDistribution: { distribution_params: [] }
    },

    
    Weekdays: {
        MONDAY: "Monday",
        TUESDAY: "Tuesday",
        WEDNESDAY: "Wednesday",
        THURSDAY: "Thursday",
        FRIDAY: "Friday",
        SATURDAY: "Saturday",
        SUNDAY: "Sunday"
    },
}


export const SimulationModelDescriptor = {
    "name": "Simulation Model",
    "prefix": "simulationmodel",
    "types": [
        {
            "name": "Scenario",
            "properties": [
                { "name": "scenarioName", "type": "String" },
                { "name": "startingDate", "type": "String" , default : "01-01-0000"},
                { "name": "startingTime", "type": "String" , default : "00:00" },
                { "name": "numberOfInstances", "type": "Integer", default : 1 },
                { "name": "currency", "type": "Currency", default : Currencies.EURO },
                { "name": "resourceParameters", "type": "ResourceParameters" },
                { "name": "models", "type": "Model", isMany : true },
            ]
        },


        {
            "name" : "ResourceParameters",
            "properties": [
                { "name": "roles", "type": "Role", isMany : true },
                { "name": "resources", "type": "Resource", isMany : true },
                { "name": "timeTables", "type": "Timetable", isMany : true }
            ]
        },

        {
            "name" : "Role",
            "properties": [
                { "name": "id", "type": "String"},
                { "name": "schedule", "type": "String" }, //TODO could be done with isReference and type Timetable
                { "name": "costHour", "type": "Real", default : 0.0 },
                { "name": "resources", "type": "String", isMany : true },  //TODO could be done with isReference and type Resource
            ]
        },

        {
            "name" : "Resource",
            "properties": [
                { "name": "id", "type": "String"},
                { "name": "schedule", "type": "String", default : null }, //TODO could be done with isReference and type Timetable
                { "name": "costHour", "type": "Real", default : null },
            ]
        },

        {
            "name" : "Timetable",
            "properties": [
                { "name": "id", "type": "String"},
                { "name": "timeTableItems", "type": "TimetableItem", isMany : true },
            ]
        },

        {
            "name" : "TimetableItem",
            "properties": [
                { "name": "startWeekday", "type": "Weekday"}, 
                { "name": "startTime", "type": "Integer"}, // TODO could be ... not integer?
                { "name": "endWeekday", "type": "Weekday"}, 
                { "name": "endTime", "type": "Integer"}, // TODO could be ... not integer?

            ]
        },


        {
            "name": "Model",
            "properties": [
                { "name": "BPMN", "type": "String" },
                { "name": "name", "type": "String" },
                { "name": "modelParameter", "type": "ModelParameter" }
            ]
        },

        {
            "name": "ModelParameter",
            "properties": [
                { "name": "activities", "type": "Activity", "isMany": true },
                { "name": "events", "type": "Event", "isMany": true },
                { "name": "gateways", "type": "Gateway", "isMany": true }
            ]
        },


        {
            "name": "ModelElement",
            "properties": [
                { "name": "id", "type": "String" }
            ]
        },

        {
            "name": "Activity",
            "superClass": ["ModelElement"],
            "properties": [
                { "name": "resources", "type": "String", "isMany": true },
                { "name": "cost", "type": "Real", "default": 0 },
                { "name": "duration", "type": "TimeDistribution" }
            ]
        },

        {
            "name": "Event",
            "superClass": ["ModelElement"],
            "properties": [
                { "name": "interArrivalTime", "type": "TimeDistribution" }
            ]
        },


        {
            "name": "Gateway",
            "superClass": ["ModelElement"],
            "properties": [
                { "name": "probabilities", "type": "String", default : {} } // TODO this shouldn't work, but it does. It is actually a map to String
            ]
        },

        {
            "name": "TimeDistribution",
            "superClass": ["Distribution"],
            "properties": [
                { "name": "timeUnit", "type": "TimeUnit" , "default" : TimeUnits.MINUTES}
            ]
        },

        {
            "name": "Distribution",
            "properties": [
                { "name": "distributionType","type": "DistributionType", isReference : true, "default" : null /** null is not undefined */},
                { "name": "values", "type": "Real", "isMany": true }
            ]
        }


    ],
    // Own Syntax
    "enumerations": [
        { "name": "TimeUnit", "type": "String", values : TimeUnits },
        { "name": "Currency", "type": "String", values : Currencies },
        { "name": "Weekday", "type": "String", values : Weekdays },
        { "name": "DistributionType", "type": "Element", values : DistributionTypes, "isNullable" : true },
    ]
}

export default SimulationModelDescriptor;