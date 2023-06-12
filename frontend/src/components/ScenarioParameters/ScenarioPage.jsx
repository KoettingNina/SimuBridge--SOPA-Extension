import React, { useEffect, useState } from 'react'
import { useToast, Box, Heading, Text, Card, CardBody, Table, Thead, Tbody, Tr, Th, Td, Radio, RadioGroup, Stack, Button, CardHeader, TableContainer } from "@chakra-ui/react";
import { DeleteIcon, EditIcon } from '@chakra-ui/icons'
import { EditorSidebarAlternate } from '../EditorSidebar/EditorSidebar';
import EditScenario from '../EditorSidebar/Scenario/EditScenario';
import AddScenario from '../EditorSidebar/Scenario/DuplicateScenario';
import CreateEmptyScenarioButton from '../CreateEmptyScenarioButton';
import ScenarioOverview from '../Overview/ScenarioOverview';

const ScenarioPage = ({ getData, setCurrentRightSideBar }) => {
    const toast = useToast();

    const [showSidebar, setShowSidebar] = useState(false);

    useEffect(() => { 
        if (showSidebar) {
            setCurrentRightSideBar(
                <EditorSidebarAlternate title='Edit Scenario' content={<EditScenario {...{getData, setShowSidebar}}/>}/>
            )
        } else {
            setCurrentRightSideBar(undefined)
        }
    }, [showSidebar, getData().getCurrentScenario()]);

    return (
        
            <Box h="93vh" p="5" overflowX="auto">
                <Stack spacing={5}>
                    <Heading size='lg' >Scenario {getData().getCurrentScenario().scenarioName}</Heading>
                    <Card bg="white" w="100%"  >
                        <CardHeader>
                            <Heading size='md'>General Parameters</Heading>
                        </CardHeader>
                        <CardBody >
                            <TableContainer>
                                <Table variant='simple' size="sm">
                                    <Thead>
                                        <Tr>
                                            <Th>Name</Th>
                                            <Th>Starting date</Th>
                                            <Th>Starting time</Th>
                                            <Th>No. instances</Th>
                                            <Th>Currency</Th>
                                            <Th></Th>
                                        </Tr>
                                    </Thead>
                                    <Tbody>
                                        {getData().getCurrentScenario() ?
                                                <Tr>
                                                    <Td>{getData().getCurrentScenario().scenarioName}</Td>
                                                    <Td>{getData().getCurrentScenario().startingDate}</Td>
                                                    <Td>{getData().getCurrentScenario().startingTime}</Td>
                                                    <Td>{getData().getCurrentScenario().numberOfInstances}</Td>
                                                    <Td>{getData().getCurrentScenario().currency}</Td>
                                                    <Td> 
                                                        <Button colorScheme="gray" variant="ghost" onClick={() => setShowSidebar(true)}>Edit<EditIcon color="gray" /></Button>
                                                    </Td>
                                                </Tr>
                                        : ""}
                                    </Tbody>
                            
                                </Table>    
                                </TableContainer>
                        </CardBody>
                    </Card>
                    
                    {/*Tabbar to switch between different scenarios*/}
                    <ScenarioOverview {...{getData}}/>
                   
                </Stack>
            </Box>
            
        );
    }


export default ScenarioPage;
