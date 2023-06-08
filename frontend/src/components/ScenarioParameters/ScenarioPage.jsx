import React, { useEffect, useState } from 'react'
import { useToast, Box, Heading, Text, Card, CardBody, Table, Thead, Tbody, Tr, Th, Td, Radio, RadioGroup, Stack, Button, CardHeader, TableContainer } from "@chakra-ui/react";
import { DeleteIcon } from '@chakra-ui/icons'
import { EditorSidebarAlternate } from '../EditorSidebar/EditorSidebar';
import EditScenario from '../EditorSidebar/Scenario/EditScenario';
import AddScenario from '../EditorSidebar/Scenario/DuplicateScenario';
import CreateEmptyScenarioButton from '../CreateEmptyScenarioButton';

const ScenarioPage = ({ getData, setCurrentRightSideBar }) => {
    const toast = useToast();

    
    const [isInDuplicateMode, setIsInDuplicateMode] = useState(false);

    useEffect(() => { 
        if (!isInDuplicateMode) {
            setCurrentRightSideBar(
                <EditorSidebarAlternate title='Edit Scenario' content={<EditScenario {...{getData, setIsInDuplicateMode}}/>}/>
            )
        } else {
            setCurrentRightSideBar(
                <EditorSidebarAlternate title='Duplicate Scenario' content={<AddScenario {...{getData, setIsInDuplicateMode}}/>}/>
            )
        }
    }, [isInDuplicateMode, getData().getCurrentScenario()]);

    // Define a function to delete a scenario
    const deleteScenario = (index) => {
        // ensure that at least one scenario exist //TODO why?
        if (getData().getAllScenarios().length > 1) {
            getData().deleteScenarioByIndex(index);
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
                                            <Th>No. instances</Th>
                                            <Th>Currency</Th>
                                            <Th></Th>
                                        </Tr>
                                    </Thead>
                                    <Tbody>
                                        {getData().getAllScenarios() ?
                                            getData().getAllScenarios().map((scenario, index) => {
                                                return <Tr key={index}>
                                                    <Td>
                                                        <RadioGroup value={getData().getAllScenarios().indexOf(getData().getCurrentScenario())} onChange={() => { setIsInDuplicateMode(false); getData().setCurrentScenario(scenario) }}>
                                                            <Radio value={index} colorScheme="green"></Radio>
                                                        </RadioGroup>
                                                    </Td>
                                                    <Td>{scenario.scenarioName}</Td>
                                                    <Td>{scenario.startingDate}</Td>
                                                    <Td>{scenario.startingTime}</Td>
                                                    <Td>{scenario.numberOfInstances}</Td>
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
                            <CreateEmptyScenarioButton {...{getData, toast}}/>
                        </CardBody>
                    </Card>
                   
                </Stack>
            </Box>
            
        );
    }


export default ScenarioPage;
