import React, { useState } from 'react'

import { Flex, Heading, Card, CardHeader, CardBody, Text, Select, Stack, Button, Progress, Box, Textarea, UnorderedList, ListItem, Icon } from '@chakra-ui/react';


import {
    FiTrash2
} from 'react-icons/fi';

import { deleteAllFiles, deleteFile, downloadFile, getFile, getFiles, getScenarioFileName, setFile, uploadFile } from '../../util/Storage';
import { convertSimodOutput } from '../../util/simod_converter';


function DebugPage(props) {


    const [fileList, setFileList] = useState([]);

    function updateFileList() {
        getFiles(props.projectName).then(newFileList => {
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
                                    <Button onClick={() => downloadFile(props.projectName, x)} variant="link">{x}</Button>
                                    <Button onClick={() => {
                                        deleteFile(props.projectName, x);
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
                            uploadFile(props.projectName).then(updateFileList);
                        }}>Upload File</Button> 
                        <Button onClick={() => {
                            deleteAllFiles(props.projectName).then(updateFileList);
                        }}>Delete All Files</Button> 
                        <Button onClick={() => console.log(props.data)}>Print State</Button> 
                    </CardBody>
                </Card>

            </Stack>
        </Box >
    )
}

export default DebugPage;