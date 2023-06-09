import { Box, FormControl, FormLabel, Input, Stack } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { getElementLabel } from "../../../util/BpmnUtil";

import {
    debounce
} from 'min-dash';

export default function AbstractModelElementEditor({type, typeName, state, setState, currentElement, getData, emptyConfig, children, setSave}) {

    function getExistingElementConfiguration() {
        return getData().getCurrentModel().modelParameter[type].find(value => value.id === currentElement.id)
    }

    const debounceSave = debounce(getData().saveCurrentScenario.bind(getData()), 500);
    
    function save() {
        if (!getExistingElementConfiguration()) {
            getData().getCurrentModel().modelParameter[type].push({...state});
        } else {
            Object.assign(getExistingElementConfiguration(), state);
        }
        setState({...state}); //Ensure that state changes are notfied even before save and reload
        debounceSave();
    }
    
    useEffect(() => setState({... (getExistingElementConfiguration() || emptyConfig)}), [currentElement.id]);
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