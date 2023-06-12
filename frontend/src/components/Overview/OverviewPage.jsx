import {
    Button,
    Spacer,
    Stack,
    Flex,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalFooter,
    ModalBody,
    ModalCloseButton,
    Card, CardHeader, CardBody, Heading, Box,
} from '@chakra-ui/react'



import {useState} from 'react'
import React from "react";
import {Switch} from '@chakra-ui/react'

import OverviewTable from '../TablesOverviewComparison/ScenarioOverviewTable';

import {useDisclosure} from '@chakra-ui/react'
import {Link} from "react-router-dom";



import CreateEmptyScenarioButton from '../CreateEmptyScenarioButton';


function OverviewPage({getData, toast, setScenariosCompare, parsed}) {

    // declaration of variables
    const {isOpen, onOpen, onClose} = useDisclosure()
    //const [setTabIndex] = useState(0)
    let [switches, setSwitches] = useState([]);
    const [switches_temp] = useState([]);
    const [switchList, setSwitchList] = useState([]);
    
    
    // method to handle changing switch state for scenarios comparison
    const handleChange = (id) => {
        setSwitches(switches.map(item => {
            if (item.id === id) {
                item.value = !item.value;
                if (switchList.includes(id)) {
                    setSwitchList(switchList.filter(id => item.id !== id));
                } else {
                    setSwitchList([...switchList, id]);
                }
            }
            return item;
        }))
    };

    // Array to store temporarily which switches are turned on => which scenarios are we comparing
    switches_temp.length = 0
    getData().getAllScenarios().map((element) => {
        switches_temp.push({id: element.scenarioName, value: true})
    });

// method to display on modal window(which scenarios are we comparing) every scenario except of current one
    const handleRemove = (idToRemove) => {
        const index = switches_temp.findIndex(item => item.id === idToRemove);
        if (index > -1) {
            switches_temp.splice(index, 1);
        }
    }

    //TODO throws bugs handleRemove(getData().getCurrentScenario().scenarioName);
    switches = switches_temp

//set switch list. In order to use the data(id of comparing scenarios on other pages
    setScenariosCompare(switchList)

    return (
        <>
            {/*Button Compare scenarios*/}
            <Box h="93vh" overflowY="auto" p="5">
                <Stack direction='column' spacing={4}>
                    <Stack direction='row' spacing={4}>
                        <Button colorScheme='#ECF4F4'
                                variant='outline'
                                border='1px'
                                borderColor='#B4C7C9'
                                color='#6E6E6F'
                                onClick={onOpen}
                                _hover={{bg: '#B4C7C9'}}>
                            Compare scenarios
                        </Button>
                        {/*Button Add new scenario*/}
                        <CreateEmptyScenarioButton {...{getData, toast}}
                                colorScheme='white'
                                variant='outline'
                                border='1px'
                                borderColor='#B4C7C9'
                                color='#6E6E6F'
                                _hover={{bg: '#B4C7C9'}}>
                            Add new empty scenario
                        </CreateEmptyScenarioButton>
                        
                        {/*Button New From Process Mining*/}
                        <Button as={Link} to="/processminer"
                                colorScheme='white'
                                variant='outline'
                                border='1px'
                                borderColor='#B4C7C9'
                                color='#6E6E6F'
                                _hover={{bg: '#B4C7C9'}}>
                            Add Scenario from Process Mining
                        </Button>
                        {/*Modal window(Window which opens on top of the page content to choose
                         which scenarios are we comparing) and its functionlaity*/}
                        <Modal isOpen={isOpen} onClose={onClose}>
                            <ModalOverlay/>
                            <ModalContent>
                                <ModalHeader>Scenarios to compare</ModalHeader>
                                <ModalCloseButton/>
                                <ModalBody>
                                    <Flex direction="column" align="left">
                                        {/*Creating Switch list(scenarios to compare) dynamically*/}
                                        {switches.map((switch1) => (
                                            <Switch
                                                key={switch1.id}
                                                checked={switch1.value}
                                                onChange={() => handleChange(switch1.id)}
                                                isChecked={switchList.includes(switch1.id)}
                                                marginTop="1rem">
                                                {switch1.id}
                                            </Switch>
                                        ))}
                                    </Flex>
                                </ModalBody>
                                <ModalFooter>
                                    <Button colorScheme='blue' mr={3} onClick={onClose} as={Link} to="/overview/compare">
                                        Compare
                                    </Button>
                                    <Button variant='ghost' onClick={onClose}>Close</Button>
                                </ModalFooter>
                            </ModalContent>
                        </Modal>
                    </Stack>
                    {/*Scenario Overview respresentation*/}
                    {/*Card is used to display tables on white background*/}
                    <Card bg="white" mt="25px">
                        <CardHeader>
                            <Heading size='md'>Project Scenarios Overview</Heading>
                        </CardHeader>
                        <CardBody>
                            {/*Call of Scenario Overview Table*/}
                            {(getData().getAllScenarios() && getData().getAllScenarios().length)
                                ? <OverviewTable getData={getData}/>
                                : <CardBody>
                                   No scenarios exist yet. <Button variant='link' as={Link} to="/processminer">Go to process miner view to create one</Button> or <CreateEmptyScenarioButton variant='link' {...{getData, toast, label:'create an empy scenario'}}/>
                                </CardBody>}
                        </CardBody>
                    </Card>
                </Stack>
            </Box>
        </>
    )
}


export default OverviewPage;