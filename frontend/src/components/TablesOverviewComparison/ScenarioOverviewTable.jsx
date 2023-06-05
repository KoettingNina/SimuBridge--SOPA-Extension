import React from "react";
import {
    Table,
    Thead,
    Tbody,
    Tr,
    Th,
    Td, Text,
} from '@chakra-ui/react'
import CreateEmptyScenarioButton from "../CreateEmptyScenarioButton";


function OverviewTable({getData, toast}){

    return(<>
    {/* Displaying of general simulation parameters for all scenarios */}
              <Table variant='simple'>
                  <Thead w="100%">
                    <Tr>
                        <Th>Simulation</Th>
                        <Th>Starting date</Th>
                        <Th>Starting time</Th>
                        <Th>Replications</Th>
                        <Th>Inter-arrival Time:Distribution</Th>
                        <Th>Distribution Data</Th>
                        <Th>Time unit</Th>
                    </Tr>
                </Thead>
                <Tbody>
                    {/*Filling in the table*/}
                    {getData().getAllScenarios().map((scenario) => {
                        return <Tr>
                            <Td align="left">{scenario.scenarioName} </Td>
                            <Td align="left" >{scenario.startingDate}</Td>
                            <Td align="left" >{scenario.startingTime}</Td>
                            <Td align="left">{scenario.numberOfInstances}</Td>
                            <Td align="left">{scenario.interArrivalTime.distributionType}</Td>
                            <Td align="left">{scenario.interArrivalTime.values.map((distribution) => {
                                return <Text> {distribution.id} : {distribution.value} </Text>
                            })} </Td>
                            <Td>{scenario.timeUnit}</Td>
                        </Tr>
                    })}
                </Tbody>
            </Table>
            
            <CreateEmptyScenarioButton {...{getData, toast}}/>
            </>)
}

export default OverviewTable


