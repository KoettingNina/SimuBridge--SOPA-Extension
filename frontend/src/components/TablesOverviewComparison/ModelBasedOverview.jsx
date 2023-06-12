import {Card, CardBody, CardHeader, Flex, Heading, Text} from '@chakra-ui/react'
import {
    Table,
    Thead,
    Tbody,
    Tr,
    Th,
    Td,
    TableContainer,
} from '@chakra-ui/react'
import React from "react";
import { getElementLabel, getElementTypeName } from '../../util/BpmnUtil';

function sleep(time) {
    return new Promise((resolve) => setTimeout(resolve, time));
}

class ModelBasedOverview extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            parsed: false
        };
    }

    // check if data is available
    componentDidMount() {
        console.log(this.props.parsed)
        if (this.props.parsed) {
            this.setState({
                parsed: true,
            })
        }
    }

    componentDidUpdate(prevProps) {
        console.log(this.props.parsed)

        if (prevProps.parsed !== this.props.parsed) {
            sleep(500).then(() => {
                this.setState({
                    parsed: true
                })
            });
        }
    }

    render() {
        const currentModel = this.props.currentModel;
        return (
            <>
                {/*check if data is available*/}
                {currentModel && 
                    <>
                        {/*Representation of Model-based Parameters - Activities */}
                        <Card bg="white" mt="25px" overflowX="scroll">
                            <CardHeader>
                                <Heading size='md'>Model-based Parameters - Activities</Heading>
                            </CardHeader>
                            <CardBody>
                                <Table variant='simple'>
                                    <Thead w="100%">
                                        <Tr>
                                            <Th>Activity</Th>
                                            <Th>Resource</Th>
                                            <Th>Duration</Th>
                                            <Th>Duration Data</Th>
                                            <Th>TimeUnit</Th>
                                            <Th>Cost</Th>
                                        </Tr>
                                    </Thead>
                                    <Tbody>
                                        {currentModel.modelParameter.activities.map((element) => {
                                            return <>
                                                <Tr>
                                                    <Td>{currentModel.elementsById[element.id]?.name}</Td>
                                                    <Td>
                                                        {element.resources.map((resource) => {
                                                            return <Text> {resource} </Text>
                                                        })}
                                                    </Td>
                                                    <Td>{element.duration.distributionType}</Td>
                                                    <Td>{element.duration.values.map((value) => {
                                                        return <Text>{value.id + ": " + value.value}</Text>
                                                    })}</Td>
                                                    <Td>{element.unit}</Td>
                                                    <Td>{element.cost}</Td>
                                                </Tr>
                                            </>

                                        })}
                                    </Tbody>
                                </Table>
                            </CardBody>
                        </Card>
                        {/* Representation of Model-based Parameter - Gateways*/}
                        <Card bg="white" mt="25px">
                            <CardHeader>
                                <Heading size='md'>Model-based Parameter - Gateways</Heading>
                            </CardHeader>
                            <CardBody>
                                <Table variant='simple'>
                                    <Thead w="100%">
                                        <Tr>
                                            <Th>ID</Th>
                                            <Th>Incoming element</Th>
                                            <Th>Outgoing element</Th>
                                            <Th>Type</Th>
                                        </Tr>
                                    </Thead>
                                    <Tbody>
                                        {currentModel.modelParameter.gateways.map((element) => {
                                            const modelElement = currentModel.elementsById[element.id];
                                            return <>
                                                <Tr>
                                                    <Td>{element.id}</Td>
                                                    <Td>{modelElement?.incoming.map((inc) => {
                                                        return <Text>{getElementLabel(inc.sourceRef)}</Text>
                                                    })}</Td>
                                                    <Td>{modelElement?.outgoing.map((out) => {
                                                        return <Text>{getElementLabel(out.targetRef)} ({element.probabilities?.[out.id] * 100}%)</Text>
                                                    })}</Td>
                                                    <Td>{getElementTypeName(modelElement)}</Td>
                                                </Tr>
                                            </>
                                        })}
                                    </Tbody>
                                </Table>
                            </CardBody>
                        </Card>
                        <Flex pt="20px">
                            {/* Representation of Model-based Parameters - Events*/}
                            <Card bg="white" w="100%">
                                <CardHeader>
                                    <Heading size='md'>Model-based Parameters - Events</Heading>
                                </CardHeader>
                                <CardBody>
                                    <TableContainer>
                                        <Table variant='simple'>
                                            <Thead>
                                                <Tr>
                                                    <Th>Event name</Th>
                                                    <Th>Event type</Th>
                                                    <Th>Inter-arrival time</Th>
                                                    <Th>Distribution data</Th>
                                                </Tr>
                                            </Thead>
                                            <Tbody>
                                                {currentModel.modelParameter.events.map((element) => {
                                                    const modelElement = currentModel.elementsById[element.id];
                                                    return <Tr>
                                                        <Td>{modelElement?.name || element.id}</Td>
                                                        <Td>{getElementTypeName(modelElement)}</Td>
                                                        {element.interArrivalTime && <Td>{element.interArrivalTime.distributionType}</Td>}
                                                        {element.interArrivalTime && <Td>{(element.interArrivalTime.values).map((value) => {
                                                            return <Text>{value.id + ": " + value.value}</Text>
                                                        })}</Td>}
                                                    </Tr>
                                                })}
                                            </Tbody>
                                        </Table>
                                    </TableContainer>
                                </CardBody>
                            </Card>
                        </Flex>
                    </>}
            </>
        );
    }
}

export default ModelBasedOverview


