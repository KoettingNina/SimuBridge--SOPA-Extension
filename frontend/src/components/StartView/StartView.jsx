import React, {useState, useEffect} from 'react'

import {
    Flex, Button, Divider, Text,Heading, Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, ModalFooter, Input
     
  } from '@chakra-ui/react'
import { getProjects, getScenarioFileName, setFile, updateProject, uploadFile } from '../../util/Storage';

function StartView({selectProject}) {
  const [startNewProject, setNewProject] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');

  const [projects, setProjects] = useState([]);

  useEffect(() => {
    getProjects().then(loadedProjects => {
      console.log(loadedProjects);
      setProjects(loadedProjects);
    });
  }, []);

  
   function onClose() {
    setNewProject(false);
  }


  

  function dateConverter(d){

    let x = new Date(d)
    var date = x.getDate();
    var month = x.getMonth() + 1;
    var year = x.getFullYear();
    var hours = x.getHours()
    var minutes = x.getMinutes()
        
    var dateStr = date + "/" + month + "/" + year + " " + hours + ":" + minutes;

    return dateStr
  }
    
  return (
    <Flex
      backgroundColor="white"
      alignItems="center"
      flexDir="column"
      gap="5"
      w = "100vw"
      h = "100vh"
      p = "6"
    >
      <gap />
      <Text fontSize="3xl" textAlign="left" color="H5C5C5C" fontWeight="bold" >SimuBridge</Text>
      <Divider />
      
      <Flex
        backgroundColor="white"
        alignItems="center"
        flexDir="column"
        gap="50"     
      >
        <Button boxShadow='sm'
          rounded = '2xl'
          backgroundColor="#F0F0F1"
          alignItems="center"
          flexDir="column"
          gap="5"
          height={50}          
          width={400} 
          onClick={() => setNewProject(true)}
          fontSize="xl" textAlign="left" color="RGBA(0, 0, 0, 0.80)" fontWeight="bold">
            Start new project
        </Button>

        <Modal isOpen={startNewProject} onClose={onClose}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Enter new project name</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <Input bg="white" placeholder='ProjectName' onChange={evt => setNewProjectName(evt.target.value)}/>
            </ModalBody>
            <ModalFooter>
              <Button colorScheme='blue' mr={3} onClick={() => {
                updateProject(newProjectName) // Make the project known to the database
                selectProject(newProjectName)
              }}>Confirm</Button>
              <Button variant='ghost' onClick={onClose}>Cancel</Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

        
        <Button boxShadow='sm'
          rounded = '2xl'
          backgroundColor="#F0F0F1"
          alignItems="center"
          flexDir="column"
          gap="5"
          height={50}          
          width={400} 
          onClick={async () => {
            const {data, name} = (await uploadFile());
            const scenarios = JSON.parse(data);
            const projectName = name.split('.')[0];
            console.log(scenarios);
            await Promise.all(scenarios.map(scenario => {
              let scenarioFileName = getScenarioFileName(scenario.scenarioName);
              return setFile(projectName, scenarioFileName, JSON.stringify(scenario));
            }));
            updateProject(projectName);
            selectProject(projectName);
        }}
          fontSize="xl" textAlign="left" color="RGBA(0, 0, 0, 0.80)" fontWeight="bold">
            Import Project From File
        </Button>
        

        <Flex flexDir="column" gap="5" width="100%" >
          <Heading size="md">Select existing project</Heading>
           <Flex h="30vh" overflowY="scroll" flexDir="column" gap="5">
                {projects.sort((a, b) => new Date(b.date) - new Date(a.date)).map(project => {
                  return <Button p="4" h="20" onClick={() => selectProject(project.projectName)}><Flex direction="column" gap="3"><Text fontSize="lg">{project.projectName}</Text><Text fontSize="sm" color="gray.600">Last change: {dateConverter(project.date)}</Text></Flex></Button>
                })}
           </Flex>  
        </Flex>
      </Flex>
    </Flex> 
  )
}

export default StartView;