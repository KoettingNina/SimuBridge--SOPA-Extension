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


function OverviewResourceTable({scenario, setResource}) {

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
                {scenario.resourceParameters.roles.map((role) => {
                    return <Tr>
                        <Td>{role.id}</Td>
                        <Td> {role.resources.map((resource) => {
                            return <Text onClick={() => setResource(resource.id)}> {resource.id} </Text>
                        })} </Td>
                        <Td>{role.resources.map((res) => {
                            let resource = scenario.resourceParameters.resources.find(item => item.id === res.id)
                            return <Text>{resource.costHour || role.costHour} {scenario.currency + ' / h'}</Text>
                        })}</Td>
                        <Td>{role.schedule}</Td>
                    </Tr>
                })}
            </Tbody>
        </Table>
    )
}

export default OverviewResourceTable


