import React, { useState } from 'react'

import { Flex, Heading, Card, CardHeader, CardBody, Text, Select, Stack, Button, Progress, Box, Textarea, UnorderedList, ListItem, Icon } from '@chakra-ui/react';


import {
    FiTrash2
} from 'react-icons/fi';

import { deleteAllFiles, deleteFile, downloadFile, getFile, getFiles, getScenarioFileName, setFile, uploadFileToProject } from '../../util/Storage';
import { convertSimodOutput } from 'simulation-bridge-converter-simod/simod_converter';


function DebugPage({projectName, getData}) {


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
                <Card bg="white">
                    <CardHeader>
                        <Heading size='ms'> File List </Heading>
                    </CardHeader>
                    <CardBody>
                        <UnorderedList>
                            {fileList.sort().map(x => (
                                <ListItem key={x}>
                                    <Button onClick={() => downloadFile(projectName, x)} variant="link">{x}</Button>
                                    <Button onClick={() => {
                                        deleteFile(projectName, x);
                                        updateFileList();
                                    }} ><Icon as={FiTrash2} fontSize="md" color={"RGBA(0, 0, 0, 0.64)"} /></Button>
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
                        <Button onClick={() => {
                            uploadFileToProject(projectName).then(updateFileList);
                        }}>Upload File</Button> 
                        <Button onClick={() => {
                            deleteAllFiles(projectName).then(updateFileList);
                        }}>Delete All Files</Button> 
                        <Button onClick={() => console.log(getData())}>Print State</Button> 
                    </CardBody>
                </Card>

            </Stack>
        </Box >
    )
}

export default DebugPage;