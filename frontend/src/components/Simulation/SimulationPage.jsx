import React, { useState, useRef } from "react";
import { Flex, Heading, Card, CardHeader, CardBody, Text, Select, Stack, Button, Progress, Box, Textarea, UnorderedList, ListItem } from '@chakra-ui/react';
import { FiChevronDown } from 'react-icons/fi';
import axios from 'axios';

const SimulationPage = ({ data, setScenario, toasting }) => {

// Setting initial states of started, finished, and response
  const [started, setStarted] = useState(false);
  const [finished, setFinished] = useState(false);
  const [response, setResponse] = useState({});

  // Creating a reference to the source that can be cancelled if needed
  const source = useRef(null);

  // function to start the simulation
  const start = async () => {
    // Resetting response and finished states
    setResponse({ message: "", files: [{ name: "", link: "" }] });
    setFinished(false);
    // Updating the started state
    setStarted(true);

    // Creating a cancel token and assigning it to the current source
    source.current = axios.CancelToken.source();

    try {

      var projectid = 'helloworld' + Math.random();
      var formData = new FormData();
      var bpmnFile = new File([`<?xml version="1.0" encoding="UTF-8"?>
      <bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" xmlns:di="http://www.omg.org/spec/DD/20100524/DI" xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" id="Definitions_1" targetNamespace="http://bpmn.io/schema/bpmn" exporter="bpmn-js (https://demo.bpmn.io)" exporterVersion="11.3.1">
        <bpmn:error id="sid-527c85e4-2e57-43d3-9918-25016a1aae3d" name="Ablehnung" errorCode="501" />
        <bpmn:error id="sid-527c85e4-2e57-43d3-9918-25016a1aae3e" name="Antwort" errorCode="502" />
        <bpmn:process id="Process_1" isExecutable="true">
          <bpmn:exclusiveGateway id="ExclusiveGateway_1njun59">
            <bpmn:incoming>SequenceFlow_1xeviwp</bpmn:incoming>
            <bpmn:outgoing>SequenceFlow_0s080ub</bpmn:outgoing>
            <bpmn:outgoing>Flow_15g757k</bpmn:outgoing>
          </bpmn:exclusiveGateway>
          <bpmn:endEvent id="EndEvent_1cyfi3n" name="pizza ready">
            <bpmn:incoming>Flow_0vsr6h1</bpmn:incoming>
          </bpmn:endEvent>
          <bpmn:endEvent id="EndEvent_0b4zsh7" name="order refused">
            <bpmn:incoming>Flow_15g757k</bpmn:incoming>
          </bpmn:endEvent>
          <bpmn:startEvent id="StartEvent_1vcwaly" name="pizza order incoming">
            <bpmn:outgoing>Flow_05eo31w</bpmn:outgoing>
            <bpmn:messageEventDefinition />
          </bpmn:startEvent>
          <bpmn:sequenceFlow id="SequenceFlow_1xeviwp" sourceRef="UserTask_12gn4u1" targetRef="ExclusiveGateway_1njun59" />
          <bpmn:sequenceFlow id="SequenceFlow_0s080ub" sourceRef="ExclusiveGateway_1njun59" targetRef="Activity_1l5gi07" />
          <bpmn:sequenceFlow id="Flow_05eo31w" sourceRef="StartEvent_1vcwaly" targetRef="UserTask_12gn4u1" />
          <bpmn:sequenceFlow id="Flow_15g757k" sourceRef="ExclusiveGateway_1njun59" targetRef="EndEvent_0b4zsh7" />
          <bpmn:task id="UserTask_12gn4u1" name="check ingredients stock">
            <bpmn:incoming>Flow_05eo31w</bpmn:incoming>
            <bpmn:outgoing>SequenceFlow_1xeviwp</bpmn:outgoing>
          </bpmn:task>
          <bpmn:task id="Activity_1l5gi07" name="take dough">
            <bpmn:incoming>SequenceFlow_0s080ub</bpmn:incoming>
            <bpmn:outgoing>Flow_1eaqf1h</bpmn:outgoing>
          </bpmn:task>
          <bpmn:sequenceFlow id="Flow_1eaqf1h" sourceRef="Activity_1l5gi07" targetRef="Activity_0ef7i1o" />
          <bpmn:task id="Activity_0ef7i1o" name="add tomato sauce">
            <bpmn:incoming>Flow_1eaqf1h</bpmn:incoming>
            <bpmn:outgoing>Flow_18levep</bpmn:outgoing>
          </bpmn:task>
          <bpmn:sequenceFlow id="Flow_18levep" sourceRef="Activity_0ef7i1o" targetRef="Activity_1mz4zmw" />
          <bpmn:task id="Activity_1mz4zmw" name="add toppings">
            <bpmn:incoming>Flow_18levep</bpmn:incoming>
            <bpmn:outgoing>Flow_1r4w9r3</bpmn:outgoing>
          </bpmn:task>
          <bpmn:sequenceFlow id="Flow_1r4w9r3" sourceRef="Activity_1mz4zmw" targetRef="Activity_0guqyey" />
          <bpmn:task id="Activity_0guqyey" name="bake">
            <bpmn:incoming>Flow_1r4w9r3</bpmn:incoming>
            <bpmn:outgoing>Flow_0vsr6h1</bpmn:outgoing>
          </bpmn:task>
          <bpmn:sequenceFlow id="Flow_0vsr6h1" sourceRef="Activity_0guqyey" targetRef="EndEvent_1cyfi3n" />
        </bpmn:process>
        <bpmndi:BPMNDiagram id="BPMNDiagram_1">
          <bpmndi:BPMNPlane id="BPMNPlane_1" bpmnElement="Process_1">
            <bpmndi:BPMNShape id="ExclusiveGateway_1njun59_di" bpmnElement="ExclusiveGateway_1njun59" isMarkerVisible="true">
              <dc:Bounds x="530" y="185" width="50" height="50" />
              <bpmndi:BPMNLabel>
                <dc:Bounds x="685" y="320" width="90" height="12" />
              </bpmndi:BPMNLabel>
            </bpmndi:BPMNShape>
            <bpmndi:BPMNShape id="EndEvent_0b4zsh7_di" bpmnElement="EndEvent_0b4zsh7">
              <dc:Bounds x="842" y="304" width="36" height="36" />
              <bpmndi:BPMNLabel>
                <dc:Bounds x="827" y="344" width="68" height="14" />
              </bpmndi:BPMNLabel>
            </bpmndi:BPMNShape>
            <bpmndi:BPMNShape id="StartEvent_1vcwaly_di" bpmnElement="StartEvent_1vcwaly">
              <dc:Bounds x="162" y="192" width="36" height="36" />
              <bpmndi:BPMNLabel>
                <dc:Bounds x="152" y="245" width="56" height="27" />
              </bpmndi:BPMNLabel>
            </bpmndi:BPMNShape>
            <bpmndi:BPMNShape id="Activity_1l5gi07_di" bpmnElement="Activity_1l5gi07">
              <dc:Bounds x="600" y="59" width="100" height="80" />
              <bpmndi:BPMNLabel />
            </bpmndi:BPMNShape>
            <bpmndi:BPMNShape id="Activity_05zx7zc_di" bpmnElement="UserTask_12gn4u1">
              <dc:Bounds x="270" y="170" width="100" height="80" />
              <bpmndi:BPMNLabel />
            </bpmndi:BPMNShape>
            <bpmndi:BPMNShape id="EndEvent_1cyfi3n_di" bpmnElement="EndEvent_1cyfi3n">
              <dc:Bounds x="1212" y="81" width="36" height="36" />
              <bpmndi:BPMNLabel>
                <dc:Bounds x="1202" y="121" width="58" height="14" />
              </bpmndi:BPMNLabel>
            </bpmndi:BPMNShape>
            <bpmndi:BPMNShape id="Activity_0ef7i1o_di" bpmnElement="Activity_0ef7i1o">
              <dc:Bounds x="760" y="59" width="100" height="80" />
              <bpmndi:BPMNLabel />
            </bpmndi:BPMNShape>
            <bpmndi:BPMNShape id="Activity_1mz4zmw_di" bpmnElement="Activity_1mz4zmw">
              <dc:Bounds x="930" y="59" width="100" height="80" />
              <bpmndi:BPMNLabel />
            </bpmndi:BPMNShape>
            <bpmndi:BPMNShape id="Activity_0guqyey_di" bpmnElement="Activity_0guqyey">
              <dc:Bounds x="1060" y="59" width="100" height="80" />
              <bpmndi:BPMNLabel />
            </bpmndi:BPMNShape>
            <bpmndi:BPMNEdge id="SequenceFlow_1xeviwp_di" bpmnElement="SequenceFlow_1xeviwp">
              <di:waypoint x="370" y="210" />
              <di:waypoint x="530" y="210" />
              <bpmndi:BPMNLabel>
                <dc:Bounds x="628" y="270" width="90" height="12" />
              </bpmndi:BPMNLabel>
            </bpmndi:BPMNEdge>
            <bpmndi:BPMNEdge id="SequenceFlow_0s080ub_di" bpmnElement="SequenceFlow_0s080ub">
              <di:waypoint x="555" y="185" />
              <di:waypoint x="555" y="99" />
              <di:waypoint x="600" y="99" />
              <bpmndi:BPMNLabel>
                <dc:Bounds x="700" y="208" width="90" height="12" />
              </bpmndi:BPMNLabel>
            </bpmndi:BPMNEdge>
            <bpmndi:BPMNEdge id="Flow_05eo31w_di" bpmnElement="Flow_05eo31w">
              <di:waypoint x="198" y="210" />
              <di:waypoint x="270" y="210" />
            </bpmndi:BPMNEdge>
            <bpmndi:BPMNEdge id="Flow_15g757k_di" bpmnElement="Flow_15g757k">
              <di:waypoint x="555" y="235" />
              <di:waypoint x="555" y="322" />
              <di:waypoint x="842" y="322" />
            </bpmndi:BPMNEdge>
            <bpmndi:BPMNEdge id="Flow_1eaqf1h_di" bpmnElement="Flow_1eaqf1h">
              <di:waypoint x="700" y="99" />
              <di:waypoint x="760" y="99" />
            </bpmndi:BPMNEdge>
            <bpmndi:BPMNEdge id="Flow_18levep_di" bpmnElement="Flow_18levep">
              <di:waypoint x="860" y="99" />
              <di:waypoint x="930" y="99" />
            </bpmndi:BPMNEdge>
            <bpmndi:BPMNEdge id="Flow_1r4w9r3_di" bpmnElement="Flow_1r4w9r3">
              <di:waypoint x="1030" y="99" />
              <di:waypoint x="1060" y="99" />
            </bpmndi:BPMNEdge>
            <bpmndi:BPMNEdge id="Flow_0vsr6h1_di" bpmnElement="Flow_0vsr6h1">
              <di:waypoint x="1160" y="99" />
              <di:waypoint x="1212" y="99" />
            </bpmndi:BPMNEdge>
          </bpmndi:BPMNPlane>
        </bpmndi:BPMNDiagram>
      </bpmn:definitions>
      `], "test.bpmn");
      var paramFile = new File([`[
        {
          "scenarioName": "Scenario 1",
          "startingDate": "14-02-2023",
          "startingTime": "14:00",
          "numberOfInstances": 4,
          "interArrivalTime": {
            "distributionType": "normal",
            "values": [
              {
                "id": "mean",
                "value": 10
              },
              {
                "id": "variance",
                "value": 3
              }
            ]
          },
          "timeUnit": "mins",
          "currency": "money unit",
          "resourceParameters": {
            "resources": [
              {
                "id": "Manager",
                "costHour": 40,
                "numberOfInstances": 1,
                "schedule": "8hPerWeek"
              },
              {
                "id": "PizzaBaker",
                "costHour": 30,
                "numberOfInstances": 2,
                "schedule": "8hPerWeek"
              },
              {
                "id": "Waiter",
                "costHour": 30,
                "numberOfInstances": 3,
                "schedule": "8hPerWeek"
              },
              {
                "id": "Accountant",
                "costHour": 30,
                "numberOfInstances": 1,
                "schedule": "8hPerWeek"
              }
            ],
            "roles": [
              {
                "id": "Top Management",
                "schedule": "8hPerWeek",
                "resources": [
                  {
                    "id": "Manager"
                  }
                ]
              },
              {
                "id": "Finance",
                "schedule": "7/24",
                "resources": [
                  {
                    "id": "Accountant"
                  }
                ]
              },
              {
                "id": "Restaurant",
                "schedule": "7/24",
                "resources": [
                  {
                    "id": "Waiter",
                    "id": "PizzaBaker"
                  }
                ]
              }
            ],
            "timeTables": [
              {
                "id": "8hPerWeek",
                "timeTableItems": [
                  {
                    "startWeekday": "Monday",
                    "startTime": "09",
                    "endWeekday": "Monday",
                    "endTime": "17"
                  }
                ]
              },
              {
                "id": "7/24",
                "timeTableItems": [
                  {
                    "startWeekday": "Friday",
                    "startTime": "03",
                    "endWeekday": "Saturday",
                    "endTime": "13"
                  }
                ]
              },
              {
                "id": "special",
                "timeTableItems": [
                  {
                    "startWeekday": "Friday",
                    "startTime": "03",
                    "endWeekday": "Saturday",
                    "endTime": "17"
                  },
                  {
                    "startWeekday": "Tuesday",
                    "startTime": "09",
                    "endWeekday": "Tuesday",
                    "endTime": "10"
                  }
                ]
              }
            ]
          },
          "models": [
            {
              "BPMN": "pizza_order (1).bpmn",
              "name": "pizza_order (1)",
              "modelParameter": {
                "activities": [
                  {
                    "id": "Activity_1l5gi07",
                    "name": "take dough",
                    "type": "bpmn:Task",
                    "resources": [
                      "PizzaBaker"
                    ],
                    "unit": "mins",
                    "cost": 0,
                    "currency": "euro",
                    "duration": {
                      "distributionType": "normal",
                      "values": [
                        {
                          "id": "mean",
                          "value": 1
                        },
                        {
                          "id": "variance",
                          "value": 0.1
                        }
                      ]
                    },
                    "incoming": [
                      "SequenceFlow_0s080ub"
                    ],
                    "outgoing": [
                      "Flow_1eaqf1h"
                    ]
                  },
                  {
                    "id": "UserTask_12gn4u1",
                    "name": "check ingredients stock",
                    "type": "bpmn:Task",
                    "resources": [
                      "Waiter"
                    ],
                    "unit": "mins",
                    "cost": 0,
                    "currency": "euro",
                    "duration": {
                      "distributionType": "normal",
                      "values": [
                        {
                          "id": "mean",
                          "value": 2
                        },
                        {
                          "id": "variance",
                          "value": 1
                        }
                      ]
                    },
                    "incoming": [
                      "Flow_05eo31w"
                    ],
                    "outgoing": [
                      "SequenceFlow_1xeviwp"
                    ]
                  },
                  {
                    "id": "Activity_0ef7i1o",
                    "name": "add tomato sauce",
                    "type": "bpmn:Task",
                    "resources": [
                      "PizzaBaker"
                    ],
                    "unit": "mins",
                    "cost": 0,
                    "currency": "euro",
                    "duration": {
                      "distributionType": "normal",
                      "values": [
                        {
                          "id": "mean",
                          "value": 2
                        },
                        {
                          "id": "variance",
                          "value": 0.4
                        }
                      ]
                    },
                    "incoming": [
                      "Flow_1eaqf1h"
                    ],
                    "outgoing": [
                      "Flow_18levep"
                    ]
                  },
                  {
                    "id": "Activity_1mz4zmw",
                    "name": "add toppings",
                    "type": "bpmn:Task",
                    "resources": [
                      "PizzaBaker"
                    ],
                    "unit": "mins",
                    "cost": 0,
                    "currency": "euro",
                    "duration": {
                      "distributionType": "normal",
                      "values": [
                        {
                          "id": "mean",
                          "value": 4
                        },
                        {
                          "id": "variance",
                          "value": 2
                        }
                      ]
                    },
                    "incoming": [
                      "Flow_18levep"
                    ],
                    "outgoing": [
                      "Flow_1r4w9r3"
                    ]
                  },
                  {
                    "id": "Activity_0guqyey",
                    "name": "bake",
                    "type": "bpmn:Task",
                    "resources": [
                      "PizzaBaker"
                    ],
                    "unit": "mins",
                    "cost": 0,
                    "currency": "euro",
                    "duration": {
                      "distributionType": "normal",
                      "values": [
                        {
                          "id": "mean",
                          "value": 10
                        },
                        {
                          "id": "variance",
                          "value": 1
                        }
                      ]
                    },
                    "incoming": [
                      "Flow_1r4w9r3"
                    ],
                    "outgoing": [
                      "Flow_0vsr6h1"
                    ]
                  }
                ],
                "gateways": [
                  {
                    "id": "ExclusiveGateway_1njun59",
                    "type": "bpmn:ExclusiveGateway",
                    "incoming": [
                      "SequenceFlow_1xeviwp"
                    ],
                    "outgoing": [
                      "SequenceFlow_0s080ub",
                      "Flow_15g757k"
                    ]
                  }
                ],
                "events": [
                  {
                    "id": "StartEvent_1vcwaly",
                    "name": "pizza order incoming",
                    "type": "bpmn:StartEvent",
                    "unit": "mins",
                    "interArrivalTime": {
                      "distributionType": "normal",
                      "values": [
                        {
                          "id": "mean",
                          "value": 5
                        },
                        {
                          "id": "variance",
                          "value": 1
                        }
                      ]
                    },
                    "incoming": [],
                    "outgoing": [
                      "Flow_05eo31w"
                    ]
                  },
                  {
                    "id": "EndEvent_0b4zsh7",
                    "name": "order refused",
                    "type": "bpmn:EndEvent",
                    "unit": "mins",
                    "interArrivalTime": {
                      "distributionType": "normal",
                      "values": [
                        {
                          "id": "mean",
                          "value": 5
                        },
                        {
                          "id": "variance",
                          "value": 1
                        }
                      ]
                    },
                    "incoming": [
                      "Flow_15g757k"
                    ],
                    "outgoing": []
                  },
                  {
                    "id": "EndEvent_1cyfi3n",
                    "name": "pizza ready",
                    "type": "bpmn:EndEvent",
                    "unit": "mins",
                    "interArrivalTime": {
                      "distributionType": "normal",
                      "values": [
                        {
                          "id": "mean",
                          "value": 5
                        },
                        {
                          "id": "variance",
                          "value": 1
                        }
                      ]
                    },
                    "incoming": [
                      "Flow_0vsr6h1"
                    ],
                    "outgoing": []
                  }
                ],
                "sequences": [
                  {
                    "id": "SequenceFlow_1xeviwp",
                    "type": "bpmn:SequenceFlow",
                    "probability": 1.0
                  },
                  {
                    "id": "SequenceFlow_0s080ub",
                    "type": "bpmn:SequenceFlow",
                    "probability": 0.23
                  },
                  {
                    "id": "Flow_05eo31w",
                    "type": "bpmn:SequenceFlow",
                    "probability": 1.0
                  },
                  {
                    "id": "Flow_15g757k",
                    "type": "bpmn:SequenceFlow",
                    "probability": 0.77
                  },
                  {
                    "id": "Flow_1eaqf1h",
                    "type": "bpmn:SequenceFlow",
                    "probability": 1.0
                  },
                  {
                    "id": "Flow_18levep",
                    "type": "bpmn:SequenceFlow",
                    "probability": 1.0
                  },
                  {
                    "id": "Flow_1r4w9r3",
                    "type": "bpmn:SequenceFlow",
                    "probability": 1.0
                  },
                  {
                    "id": "Flow_0vsr6h1",
                    "type": "bpmn:SequenceFlow",
                    "probability": 1.0
                  }
                ]
              }
            }
          ]
        }
      ]
      `], "testParam.json");
      formData.append("bpmn", bpmnFile, bpmnFile.name);
      formData.append("param", paramFile, paramFile.name);

      // Sending a POST request to apiTool.py in the Scylla-Container subproject, with the cancel token attached
      const r = await axios.post("http://127.0.0.1:8080/scyllaapi", formData, {
        headers: {
          'projectid' : projectid,
          'Content-Type': 'multipart/form-data'
        },
        cancelToken: source.current.token
      });

      // Setting the response state and updating the finished and started states
      setResponse(r.data);
      setFinished(true);
      setStarted(false);
      // Toasting a success message
      toasting("success", "Success", "Simulation was successful");
    } catch (err) {
      // If there's a cancellation error, toast a success message
      if (axios.isCancel(err)) {
        toasting("success", "Success", "Simulation was canceled");
      } else {
        // Otherwise, toast an error message
        console.log(err)
        toasting("error", "error", "Simulation was not successful");
      }
    }
  };

  // Function to abort the simulation
  const abort = () => {
    console.log("abort");
    // Cancelling the source and updating the finished and started states
    source.current.cancel("Simulation was canceled");
    setStarted(false);
    setResponse({ message: "canceled" });
  };

  //  function to download the file
  const download = async (data, fileName, encoding='charset=UTF-8') => {
    // Fetching the file, creating a blob and a URL
    const encodedData = encodeURIComponent(data);
    const a = document.createElement("a");
    // Creating a download link and triggering a click event
    const fileType = fileName.split('.').pop();

    a.href = 'data:application/' + fileType + ';' + encoding + ',' + encodedData;
    a.download = fileName;
    // a.download = `${sessionStorage.getItem("currentProject")}_${name}.${type}`;
    a.click();
  };



    return (
        <Box h="93vh" overflowY="auto" p="5" >
        <Stack gap="2">
        <Heading size='lg' >Run Simulation</Heading>

        {started&& 
        <Card bg="white" p="5" >
            <Progress isIndeterminate isAnimated hasStripe value={100} colorScheme="green" />
        </Card>}

        {finished&& 
        <Card bg="white" p="5" >
            <Progress  hasStripe value={100} colorScheme="green" />
        </Card>}
            <Card bg="white">
                <CardHeader>
                    <Heading size='ms'> Simulation settings </Heading>
                </CardHeader>
                <CardBody>
                  
                    <Flex
                        gap="5"
                        flexDirection="row"
                        alignItems="end"
                        mt="-4"
                        >               
                            <Box>
                                <Text fontSize="s" textAlign="start" color="#485152" fontWeight="bold" > Select scenario:</Text>
                                <Select placeholder = 'choose scenario' width = '100%' color="darkgrey" backgroundColor= 'white' icon={<FiChevronDown />}>
                                {data.map((scenario, index) => {
                                return  <option value= {scenario.scenarioName} onClick={() =>  setScenario(index)}>{scenario.scenarioName}</option>
                                })}
                                </Select>
                            </Box>
                            <Box>
                                <Text fontSize="s" textAlign="start" color="#485152" fontWeight="bold" > Select simulator:</Text>
                                <Select placeholder = 'choose simulator' width = '100%' color="darkgrey"  backgroundColor= 'white' icon={<FiChevronDown />}>
                                    <option value='Simod'>Scylla</option>
                                </Select>
                            </Box>
                            
                            {!started&& 
                            <Button variant="outline" bg="#FFFF" onClick={start} >
                                <Text color="RGBA(0, 0, 0, 0.64)" fontWeight="bold">Start Simulation</Text>
                            </Button>}

                            {started&& 
                            <Button variant="outline" bg="#FFFF" onClick={abort}>
                                <Text color="RGBA(0, 0, 0, 0.64)" fontWeight="bold">Abort Simulation</Text>
                            </Button>
                            }

                        </Flex>
                </CardBody>
            </Card>

            <Card bg="white">
                <CardHeader>
                    <Heading size='ms'> Simulator feedback </Heading>
                </CardHeader>
                <CardBody>
                    <Textarea isDisabled  value={response.message} />
                    {response.files && response.message && <>
                        <Heading size='ms' mt={5}>Click on the name of the file to download it:</Heading>
                        <UnorderedList>
                        {response.files.map(x => (<ListItem><Button onClick={() => download(x.data, x.name)} variant="link">{x.name}</Button></ListItem>)) }
                        </UnorderedList>
                    </>}
                </CardBody>
            </Card>
            
        
            
        </Stack>
        </Box>
    )
}
export default SimulationPage;