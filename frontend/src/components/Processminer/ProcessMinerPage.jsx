import React, { useState, useRef } from "react";
import { Flex, Heading, Card, CardHeader, CardBody, Text, Select, Stack, Button, Progress, Box, Textarea, UnorderedList, ListItem } from '@chakra-ui/react';
import { FiChevronDown } from 'react-icons/fi';
import axios from 'axios';
import Zip from 'jszip';
import untar from "js-untar";
import Gzip from 'pako';
import simodSampleConfiguration from '../../example_data/simod_input/config/sample.yml'
import { getFile, getFiles, setFile } from "../../util/Storage";

const ProcessMinerPage = ({projectName, data, setScenario, toasting }) => {

// Setting initial states of started, finished, and response
  const [started, setStarted] = useState(false);
  const [finished, setFinished] = useState(false);
  const [errored, setErrored] = useState(false);
  const [response, setResponse] = useState({});
  const [logFile, setLogFile] = useState();
  const [miner, setMiner] = useState();

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
            
            const maxWaitTimeMs = 180000;
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
            status = {request_status : 'success', archive_url : 'http://0.0.0.0/discoveries/30a2e4c4-6deb-4d85-8764-519179a68ad6/30a2e4c4-6deb-4d85-8764-519179a68ad6.tar.gz'}
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

  const [fileList, setFileList] = useState([]);

  getFiles(projectName).then(newFileList => {
      if (fileList.join(',') !== newFileList.join(',')) { //TODO nicer way to compare
          setFileList(newFileList);
      }
  });

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
                                <Text fontSize="s" textAlign="start" color="#485152" fontWeight="bold" > Select Event Log:</Text>
                                <Select value={logFile} placeholder = 'choose event log' width = '100%' {...(!logFile && {color: "gray"})} backgroundColor= 'white' icon={<FiChevronDown />}>
                                {
                                    fileList
                                        .filter(file => file.endsWith('.xes'))
                                        .map((file, index) => {
                                            return  <option value= {file} color="black" onClick={() => setLogFile(file)}>{file}</option>
                                        })
                                }
                                </Select>
                            </Box>
                            <Box>
                                <Text fontSize="s" textAlign="start" color="#485152" fontWeight="bold" > Select Process Miner:</Text>
                                <Select value={miner} placeholder = 'choose miner' width = '100%' {...(!miner && {color: "gray"})}  backgroundColor= 'white' icon={<FiChevronDown />}>
                                    <option value='Simod' color="black" onClick={evt => setMiner(evt.target.value)}>Simod</option>
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