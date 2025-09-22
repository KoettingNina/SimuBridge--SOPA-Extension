import { ButtonGroup, Flex, FormControl, FormLabel, IconButton, Input, Select } from "@chakra-ui/react"
import { getParamsForDistribution } from "../util/Distributions"
import { AddIcon, MinusIcon } from "@chakra-ui/icons"
import { TimeUnits, DistributionTypes } from "simulation-bridge-datamodel/SimulationModelDescriptor"

export default function DistributionEditor({ state, setState, showTimeUnit, targetUnit}) {

    function setDistributionType(value) {
        const newState = {
            ...state,
            distributionType: value,
            distributionValues: new Array(DistributionTypes[value].distribution_params.length).fill(0)
        };
        setState(newState);
    }

    function setDistributionValues(value) {
        const newState = {
            ...state,
            distributionValues: value
        };
        setState(newState);
    }

    function setTimeUnit(value) {
        const newState = {
            ...state,
            timeUnit: value
        };
        setState(newState);
    }

    function camelCaseToSpaces(camelCaseString) {
        return camelCaseString
          .replace(/([a-z])([A-Z])/g, '$1 $2')
          .toLowerCase();
      }

    return <>
        <Flex justifyContent="space-between">
            <FormControl w="47%">
                <FormLabel>Distribution:</FormLabel>
                <Select name="distributionType" value={state.distributionType}  onChange={(event) => setDistributionType(event.target.value)}  bg="white" {...(!state.distributionType && {placeholder : 'Select distribution type', color : 'red'})} >
                    {Object.keys(DistributionTypes).map((distributionType, index) => {
                        return <option style={{ color: 'black' }} key={index} value={distributionType}>{distributionType}</option>
                    })}
                </Select>
            </FormControl>

            {showTimeUnit && (
                <FormControl w="47%">
                    <FormLabel>Time Unit:</FormLabel>
                    <Select name="timeUnit" value={state.timeUnit} onChange={(event) => setTimeUnit(event.target.value)} bg="white" {...(!state.timeUnit && {placeholder : 'Select timeunit', color : 'red'})}>
                        {Object.values(TimeUnits).map(timeUnit => <option style={{ color: 'black' }} key={timeUnit} value={timeUnit}>{timeUnit}</option>)}
                    </Select>
                </FormControl>
            )}

            {targetUnit && (
                <FormControl w="47%">
                    <FormLabel>
                        Target Unit: 
                    </FormLabel>
                    <Input
                        value={targetUnit}
                        isReadOnly
                                                
                    />
                </FormControl>
            )}
        </Flex>

        {state.distributionType === "arbitraryFiniteProbabilityDistribution" ?
            <ButtonGroup size='md' isAttached variant="outline" >
                <IconButton icon={<AddIcon />} onClick={() => setDistributionValues([...state.distributionValues, 0])} />
                <IconButton icon={<MinusIcon />} onClick={() => setDistributionValues(state.distributionValues.slice(0, -1)) /* Remove last element */} />
            </ButtonGroup>
            : ""}

        {getParamsForDistribution(state.distributionType, state.distributionValues)?.map((key, index) => {
            return <>

                <FormControl key={index}>
                    <FormLabel>{camelCaseToSpaces(key)}:</FormLabel>
                    <Input value={state.distributionValues[index]} bg="white" name="distributionValues" onChange={(event) => {
                        let newArr = [...state.distributionValues];
                        newArr[index] = event.target.value;
                        setDistributionValues(newArr);
                    }} />
                </FormControl></>

        })}
    </>
}