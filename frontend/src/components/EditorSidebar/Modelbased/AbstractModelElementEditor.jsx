import { Box, FormControl, FormLabel, Input, Stack } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { getElementLabel } from "../../../util/BpmnUtil";

import {
    debounce
} from 'min-dash';
import SimulationModelModdle, { assign, limitToDataScheme } from "simulation-bridge-datamodel/DataModel";

export default function AbstractModelElementEditor({type, typeName, state, setState, currentElement, getData, moddleClass, children, setSave}) {

    function getExistingElementConfiguration() {
        return getData().getCurrentModel().modelParameter[type].find(value => value.id === currentElement.id)
    }

    const debounceSave = debounce(getData().saveCurrentScenario.bind(getData()), 500);
    
    function save() {
        if (!getExistingElementConfiguration()) {
            const newElementConfiguration = SimulationModelModdle.getInstance().create(moddleClass, state);
            getData().getCurrentModel().modelParameter[type].push(newElementConfiguration);
        } else {
            //TODO refactor the need for de- and re-moddleifying
            assign(getExistingElementConfiguration(), state);
        }
        setState({...state}); //Ensure that state changes are notfied even before save and reload
        debounceSave();
    }
    
    useEffect(() => setState({... (
        limitToDataScheme(getExistingElementConfiguration() || SimulationModelModdle.getInstance().create(moddleClass, {id : currentElement.id}))
    )}), [currentElement.id]);
    setSave(save);

    return (
        <Box w="100%">
            <Stack gap="2">
                <FormControl>
                <FormLabel>Selected {typeName}:</FormLabel>
                    <Input title="Test date" value={getElementLabel(currentElement)} type="inputRead" readOnly />
                </FormControl>
                {state && children}
            </Stack>
        </Box>
      );
}