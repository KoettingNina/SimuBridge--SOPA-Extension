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
    }

    getCurrentModel() {
        return this.props.currentModel;
    }

    makeRow(values) {
        return <Tr>
            {values.map((value, index) => <Td key={index}>{value}</Td>)}
        </Tr>
    }

    createActivityRow(element) {
        const modelElement = this.getCurrentModel().elementsById[element.id];
        return [
            modelElement?.name,
            element.resources.map((resource) => {
                return <Text> {resource} </Text>
            }),
            element.duration.distributionType,
            element.duration.values.map((value) => {
                return <Text>{value.id + ": " + value.value}</Text>
            }),
            element.unit,
            element.cost
        ]
    }

    createGatewayRow(element) {
        const modelElement = this.getCurrentModel().elementsById[element.id];
        return [
            element.id,
            modelElement?.incoming.map((inc) => {
                return <Text>{getElementLabel(inc.sourceRef)}</Text>
            }),
            modelElement?.outgoing.map((out) => {
                return <Text>{getElementLabel(out.targetRef)} ({element.probabilities?.[out.id] * 100}%)</Text>
            }),
            getElementTypeName(modelElement),
        ]
    }

    createEventRow(element) {
        const modelElement = this.getCurrentModel().elementsById[element.id];
        return [
            modelElement?.name || element.id,
            getElementTypeName(modelElement),
            element.interArrivalTime && element.interArrivalTime.distributionType,
            element.interArrivalTime && (element.interArrivalTime.values).map((value) => {
                return <Text>{value.id + ": " + value.value}</Text>
            }),
            element.interArrivalTime.timeUnit
        ]
    }

    render() {
        return (
            <>
                {/*check if data is available*/}
                {this.getCurrentModel() && 
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
                                        {this.getCurrentModel().modelParameter.activities.map((element) => this.makeRow(this.createActivityRow(element)))}
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
                                        {this.getCurrentModel().modelParameter.gateways.map((element) => this.makeRow(this.createGatewayRow(element)))}
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
                                                    <Th>TimeUnit</Th>
                                                </Tr>
                                            </Thead>
                                            <Tbody>
                                                {this.getCurrentModel().modelParameter.events.map((element) => this.makeRow(this.createEventRow(element)))}
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


