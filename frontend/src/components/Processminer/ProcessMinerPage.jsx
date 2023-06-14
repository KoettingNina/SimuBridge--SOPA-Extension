import React, { useState, useRef } from "react";
import { Flex, Heading, Card, CardHeader, CardBody, Text, Select, Stack, Button, Progress, Box, Textarea, UnorderedList, ListItem } from '@chakra-ui/react';
import { FiChevronDown } from 'react-icons/fi';
import axios from 'axios';
import Zip from 'jszip';
import untar from "js-untar";
import Gzip from 'pako';
import simodSampleConfiguration from '../../example_data/simod_input/config/sample.yml'
import { getFile, getFiles, setFile, uploadFileToProject } from "../../util/Storage";
import { convertSimodOutput } from "../../util/simod_converter";

const ProcessMinerPage = ({projectName, getData, toasting }) => {

// Setting initial states of started, finished, and response
  const [started, setStarted] = useState(false);
  const [finished, setFinished] = useState(false);
  const [errored, setErrored] = useState(false);
  const [response, setResponse] = useState({});
  const [logFile, setLogFile] = useState();
  const [miner, setMiner] = useState();
  
  const [configFile, setConfigFile] = useState();
  const [bpmnFile, setBpmnFile] = useState();

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
        var eventlogFile = new File([(await getFile(projectName, logFile)).data], logFile);
        var configurationFile = new File([ await (await fetch(simodSampleConfiguration)).text()], "sample.yml");  //TODO placeholder
        formData.append("configuration", new Blob([configurationFile], { type: 'application/yaml' }), configurationFile.name);
        formData.append("event_log", new Blob([eventlogFile], { type: 'application/xml' }), eventlogFile.name);

        const DEBUG = true;

        let status;
        if (!DEBUG) {        
            const r = await axios.post(apiAddress+"/discoveries", formData, {
                headers: {
                'Content-Type': 'multipart/form-data',
                }
            });

            const { request_id , request_status} = r.data
            console.log({request_id , request_status})

            if (request_status !== 'accepted') {
                throw 'Process mining request rejected'
            }
            
            toasting("success", "Success", "Process Mining successfully started");
            
            const maxWaitTimeMs = 360000;
            const waitStartTime = new Date().getTime();
            function sleep(milliseconds) {
                return new Promise(resolve => setTimeout(resolve, milliseconds));
            }

            while(true) {
                const status_request = await axios.get("http://127.0.0.1:8880/discoveries/"+request_id)
                status = status_request.data;
                console.log(status_request)
                if (status.request_status !== 'running') {
                    break;
                } else if (new Date().getTime() - waitStartTime > maxWaitTimeMs) {
                    throw "Process Mining timed out";
                }
                await sleep(5000);
            }
        } else {
            //TODO dummy
            status = {request_status : 'success', archive_url : 'http://0.0.0.0/discoveries/06c39378-f5da-4d9e-98c2-8fda5c61142a/06c39378-f5da-4d9e-98c2-8fda5c61142a.tar.gz'}
        }

        
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

            
            relevant_files.forEach(file => {
                
                setFile(projectName, 'simod_results/' + file.name, file.data);
            })
    
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

  function fileSelect(title, state, setState, filter, moreOptions=[]) {
    return <Box>
        <Text fontSize="s" textAlign="start" color="#485152" fontWeight="bold" >{title}</Text>
        <Select value={state} placeholder = {title} width = '100%' {...(!state && {color: "gray"})} backgroundColor= 'white' icon={<FiChevronDown />} onChange={(evt) => {setState(evt.target.value)}}>
        {
            fileList
                .filter(filter)
                .map((file, index) => {
                    return  <option key={index} value= {file} color="black">{file}</option>
                })
                .concat(moreOptions)
        }
        </Select>
    </Box>
  }

  const [fileList, setFileList] = useState([]);

    function updateFileList() {
        getFiles(projectName).then(newFileList => {
            if (fileList.join(',') !== newFileList.join(',')) {
                setFileList(newFileList);
            }
        });
    }

    updateFileList();

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
                        alignItems="top"
                        mt="-4"
                        >
                            <Box>         
                                {fileSelect('Select Event Log:', logFile, setLogFile, file => file.endsWith('.xes'))}
                                <Button /*variant="link"*/ onClick={() => {
                                    uploadFileToProject(projectName).then(file => {
                                        updateFileList();
                                        setLogFile(file);
                                    })
                                }}>Upload new Event Log</Button>
                            </Box>
                            <Box>
                                <Text fontSize="s" textAlign="start" color="#485152" fontWeight="bold" > Select Process Miner:</Text>
                                <Select value={miner} placeholder = 'choose miner' width = '100%' {...(!miner && {color: "gray"})}  backgroundColor= 'white' icon={<FiChevronDown />} onChange={evt => setMiner(evt.target.value)}>
                                    <option value='Simod' color="black">Simod</option>
                                </Select>
                            </Box>
                            
                            {!started&& 
                            <Button variant="outline" bg="#FFFF" onClick={start} disabled={!logFile || !miner}>
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
                    <Heading size='md'> Miner feedback </Heading>
                </CardHeader>
                <CardBody>
                    <Flex flexDirection='column' gap='5'>
                        <Textarea isDisabled value={response.message} />
                        {response.files && response.message && <>
                            <Heading size='ms' mt={5}>Click on the name of the file to download it:</Heading>
                            <UnorderedList>
                            {response.files.map(x => (<ListItem><Button onClick={() => download(x.data, x.name)} variant="link">{x.name}</Button></ListItem>)) }
                            </UnorderedList>
                        </>}

                            <Heading size='ms' mt='10'>Convert Miner Output to Scenario:</Heading>
                            <Flex
                            gap="15"
                            flexDirection="row"
                            alignItems="end"
                            >               
                                {fileSelect('Select .json Config File:', configFile, setConfigFile, file => file.endsWith('.json') && file.includes('simulation_parameters') && !file.includes('converted'))}
                                {fileSelect('Select Bpmn File:', bpmnFile, setBpmnFile, file => file.endsWith('.bpmn'))}
                                
                                <Button disabled={!configFile || !bpmnFile} onClick={async () => {
                                    console.log('Converting files ' + configFile + ' ' + bpmnFile)
                                    let converted = convertSimodOutput((await getFile(projectName, configFile)).data, (await getFile(projectName, bpmnFile)).data);

                                    let scenarioName = window.prompt('Please enter scenario name');
                                    if (scenarioName) {
                                        converted.scenarioName = scenarioName;
                                        getData().addScenario(converted);
                                    }
                                }}>
                                    <Text color="RGBA(0, 0, 0, 0.64)" fontWeight="bold">Convert to Scenario</Text>
                                </Button>

                            </Flex>
                    </Flex>
                </CardBody>
            </Card>
            
        
            
        </Stack>
        </Box>
    )
}
export default ProcessMinerPage;