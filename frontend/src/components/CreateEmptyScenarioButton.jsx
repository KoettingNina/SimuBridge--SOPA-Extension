import { Button } from "@chakra-ui/react";
import TimeUnits from "../util/TimeUnits";

export default ({getData, toast, label='Add new empty scenario', ...props}) => {
    return (<Button {...props} onClick={() => {
        let scenarioName = window.prompt('Please enter scenario name');
        if (scenarioName) {
            if (!getData().getScenario(scenarioName)) {
                getData().addScenario({
                    scenarioName: scenarioName,
                    startingDate: "01-01-0000",
                    startingTime: "00:00",
                    numberOfInstances: 1,
                    timeUnit: TimeUnits.MINUTES,
                    currency: "Money Unit", // TODO
                    resourceParameters : {
                        roles : [],
                        resources : [],
                        timeTables : []
                    },
                    models: []
                });
            } else {
                toast({
                    title: 'Scenario with that name already exist',
                    description: '',
                    status: 'error',
                    duration: 9000,
                    isClosable: true,
                });
            }
        }
    }}>{label}</Button>)
}