import { ButtonGroup, Flex, FormControl, FormLabel, IconButton, Input, Select } from "@chakra-ui/react"
import { distributionTypes, getParamsForDistribution } from "../util/Distributions"
import { AddIcon, MinusIcon } from "@chakra-ui/icons"

export default function DistributionEditor({ state, setState }) {

    function setDistributionType(value) {
        setState({
            ...state,
            distributionType: value,
            distributionValues: new Array(distributionTypes[value].distribution_params.length).fill(0)
        })
    }

    function setDistributionValues(value) {
        setState({
            ...state,
            distributionValues: value
        })
    }

    function setTimeUnit(value) {
        setState({
            ...state,
            timeUnit: value
        });
    }

    return <>
        <Flex justifyContent="space-between">
            <FormControl w="47%">
                <FormLabel>Distribution:</FormLabel>
                <Select value={state.distributionType} bg="white" name="distributionType" onChange={(event) => setDistributionType(event.target.value)} >
                    {Object.keys(distributionTypes).map((distributionType, index) => {
                        return <option key={index} value={distributionType}>{distributionType}</option>
                    })}
                </Select>
            </FormControl>


            <FormControl w="47%">
                <FormLabel>Time Unit:</FormLabel>
                <Select name="timeUnit" value={state.timeUnit} onChange={(event) => setTimeUnit(event.target.value)} bg="white">
                    <option value='secs'>secs</option>
                    <option value='mins'>mins</option>
                </Select>

            </FormControl>
        </Flex>

        {state.distributionType === "arbitraryFiniteProbabilityDistribution" ?
            <ButtonGroup size='md' isAttached variant="outline" >
                <IconButton icon={<AddIcon />} onClick={() => setDistributionValues([...state.distributionValues, 0])} />
                <IconButton icon={<MinusIcon />} onClick={() => setDistributionValues(state.distributionValues.slice(0, -1)) /* Remove last element */} />
            </ButtonGroup>
            : ""}

        {getParamsForDistribution(state.distributionType, state.distributionValues)?.map((key, index) => {
            return <>

                <FormControl>
                    <FormLabel>{key}:</FormLabel>
                    <Input value={state.distributionValues[index]} bg="white" name="distributionValues" onChange={(event) => {
                        let newArr = [...state.distributionValues];
                        newArr[index] = event.target.value;
                        setDistributionValues(index, newArr);
                    }} />
                </FormControl></>

        })}
    </>
}