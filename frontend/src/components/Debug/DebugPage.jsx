import React, { useState } from 'react'

import { Flex, Heading, Card, CardHeader, CardBody, Text, Select, Stack, Button, Progress, Box, Textarea, UnorderedList, ListItem, Icon } from '@chakra-ui/react';


import {
    FiTrash2
} from 'react-icons/fi';

import { deleteAllFiles, deleteFile, downloadFile, getFile, getFiles, getScenarioFileName, setFile, uploadFile } from '../../util/Storage';
import { convertSimodOutput } from '../../util/simod_converter';


function DebugPage(props) {


    const [fileList, setFileList] = useState([]);

    getFiles(props.projectName).then(newFileList => {
        if (fileList.join(',') !== newFileList.join(',')) {
            setFileList(newFileList);
        }
    });

    return (
        <Box h="93vh" overflowY="auto" p="5" >
            <Stack gap="2">
                <Card bg="white">
                    <CardHeader>
                        <Heading size='ms'> File List </Heading>
                    </CardHeader>
                    <CardBody>
                        <UnorderedList>
                            {fileList.sort().map(x => (
                                <ListItem>
                                    {x.endsWith('.json') && x.includes('simulation_parameters') && !x.includes('converted') && <Button onClick={async () => {
                                        let bpmn = fileList.filter(file => file.endsWith('.bpmn') && file.includes('structure_trial'))[0]; //TODO random model selection
                                        console.log('Converting files ' + x + ' ' + bpmn)
                                        let converted = convertSimodOutput((await getFile(props.projectName, x)).data, (await getFile(props.projectName, bpmn)).data);
                                        converted.modelPaths = [bpmn];  //TODO magical attribute, should be part of converter potentially

                                        let scenarioName = window.prompt('Please enter scenario name');
                                        converted.scenarioName = scenarioName;
                                        console.log(converted);
                                        let scenarioFileName = getScenarioFileName(scenarioName);
                                        setFile(props.projectName, scenarioFileName, JSON.stringify([converted])); //TODO store without array
                                        props.setData([...props.data, converted])
                                    }}>Convert To Scenario</Button>}
                                    <Button onClick={() => downloadFile(props.projectName, x)} variant="link">{x}</Button>
                                    <Button onClick={() => deleteFile(props.projectName, x)} ><Icon as={FiTrash2} fontSize="md" color={"RGBA(0, 0, 0, 0.64)"} /></Button>
                                </ListItem>
                            ))}
                        </UnorderedList>
                    </CardBody>
                </Card>


                <Card bg="white">
                    <CardHeader>
                        <Heading size='ms'> Others </Heading>
                    </CardHeader>
                    <CardBody>
                        <Button onClick={() => uploadFile(props.projectName)}>Upload File</Button> 
                        <Button onClick={() => deleteAllFiles(props.projectName)}>Delete All Files</Button> 
                        <Button onClick={() => console.log(props.data)}>Print State</Button> 
                    </CardBody>
                </Card>

            </Stack>
        </Box >
    )
}

export default DebugPage;