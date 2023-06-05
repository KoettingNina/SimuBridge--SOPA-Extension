import React, { useEffect, useState } from 'react'
import { useToast, Box, Heading, Text, Card, CardBody, Table, Thead, Tbody, Tr, Th, Td, Radio, RadioGroup, Stack, Button, CardHeader, TableContainer } from "@chakra-ui/react";
import { DeleteIcon } from '@chakra-ui/icons'
import { EditorSidebarAlternate } from '../EditorSidebar/EditorSidebar';
import EditScenario from '../EditorSidebar/Scenario/EditScenario';
import AddScenario from '../EditorSidebar/Scenario/DuplicateScenario';

const ScenarioPage = ({ getData, setCurrentRightSideBar }) => {
    const toast = useToast();

    
    const [isInDuplicateMode, setIsInDuplicateMode] = useState(false);
    const [selectedScenario, setSelectedScenario] = useState("")

    // Run once when the component mounts to set selected scenario
    useEffect(() => {
        setSelectedScenario(0)
    }, []);

    useEffect(() => { 
        if (!isInDuplicateMode) {
            setCurrentRightSideBar(
                <EditorSidebarAlternate title='Edit Scenario' content={<EditScenario {...{getData, selectedScenario, setIsInDuplicateMode}}/>}/>
            )
        } else {
            setCurrentRightSideBar(
                <EditorSidebarAlternate title='Duplicate Scenario' content={<AddScenario {...{getData, selectedScenario, setIsInDuplicateMode}}/>}/>
            )
        }
    }, [isInDuplicateMode])

    // Define a function to delete a scenario
    const deleteScenario = (index) => {
        let data = [...getData().getAllScenarios()];

        // ensure that at least one scenario exist //TODO why?
        if (data.length > 1) {
            getData().deleteScenarioByIndex(index);
            setSelectedScenario(0);
        } else {
            toast({
                title: 'Cannot delete only scenario',
                description: "There must be at least one scenario.",
                status: 'error',
                duration: 9000,
                isClosable: true,
            });
        }
    }

    return (
        
            <Box h="93vh" p="5" overflowX="auto">
                <Stack spacing={5}>
                    <Card bg="white" w="100%"  >
                        <CardBody >
                            <CardHeader>
                                <Heading size='md'>Select Scenario</Heading>
                            </CardHeader>
                            <TableContainer>
                                <Table variant='simple' size="sm">
                                    <Thead>
                                        <Tr>
                                            <Th></Th>
                                            <Th>Name</Th>
                                            <Th>Starting date</Th>
                                            <Th>Starting time</Th>
                                            <Th>Replications</Th>
                                            <Th>Interarrival time distribution</Th>
                                            <Th>Distribution data</Th>
                                            <Th>Time Unit</Th>
                                            <Th>Currency</Th>
                                            <Th></Th>
                                        </Tr>
                                    </Thead>
                                    <Tbody>
                                        {getData().getAllScenarios() ?
                                            getData().getAllScenarios().map((scenario, index) => {
                                                return <Tr key={index}>
                                                    <Td>
                                                        <RadioGroup value={selectedScenario} onChange={() => { setIsInDuplicateMode(false); setSelectedScenario(index) }}>
                                                            <Radio value={index} colorScheme="green"></Radio>
                                                        </RadioGroup>
                                                    </Td>
                                                    <Td>{scenario.scenarioName}</Td>
                                                    <Td>{scenario.startingDate}</Td>
                                                    <Td>{scenario.startingTime}</Td>
                                                    <Td>{scenario.numberOfInstances}</Td>
                                                    <Td>{scenario.interArrivalTime.distributionType}</Td>
            
                                                    <Td>{scenario.interArrivalTime.values.map((value) => {return <Text>{value.id + ": " + value.value}</Text>})}</Td>
                                                    <Td>{scenario.timeUnit}</Td>
                                                    <Td>{scenario.currency}</Td>
                                                    
                                                    <Td> 
                                                        <Button colorScheme="gray" variant="ghost" onClick={() => deleteScenario(index)}><DeleteIcon color="gray" /></Button>
                                                    </Td>
                                                </Tr>
                                            })
                                        : ""}
                                    </Tbody>
                            
                                </Table>    
                                </TableContainer>
  
                        </CardBody>
                    </Card>
                   
                </Stack>
            </Box>
            
        );
    }


export default ScenarioPage;
