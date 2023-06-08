import React from "react";
import {
    Table,
    Thead,
    Tbody,
    Tr,
    Th,
    Td,
    Text,
    Popover,
    PopoverTrigger,
    Button,
    Portal,
    PopoverContent,
    PopoverArrow,
    PopoverCloseButton,
    PopoverBody,
    Highlight,
} from '@chakra-ui/react'


function OverviewTableCompare(props) {

    // declaration of variables
    let scenario_name, x, distr_data = []

    /*this method checks if pop over window is needed.
     comparison logic: if Simulation Scenario  Parameter differ at any of compared scenarios it is added to scenDiff
     Here method incoming parameter is field_id. If this field_id is in the scenDiff, that means that this parameter
     (field_id) is different in some compared scenarios. That means that we need a window which shows this parameter value
     in all compared scenarios*/
    const isPopover = (field_id) => {
        if (props.scenDiff.includes(field_id)) {
            return true
        } else return false
    };

    return (
        //Table for scenario simulation parameters
        <Table variant='simple'>
            <Thead w="100%">
                <Tr>
                    <Th>Scenario</Th>
                    <Th>Starting date</Th>
                    <Th>Starting time</Th>
                    <Th>No. instances</Th>
                </Tr>
            </Thead>
            <Tbody>
                <Tr>
                    <Td>
                        {/*if isPopover returns false, we just display scenarioName,
                        as it is the same among all compared scenarios. If isPopover returns true we create a button.
                        Text of this button is value of the scenarioName parameter of current scenario.
                         If user clicks on button it works like a trigger, and shows values of scenarioName of all compared scenarios
                         The same logic is applied for all simulation scenario parameters
                  */}
                        {isPopover("scenarioName") === false ?
                            <Text>{props.getData().getCurrentScenario().scenarioName}</Text>
                            :
                            <Popover>
                                <PopoverTrigger>
                                    <Button>{props.getData().getCurrentScenario().scenarioName}</Button>
                                </PopoverTrigger>
                                <Portal>
                                    <PopoverContent bg='#dce5e6'>
                                        <PopoverArrow/>
                                        <PopoverCloseButton/>
                                        <PopoverBody>
                                            {props.getData().getAllScenarios().map((element) => {
                                                {
                                                    props.scenariosCompare.includes(element.scenarioName) === true ?
                                                        scenario_name = element.scenarioName :
                                                        scenario_name = null
                                                }
                                                return <div>{scenario_name}</div>
                                            })
                                            }
                                        </PopoverBody>
                                    </PopoverContent>
                                </Portal>
                            </Popover>
                        }
                    </Td>
                    <Td>
                        {/*if isPopover returns false, we just display starting Date,
                        as it is the same among all compared scenarios. If isPopover returns true we create a button.
                        Text of this button is value of the startingDate parameter of current scenario.
                         If user clicks on button it works like a trigger, and shows values of scenarioName of all compared scenarios
                         The same logic is applied for all simulation scenario parameters
                  */}
                        {isPopover("startingDate") === false ?
                            <Text>{props.getData().getCurrentScenario().startingDate}</Text>
                            :
                            <Popover>
                                <PopoverTrigger>
                                    <Button>{props.getData().getCurrentScenario().startingDate}</Button>
                                </PopoverTrigger>
                                <Portal>
                                    <PopoverContent bg='#dce5e6'>
                                        <PopoverArrow/>
                                        <PopoverCloseButton/>
                                        <PopoverBody>
                                            {props.getData().getAllScenarios().map((element) => {
                                                {
                                                    x = null
                                                    props.scenariosCompare.includes(element.scenarioName) === true ? x = element.scenarioName + ":" + " " + element.startingDate :
                                                        x = null
                                                }
                                                return <div>{x}</div>
                                            })
                                            }
                                        </PopoverBody>
                                    </PopoverContent>
                                </Portal>
                            </Popover>
                        }
                    </Td>
                    <Td>
                        {isPopover("startingTime") === false ?
                            <Text>{props.getData().getCurrentScenario().startingTime}</Text>
                            :
                            <Popover>
                                <PopoverTrigger>
                                    <Button>{props.getData().getCurrentScenario().startingTime}</Button>
                                </PopoverTrigger>
                                <Portal>
                                    <PopoverContent bg='#dce5e6'>
                                        <PopoverArrow/>
                                        <PopoverCloseButton/>
                                        <PopoverBody>
                                            {props.getData().getAllScenarios().map((element) => {
                                                {
                                                    x = null
                                                    props.scenariosCompare.includes(element.scenarioName) === true ? x = element.scenarioName + ":" + " " + element.startingTime :
                                                        x = null
                                                }
                                                return <div>{x}</div>
                                            })
                                            }
                                        </PopoverBody>
                                    </PopoverContent>
                                </Portal>
                            </Popover>
                        }
                    </Td>

                    <Td>
                        {isPopover("numberOfInstances") === false ?
                            <Text>{props.getData().getCurrentScenario().numberOfInstances}</Text>
                            :
                            <Popover>
                                <PopoverTrigger>
                                    <Button>{props.getData().getCurrentScenario().numberOfInstances}</Button>
                                </PopoverTrigger>
                                <Portal>
                                    <PopoverContent bg='#dce5e6'>
                                        <PopoverArrow/>
                                        <PopoverCloseButton/>
                                        <PopoverBody>
                                            {props.getData().getAllScenarios().map((element) => {
                                                {
                                                    x = null
                                                    props.scenariosCompare.includes(element.scenarioName) === true ? x = element.scenarioName + ":" + " " + element.numberOfInstances :
                                                        x = null
                                                }
                                                return <div>{x}</div>
                                            })
                                            }
                                        </PopoverBody>
                                    </PopoverContent>
                                </Portal>
                            </Popover>
                        }
                    </Td>
                </Tr>
            </Tbody>
        </Table>
    )
}

export default OverviewTableCompare


