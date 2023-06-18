import {
    Button,
    Spacer,
    Stack,
    Box,
} from '@chakra-ui/react';

import React from 'react'
import {useState} from 'react';
import {Card, CardHeader, CardBody, Heading,} from '@chakra-ui/react'
import {useDisclosure} from '@chakra-ui/react'
import {Link} from "react-router-dom"
import OverviewTableCompare from "../TablesOverviewComparison/OverviewTableCompare";
import ResourceTableCompare from "../TablesOverviewComparison/ResourceTableCompare";
import BPMNTableCompare from "../TablesOverviewComparison/BPMNTableCompare";


function ComparePage({getData, scenariosCompare, setNotSameScenario, resourceCompared, setResourceCompared}) {
// declaration of variables
    const {onOpen, onClose} = useDisclosure()
    let current_role, role = []
    let i, notsameRes = [], valueRes = [];
    const [notsameScenario, notSameScenario] = useState([]);
    const [scenDiff, myScenDiff] = useState([]);
    let newItem

    // method to check if two array are the same
    const equalsCheck = (a, b) => {
        return JSON.stringify(a) === JSON.stringify(b);
    }

    notsameScenario.length = 0

    // in this loop we compare resource parameters of current scenario with resource parameters of other chosen scenarios
    // if parameter does not exist or is different we add the parameter to the ResourceCompared array, we use this array
    // later for the displaying

    for (i = 0; i < getData().getAllScenarios().length; i++) {
        let scenarioToCompare = getData().getAllScenarios()[i];
        // check if this scenario is included to the comparison
        if (scenariosCompare.includes(scenarioToCompare.scenarioName)) {
            // check if generally are any differences
            if (scenarioToCompare.resourceParameters.resources !== getData().getCurrentScenario().resourceParameters.resources) {
                getData().getCurrentScenario().resourceParameters.resources.map((current_element) => {
                    // find role for the resources
                    for (let role of getData().getCurrentScenario().resourceParameters.roles) {
                        for (let resource of role.resources) {
                            if (resource.id === current_element.id) {
                                current_role = role.id;
                                break
                            } else current_role = "The resource does not exist for this role" //TODO this message seems odd
                        }
                    }
                    for (let roleToCompare of scenarioToCompare.resourceParameters.roles) {
                        for (let resource of roleToCompare.resources) {
                            if (resource.id === current_element.id) {
                                role = roleToCompare.id;
                                break
                            } else role = "The Role does not exist in role" //TODO this message seems odd
                        }
                    }
                    // compare role of the resources
                    if (current_role !== role) {
                        newItem = {
                            field: "role",
                            id: current_element.id,
                            value: current_role
                        }
                        resourceCompared.push(newItem);
                    }
                    let resource = scenarioToCompare.resourceParameters.resources.find(item => item.id === current_element.id)
                    // compare resource parameters
                    if (resource !== undefined) {
                        // compare costs
                        if (current_element.costHour !== resource.costHour) {
                            newItem = {
                                field: "costHour",
                                id: current_element.id,
                                value: current_element.costHour
                            }
                            resourceCompared.push(newItem);
                        }
                        // compare timetable
                        if (current_element.schedule !== resource.schedule) {
                            newItem = {
                                field: "schedule",
                                id: current_element.id,
                                value: current_element.schedule
                            }
                            resourceCompared.push(newItem);
                        }

                    }
                    // if current resource does not exist in one of the scenarios
                    else {
                        notsameRes.push(current_element.id)
                        valueRes.push(current_element.id)
                        newItem = {
                            field: "id",
                            id: current_element.id,
                            value: current_element.id
                        }
                        resourceCompared.push(newItem);
                    }
                })
            }
        } else {
        }
    }

    // Comparison of Simulation Scenario Parameters. If parameter is different for current scenario and other scenarios
    // we compare,
    // it's name is added to the scenDiff array
    for (i = 0; i < getData().getAllScenarios().length; i++) {
        let scenarioToCompare = getData().getAllScenarios()[i];

        if (scenariosCompare.includes(scenarioToCompare.scenarioName)) {

            if (scenarioToCompare.scenarioName !== getData().getCurrentScenario().scenarioName) {
                scenDiff[scenDiff.length] = "scenarioName";
            }

            if (scenarioToCompare.startingDate !== getData().getCurrentScenario().startingDate) {
                scenDiff[scenDiff.length] = "startingDate";
            }

            if (scenarioToCompare.startingTime !== getData().getCurrentScenario().startingTime) {
                scenDiff[scenDiff.length] = "startingTime";
            }
            if (scenarioToCompare.numberOfInstances !== getData().getCurrentScenario().numberOfInstances) {
                scenDiff[scenDiff.length] = "numberOfInstances";
            }
            if (scenarioToCompare.timeUnit !== getData().getCurrentScenario().timeUnit) {
                scenDiff[scenDiff.length] = "timeUnit";
            }

            if (scenarioToCompare.currency !== getData().getCurrentScenario().currency) {
                scenDiff[scenDiff.length] = "currency";
            }

        } else {
        }
    }

    // we compare parameters of current bpmn model of current scenario with the bpmn model of
    // other compared scenarios.

   //set array of different scenario simulation parameters for usage on other pages
    setNotSameScenario(scenDiff)
    // Here the index of current bpmn model is found
    let cur_model = getData().getCurrentScenario().models.indexOf(getData().getCurrentModel())

    // creating of new array with scenarios to compare ONLY
    //let compare = scenariosCompare.concat(getData().getCurrentScenario().scenarioName)
    const differentScenarios = getData().getAllScenarios().filter(item => scenariosCompare.includes(item.scenarioName))

    // in this loop we compare each activity parameter of bpmn model of current scenario with bpmns from other
    // compared scenario. if parameter is different we add it to ModelCompared array.
    // It is needed for further displaying
    // for (i = 0; i < differentScenarios.length; i++) {

    //     getData().getCurrentModel().modelParameter.activities.map((current_act) => {

    //         differentScenarios[i].models[cur_model].modelParameter.activities.map((act) => {
    //             // compare costs
    //             if (current_act.id === act.id) {
    //                 if (current_act.cost !== act.cost) {
    //                     newItem = {
    //                         field: "task_costs",
    //                         id: current_act.id,
    //                         value: current_act.cost
    //                     }
    //                     ModelCompared.push(newItem);
    //                 }
    //                 // compare time unit
    //                 if (current_act.unit !== act.unit) {
    //                     newItem = {
    //                         field: "timeUnit",
    //                         id: current_act.id,
    //                         value: current_act.unit
    //                     }
    //                     ModelCompared.push(newItem);
    //                 }
    //                 // compare currency
    //                 if (current_act.currency !== act.currency) {
    //                     newItem = {
    //                         field: "currency",
    //                         id: current_act.id,
    //                         value: current_act.currency
    //                     }
    //                     ModelCompared.push(newItem);

    //                 }
    //                 // compare distribution of the duration
    //                 if (current_act.duration.distributionType !== act.duration.distributionType) {
    //                     newItem = {
    //                         field: "distributionType",
    //                         id: current_act.id,
    //                         value: current_act.duration.distributionType
    //                     }
    //                     ModelCompared.push(newItem);

    //                 }
    //                 // compare distribution data
    //                 if (!equalsCheck(current_act.duration.values, act.duration.values)) {
    //                     newItem = {
    //                         field: "durationValues",
    //                         id: current_act.id,
    //                         value: current_act.id,
    //                     }
    //                     ModelCompared.push(newItem);
    //                 }
    //                 // compare resources
    //                 if (current_act.resources.length !== act.resources.length) {
    //                     newItem = {
    //                         field: "resources",
    //                         id: current_act.id,
    //                         value: "current_model.id",
    //                     }
    //                     ModelCompared.push(newItem);
    //                 } else {
    //                     for (let cur_res of current_act.resources) {
    //                         for (let res of act.resources) {
    //                             if (cur_res !== res) {
    //                                 newItem = {
    //                                     field: "resources",
    //                                     id: current_act.id,
    //                                     value: current_act.id,
    //                                 }
    //                                 ModelCompared.push(newItem);
    //                             }
    //                         }
    //                     }
    //                 }
    //                 // check if the activity of current bpmn exists in other bpmns
    //                // differentScenarios[i].models.map((d_models) => {
    //                     // console.log(cur_model)
    //                     let activity = differentScenarios[i].models[cur_model].modelParameter.activities.find(item => item.id === current_act.id)
    //                     if (activity === undefined) {
    //                         newItem = {
    //                             field: "activity",
    //                             id: current_act.id,
    //                             value: current_act.id,
    //                         }
    //                         ModelCompared.push(newItem);
    //                     }
    //               //  })
    //             }

    //         })
    //     })
    // }
    // // comparison of gateways
    // // in this loop we compare gateway parameters of bpmn model of current scenario with gateway parameters from other
    // // compared scenario. if parameter is different we add it to ModelCompared array.
    // // It is needed for further displaying
    // for (i = 0; i < differentScenarios.length; i++) {
    //     getData().getCurrentModel().modelParameter.gateways.map((current_model) => {
    //         differentScenarios[i].models[cur_model].modelParameter.gateways.map((model) => {
    //             let gateway = differentScenarios[i].models[cur_model].modelParameter.gateways.find(item => item.id === current_model.id)
    //             // check if gateway exists in other models
    //             if (gateway === undefined) {
    //                 newItem = {
    //                     field: "gateway",
    //                     id: current_model.id,
    //                     value: current_model.id,
    //                 }
    //                 ModelCompared.push(newItem);
    //             }
    //             // compare type of gateway
    //             if (current_model.id === model.id) {
    //                 if (current_model.type !== model.type) {
    //                     newItem = {
    //                         field: "gatewayType",
    //                         id: current_model.id,
    //                         value: current_model.type
    //                     }
    //                     ModelCompared.push(newItem);

    //                 }
    //                 //incoming activity
    //                 if (current_model.incoming !== model.incoming) {
    //                     newItem = {
    //                         field: "incoming",
    //                         id: current_model.id,
    //                         value: current_model.id
    //                     }
    //                     ModelCompared.push(newItem);

    //                 }
    //                 // compare probability
    //                 current_model.outgoing.map((out) => {
    //                     let sequence = getData().getCurrentModel().modelParameter.sequences.find(item => item.id === out)
    //                     if (sequence !== undefined) {
    //                         let current_probability = sequence.probability
    //                         let otherModel = differentScenarios[i].models[cur_model].modelParameter.sequences.find(item => item.id === out)
    //                         console.log("Other model probability " + otherModel.probability)
    //                         console.log("Current probability " + current_probability)
    //                         if (otherModel !== undefined) {
    //                             let otherModel_prob = otherModel.probability
    //                             if (current_probability !== otherModel.probability) {
    //                                 newItem = {
    //                                     field: "probability",
    //                                     id: current_model.id,
    //                                     value: current_model.id
    //                                 }
    //                                 ModelCompared.push(newItem);
    //                             }
    //                         }
    //                     }
    //                 })
    //                 // compare outgoing activities
    //                 if (current_model.outgoing !== model.outgoing) {
    //                     newItem = {
    //                         field: "outgoing",
    //                         id: current_model.id,
    //                         value: current_model.id
    //                     }
    //                     ModelCompared.push(newItem);

    //                 }
    //             }

    //         })
    //     })
    // }

    // // in this loop we compare  event parameters of bpmn model of current scenario with event parameters of the bpmns from other
    // // compared scenario. if parameter is different we add it to ModelCompared array.
    // // It is needed for further displaying
    // // comparison of events
    // for (i = 0; i < differentScenarios.length; i++) {
    //     getData().getCurrentModel().modelParameter.events.map((current_event) => {
    //         differentScenarios[i].models[cur_model].modelParameter.events.map((event) => {
    //             let event_ch = differentScenarios[i].models[cur_model].modelParameter.events.find(item => item.id === current_event.id)
    //             // check if gateway exists in other models
    //             if (event_ch === undefined) {
    //                 newItem = {
    //                     field: "event",
    //                     id: current_event.id,
    //                     value: current_event.id,
    //                 }
    //                 ModelCompared.push(newItem);
    //             }
    //             // compare type of event
    //             if (current_event.id === event.id) {
    //                 if (current_event.type !== event.type) {
    //                     newItem = {
    //                         field: "eventType",
    //                         id: current_event.id,
    //                         value: current_event.type
    //                     }
    //                     ModelCompared.push(newItem);

    //                 }
    //                 // interArrivalTime comparison
    //                 if (current_event.interArrivalTime) {
    //                     if (current_event.interArrivalTime.distributionType !== event.interArrivalTime.distributionType) {
    //                         newItem = {
    //                             field: "distributionTypeEvent",
    //                             id: current_event.id,
    //                             value: current_event.interArrivalTime.distributionType
    //                         }
    //                         ModelCompared.push(newItem);
    
    //                     }
    //                     // compare distribution data
    //                     if (!equalsCheck(current_event.interArrivalTime.values, event.interArrivalTime.values)) {
    //                         newItem = {
    //                             field: "durationValuesEvent",
    //                             id: current_event.id,
    //                             value: current_event.id,
    //                         }
    //                         ModelCompared.push(newItem);
    //                     }
    //                 }
    //             }

    //         })
    //     })
    // }
// this method allows to use ResourceCompared on other, not connected, pages (OnlyDiffirences Page)
    setResourceCompared(resourceCompared)

    return (
        <>
            {/*Button Go back*/}
            <Box h="93vh" overflowY="auto" p="5">
                <Stack direction='row' spacing={4} w="70vw">
                    <Button as={Link} to="/overview"
                            colorScheme='#ECF4F4'
                            variant='outline'
                            border='1px'
                            borderColor='#B4C7C9'
                            color='#6E6E6F'
                            onClick={onOpen}
                            _hover={{bg: '#B4C7C9'}}>
                        Go back
                    </Button>
                    <Spacer/>
                    <Spacer/>
                    {/*Button Show differences TODO reenable as soon as page is fixed*/}
                    {/* <Button as={Link} to="/overview/compare/differences"
                            colorScheme='white'
                            variant='outline'
                            border='1px'
                            borderColor='#B4C7C9'
                            color='#6E6E6F'
                            onClick={() => '/overview/compare/differences'}
                            _hover={{bg: '#B4C7C9'}}>
                        Show differences
                    </Button> */}
                </Stack>
                {/*Simulation Scenario are displayed*/}
                {/*Card is used to display table on white background */}
                <Card bg="white" mt="25px">
                    <CardHeader>
                        <Heading size='md'>Simulation Scenario Overview</Heading>
                    </CardHeader>
                    <CardBody>
                        {/*Call for another component - Table with compared Simulation Scenario Parameters*/}
                        <OverviewTableCompare getData={getData} scenDiff={scenDiff}
                                              scenariosCompare={scenariosCompare}/>
                    </CardBody>
                </Card>
                {/*Resource are displayed*/}
                <Card bg="white" mt="25px">
                    <CardHeader>
                        <Heading size='md'>Resource Overview</Heading>
                    </CardHeader>
                    <CardBody>
                        {/*Call for another component - Table with compared Resource Parameters*/}
                        <ResourceTableCompare getData={getData} scenDiff={scenDiff}
                                              scenariosCompare={scenariosCompare}
                                              notsameRes={notsameRes} valueRes={valueRes}
                                              ResourceCompared={resourceCompared}/>
                    </CardBody>
                </Card>
                {/*Call for another component - Tables with compared Model-based Parameters*/}
                <BPMNTableCompare {...{getData, scenariosCompare}}/>
            </Box>
        </>
    )
}


export default ComparePage;