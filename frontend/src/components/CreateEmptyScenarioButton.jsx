import { Button } from "@chakra-ui/react";
import { scenario } from "simulation-bridge-datamodel/DataModel";

export default ({getData, toast, label='Add new empty scenario', ...props}) => {
    return (<Button {...props} onClick={() => {
        let scenarioName = window.prompt('Please enter scenario name');
        if (scenarioName) {
            if (!getData().getScenario(scenarioName)) {
                getData().addScenario(scenario(scenarioName));
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