import React, { useState, useRef } from "react";
import { Flex, Heading, Card, CardHeader, CardBody, Text, Select, Stack, Button, Progress, Box, Textarea, UnorderedList, ListItem } from '@chakra-ui/react';
import { FiChevronDown } from 'react-icons/fi';
import axios from 'axios';
import untar from "js-untar";
import Gzip from 'pako';
import simodConfiguration from './simod_config.yml'
import { getFile, getFiles, setFile, uploadFileToProject } from "../../util/Storage";
import { convertSimodOutput } from "simulation-bridge-converter-simod/simod_converter";
import RunProgressIndicationBar from "../RunProgressIndicationBar";
import ToolRunOutputCard from "../ToolRunOutputCard";


function getNumberOfInstances(eventLog) {
    return eventLog.match(/<trace>/g)?.length || 100;
}

const ProcessMinerPage = ({projectName, getData, toasting }) => {

// Setting initial states of started, finished, and response
  const [started, setStarted] = useState(false);
  const [finished, setFinished] = useState(false);
  const [errored, setErrored] = useState(false);
  const [response, setResponse] = useState(JSON.parse(sessionStorage.getItem(projectName+'/lastMinerResponse')) || {});
  const [logFile, setLogFile] = useState();
  const [miner, setMiner] = useState();
  
  const [configFile, setConfigFile] = useState();
  const [bpmnFile, setBpmnFile] = useState();

  // Creating a reference to the source that can be cancelled if needed
  const source = useRef(null);


  // function to start the Miner
  const start = async () => {
    // Resetting response and finished states
    setResponse({ message: '', files: [] });
    setFinished(false);
    window.canceled = false;
    setErrored(false);
    // Updating the started state
    setStarted(true);

    // Creating a cancel token and assigning it to the current source
    source.current = axios.CancelToken.source();

    try {
        const apiAddress = 'http://127.0.0.1:8880';
        const formData = new FormData();
        const eventlogFile = new File([(await getFile(projectName, logFile)).data], logFile);
        const configurationFile = new File([ await (await fetch(simodConfiguration)).text()], "sample.yml");
        formData.append("configuration", new Blob([configurationFile], { type: 'application/yaml' }), configurationFile.name);
        formData.append("event_log", new Blob([eventlogFile], { type: 'application/xml' }), eventlogFile.name);

        const DEBUG = JSON.parse(sessionStorage.getItem('DEBUG'));

        let status;
        const requestStartTime = new Date().getTime();
        if (!DEBUG) {        
            const r = await axios.post(apiAddress+"/discoveries", formData, {
                headers: {
                'Content-Type': 'multipart/form-data',
                }
            });

            const { request_id , request_status} = r.data
            console.log({request_id , request_status})

            if (request_status !== 'accepted') {
                throw new Error('Process mining request rejected');
            }
            
            if (window.canceled) {
                throw new Error('Canceled');
            }
            
            toasting("success", "Success", "Process Mining successfully started");
            
            const msPerMinute = 60 * 1000;
            const maxWaitTimeMs = 60 * msPerMinute;
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
                    throw new Error("Process Mining timed out");
                }
                await sleep(10000);
                if (window.canceled) {
                    throw new Error('Canceled');
                }
            }
        } else {
            console.log('Using cached result for debugging purposes')
            status = {request_status : 'success', archive_url : sessionStorage.getItem('lastSimodUrl')}
        }

        
        if(status.request_status === 'success') {
            console.log(`Request took ${(new Date().getTime() - requestStartTime) / 1000.0} s`)
            sessionStorage.setItem('lastSimodUrl', status.archive_url); //DEBUG for debugging purposes
            const result = await fetch(status.archive_url.replace('http://0.0.0.0', apiAddress));
            const raw = await result.arrayBuffer();
            const raw_tar = Gzip.inflate(raw).buffer
            console.log('Files:')
            console.log(raw_tar)
            const files = await untar(raw_tar);
            console.log('Untar finished')

            const relevant_files = files
                .filter(file => file.name.endsWith('.json') || file.name.endsWith('.bpmn'));

            // Adapts https://github.com/InvokIT/js-untar/blob/49e639cf82e8d58dccb3458cbd08768afee8b41c/src/untar.js#L74
            // Also includes proposal from https://github.com/InvokIT/js-untar/pull/27
            function readAsString_safeForLargeFiles(encoding) {
                var buffer = this.buffer;
                var charCount = buffer.byteLength;
                var charSize = 1;
                var byteCount = charCount * charSize;
                var bufferView = new DataView(buffer);
    
                var charCodes = [];

                
                encoding = encoding || 'utf-8';
                if (global.TextDecoder) {				
                    var decoder = new TextDecoder(encoding);
                    return (this._string = decoder.decode(this.buffer));
                } else {
        
                    for (var i = 0; i < charCount; ++i) {
                        var charCode = bufferView.getUint8(i * charSize, true);
                        charCodes.push(charCode);
                    }
        
                    // Cut up long files into chunks to avoid running into the Javascript argument count. According to StackOverflow, 32k should be fine on most browsers https://stackoverflow.com/questions/22747068/is-there-a-max-number-of-arguments-javascript-functions-can-accept
                    return (this._string = convertLongCharCodeArrayToString(charCodes, 32000));
                }
            }

            function convertLongCharCodeArrayToString(charCodes, chunkSize) {
                var result = '';
                var index = 0;
              
                while (index < charCodes.length) {
                  var chunk = charCodes.slice(index, index + chunkSize);
                  result += String.fromCharCode.apply(null, chunk);
                  index += chunkSize;
                }
              
                return result;
              }

            relevant_files
                .forEach(file => {
                   file.name = file.name.replace(/\/.*\/(.*trial).*\//, '/$1/');
                   console.log('Reading file '+file.name);
                   file.readAsString_safeForLargeFiles = readAsString_safeForLargeFiles;
                   file.data = file.readAsString_safeForLargeFiles(); 
                });

            console.log(relevant_files)

            
            relevant_files.forEach(file => {
                
                setFile(projectName, 'simod_results/' + file.name, file.data); // TODO extract magic string 'simod_results'
            })
    
            // Setting the response state and updating the finished and started states
            const responseObject = {
                message : 'Miner output currently not captured',
                files : relevant_files.map(file => file.name),
                finished : new Date()
            }
            setResponse(responseObject);
            sessionStorage.setItem(projectName+'/lastMinerResponse', JSON.stringify(responseObject));
            console.log('simod_results/' + relevant_files.find(file => /.*best_result.*simulation_parameters\.json/.test(file.name))?.name)
            setConfigFile('simod_results/' + relevant_files.find(file => /.*best_result.*simulation_parameters\.json/.test(file.name))?.name)
            setBpmnFile('simod_results/' + relevant_files.find(file => /.*structure_trial.*\.bpmn/.test(file.name))?.name)
            setFinished(true);
            setStarted(false);
            // Toasting a success message
            toasting("success", "Success", "Process Mining was successful");

        } else {
            throw new Error('Process mining terminated unsuccessfully')
        }
    } catch (err) {
        setStarted(false);
        setFinished(true);
      // If there's a cancellation error, toast a success message
      if (window.canceled || axios.isCancel(err)) {
        toasting("info", "Canceled", "Process Mining was canceled");
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
    window.canceled = true;
    // Cancelling the source and updating the finished and started states
    source.current.cancel("Process Mining was canceled22");
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

        <RunProgressIndicationBar {...{started, finished, errored}}/>

            <Card bg="white">
                <CardHeader>
                    <Heading size='md'> Start Process Miner Run </Heading>
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
                                <Text color="RGBA(0, 0, 0, 0.64)" fontWeight="bold">Start Miner{JSON.parse(sessionStorage.getItem('DEBUG')) && '*'}</Text>
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
                    <Heading size='md'> Convert Miner Output to Scenario: </Heading>
                </CardHeader>
                <CardBody>
                    <Flex
                    gap="15"
                    flexDirection="row"
                    alignItems="end"
                    >               
                        {fileSelect('Select .json Config File:', configFile, setConfigFile, file => file.endsWith('.json') && file.includes('simulation_parameters') && !file.includes('converted'))}
                        {fileSelect('Select Bpmn File:', bpmnFile, setBpmnFile, file => file.endsWith('.bpmn'))}
                        
                        <Button disabled={!configFile || !bpmnFile} onClick={async () => {
                            console.log('Converting files ' + configFile + ' ' + bpmnFile)
                            const converted = convertSimodOutput((await getFile(projectName, configFile)).data, (await getFile(projectName, bpmnFile)).data);
                            const eventLog = (await getFile(projectName, logFile || fileList.filter(file => file.endsWith('.xes'))[0])).data; //TODO what if somebody selects another config?
                            converted.numberOfInstances = getNumberOfInstances(eventLog);

                            const scenarioName = window.prompt('Please enter scenario name');
                            if (scenarioName) {
                                converted.scenarioName = scenarioName;
                                getData().addScenario(converted);
                            }
                        }}>
                            <Text color="RGBA(0, 0, 0, 0.64)" fontWeight="bold">Convert to Scenario</Text>
                        </Button>

                    </Flex>
                </CardBody>
            </Card>

            <ToolRunOutputCard {...{projectName, response, toolName : 'Miner', processName : 'process mining', filePrefix : 'simod_results'}}/>         
        
            
        </Stack>
        </Box>
    )
}
export default ProcessMinerPage;