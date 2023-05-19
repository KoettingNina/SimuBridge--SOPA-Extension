import React, { useState, useRef } from "react";
import { Flex, Heading, Card, CardHeader, CardBody, Text, Select, Stack, Button, Progress, Box, Textarea, UnorderedList, ListItem } from '@chakra-ui/react';
import { FiChevronDown } from 'react-icons/fi';
import axios from 'axios';

import { getFile, getScenarioFileName, setFile } from "../../util/Storage";

const SimulationPage = ({projectName, data, toasting }) => {

// Setting initial states of started, finished, and response
  const [started, setStarted] = useState(false);
  const [finished, setFinished] = useState(false);
  const [response, setResponse] = useState({});

  const [scenario, setScenario] = useState();
  const [simulator, setSimulator] = useState();

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

      var projectid = 'helloworld' + Math.random(); //TODO helloworld
      var formData = new FormData();
      //var bpmnFile = new File([ await (await fetch(processModel)).text()], 'pizza_1.bpmn'); 
      //var paramFile = new File([JSON.stringify(simulationConfiguration)], 'pizza1.json'); // Attention: json file is directly imported
      var scenarioFileName = getScenarioFileName(scenario);
      let scenarioFileData = (await getFile(projectName, scenarioFileName)).data;
      var paramFile = new File([scenarioFileData], scenarioFileName.split('/').pop())
      var bpmnFileName = JSON.parse(scenarioFileData).modelPaths[0] //TODO magic string
      let bpmnFileData = (await getFile(projectName, bpmnFileName)).data;
      var bpmnFile = new File([bpmnFileData], bpmnFileName.split('/').pop())
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
      r.data.files.forEach(file => {
        setFile(projectName, projectid + '/' + file.name, file.data);
      })

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
                                <Select value={scenario} placeholder = 'choose scenario' width = '100%' {...(!scenario && {color: "gray"})} backgroundColor= 'white' icon={<FiChevronDown />}>
                                {
                                  data.map((scenario, index) => {
                                    return  <option value= {scenario.scenarioName} color="black" onClick={evt =>  setScenario(evt.target.value)}>{scenario.scenarioName}</option>
                                  })
                                }
                                </Select>
                            </Box>
                            <Box>
                                <Text fontSize="s" textAlign="start" color="#485152" fontWeight="bold" > Select simulator:</Text>
                                <Select value={simulator} placeholder = 'choose simulator' width = '100%'  {...(!simulator && {color: "gray"})}  backgroundColor= 'white' icon={<FiChevronDown />}>
                                    <option value='Scylla' color="black" onClick={evt => setSimulator(evt.target.value)}>Scylla</option>
                                </Select>
                            </Box>
                            
                            {!started&& 
                            <Button variant="outline" bg="#FFFF" onClick={start} disabled={!scenario || !simulator}>
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