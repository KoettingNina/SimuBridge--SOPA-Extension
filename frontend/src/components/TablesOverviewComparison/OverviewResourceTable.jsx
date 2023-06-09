import React from "react";
import {
    Table,
    Thead,
    Tbody,
    Text,
    Tr,
    Th,
    Td
} from '@chakra-ui/react'


function OverviewResourceTable({getData, scenario_id, setResource}) {

    return (
        // Represenation of Resource Parameters for the chosen in the tabbar scenario
        <Table variant='simple' >
            <Thead>
                <Tr>
                    <Th>Role</Th>
                    <Th>Resource</Th>
                    <Th>Cost</Th>
                    <Th>Timetable</Th>
                </Tr>
            </Thead>
            <Tbody>
                {/*Filling in the table*/}
                {getData().getScenarioByIndex(scenario_id).resourceParameters.roles.map((role) => {
                    return <Tr>
                        <Td>{role.id}</Td>
                        <Td> {role.resources.map((resource) => {
                            return <Text onClick={() => setResource(resource.id)}> {resource.id} </Text>
                        })} </Td>
                        <Td>{role.resources.map((res) => {
                            let resource = getData().getScenarioByIndex(scenario_id).resourceParameters.resources.find(item => item.id === res.id)
                            return <Text>{resource.costHour || role.costHour} {getData().getScenarioByIndex(scenario_id).currency + ' / h'}</Text>
                        })}</Td>
                        <Td>{role.schedule}</Td>
                    </Tr>
                })}
            </Tbody>
        </Table>
    )
}

export default OverviewResourceTable


