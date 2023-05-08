import React, { useState, useRef } from "react";
import { Flex, Heading, Card, CardHeader, CardBody, Text, Select, Stack, Button, Progress, Box, Textarea, UnorderedList, ListItem } from '@chakra-ui/react';
import { FiChevronDown } from 'react-icons/fi';
import axios from 'axios';
import Zip from 'jszip';
import untar from "js-untar";
import Gzip from 'pako';
import configuration from '../../resources/config/sample.yml'
import event_log from '../../resources/event_logs/PurchasingExample.xes'

const ProcessMinerPage = ({ data, setScenario, toasting }) => {

// Setting initial states of started, finished, and response
  const [started, setStarted] = useState(false);
  const [finished, setFinished] = useState(false);
  const [errored, setErrored] = useState(false);
  const [response, setResponse] = useState({});

  // Creating a reference to the source that can be cancelled if needed
  const source = useRef(null);


  // function to start the Miner
  const start = async () => {
    // Resetting response and finished states
    setResponse({ message: "", files: [{ name: "", link: "" }] });
    setFinished(false);
    setErrored(false);
    // Updating the started state
    setStarted(true);

    // Creating a cancel token and assigning it to the current source
    source.current = axios.CancelToken.source();

    try {
        const apiAddress = 'http://127.0.0.1:8880'
        var projectid = 'helloworld' + Math.random();
        var formData = new FormData();
        var eventlogFile = new File([ await (await fetch(event_log)).text()], "PurchasingExamples.xes");
        var configurationFile = new File([ await (await fetch(configuration)).text()], "sample.yml");  
        formData.append("configuration", new Blob([configurationFile], { type: 'application/yaml' }), configurationFile.name);
        formData.append("event_log", new Blob([eventlogFile], { type: 'application/xml' }), eventlogFile.name);


        //const r = await axios.post("http://127.0.0.1:7070/simodapi", formData, {
        // const r = await axios.post(apiAddress+"/discoveries", formData, {
        //     headers: {
        //     'Content-Type': 'multipart/form-data',
        //     }
        // });

        // const { request_id , request_status} = r.data
        // console.log({request_id , request_status})

        // if (request_status !== 'accepted') {
        //     throw 'Process mining request rejected'
        // }
        
        // toasting("success", "Success", "Process Mining successfully started");
        
        // const maxWaitTimeMs = 180000;
        // const waitStartTime = new Date().getTime();
        // function sleep(milliseconds) {
        //     return new Promise(resolve => setTimeout(resolve, milliseconds));
        // }

        // let status;
        // while(true) {
        //     const status_request = await axios.get("http://127.0.0.1:8880/discoveries/"+request_id)
        //     status = status_request.data;
        //     console.log(status_request)
        //     if (status.request_status !== 'running') {
        //         break;
        //     } else if (new Date().getTime() - waitStartTime > maxWaitTimeMs) {
        //         throw "Process Mining timed out";
        //     }
        //     await sleep(5000);
        // }

        const status = {request_status : 'success', archive_url : 'http://0.0.0.0/discoveries/32cea143-a7f5-426a-9504-46266fef7ed4/32cea143-a7f5-426a-9504-46266fef7ed4.tar.gz'}

        if(status.request_status === 'success') {
            // console.log(`Request took ${ new Date().getTime() - r.config.meta.requestStartedAt} ms`)

            const result = await fetch(status.archive_url.replace('http://0.0.0.0', apiAddress));
            const raw = await result.arrayBuffer();
            const raw_tar = Gzip.inflate(raw).buffer
            console.log('Files:')
            console.log(raw_tar)
            // const foo = await (new Blob([files], {
            //     type: 'application/gzip',
            //   })).arrayBuffer();
              
            // console.log(typeof(foo));
            //const foo = await untar(new ArrayBuffer(await result.arrayBuffer()));
            const files = await untar(raw_tar);

            const relevant_files = files
                .filter(file => file.name.endsWith('.json') || file.name.endsWith('.bpmn'));
            relevant_files
                .forEach(file => {
                   //TODO simplify name
                   file.data = file.readAsString(); 
                });

            console.log(relevant_files)

    
            // Setting the response state and updating the finished and started states
            setResponse({
                message : 'Miner output currently not captured',
                files : relevant_files
            });
            setFinished(true);
            setStarted(false);
            // Toasting a success message
            toasting("success", "Success", "Process Mining was successful");

        } else {
            throw 'Process mining terminated unsuccessfully'
        }
    } catch (err) {
        setStarted(false);
        setFinished(true);
      // If there's a cancellation error, toast a success message
      if (axios.isCancel(err)) {
        toasting("success", "Success", "Process Mining was canceled");
      } else {
        // Otherwise, toast an error message
        console.log(err)
        toasting("error", "error", "Process Mining was not successful");
        setErrored(true);
      }
    }
  };

  // Function to abort the Process Mining
  const abort = () => {
    console.log("abort");
    // Cancelling the source and updating the finished and started states
    source.current.cancel("Process Mining was canceled");
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
        <Heading size='lg' >Run Miner</Heading>

        {started&& 
        <Card bg="white" p="5" >
            <Progress isIndeterminate isAnimated hasStripe value={100} colorScheme="green" />
        </Card>}

        {finished&&!errored&&
        <Card bg="white" p="5" >
            <Progress  hasStripe value={100} colorScheme="green" />
        </Card>}

        {finished&&errored&&
        <Card bg="white" p="5" >
            <Progress  hasStripe value={100} colorScheme="red" />
        </Card>}
            <Card bg="white">
                <CardHeader>
                    <Heading size='ms'> Process Miner settings </Heading>
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
                                <Select placeholder = 'choose miner' width = '100%' color="darkgrey"  backgroundColor= 'white' icon={<FiChevronDown />}>
                                    <option value='Simod'>Simod</option>
                                </Select>
                            </Box>
                            
                            {!started&& 
                            <Button variant="outline" bg="#FFFF" onClick={start} >
                                <Text color="RGBA(0, 0, 0, 0.64)" fontWeight="bold">Start Miner</Text>
                            </Button>}

                            {started&& 
                            <Button variant="outline" bg="#FFFF" onClick={abort}>
                                <Text color="RGBA(0, 0, 0, 0.64)" fontWeight="bold">Abort Miner</Text>
                            </Button>
                            }

                        </Flex>
                </CardBody>
            </Card>

            <Card bg="white">
                <CardHeader>
                    <Heading size='ms'> Miner feedback </Heading>
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
export default ProcessMinerPage;