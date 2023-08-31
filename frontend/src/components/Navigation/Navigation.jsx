import React from 'react'
import Sidebar from '../Sidebar';

import {
    Text,
    Divider,
    Spacer,
    Flex,
    Select,
  } from '@chakra-ui/react'
import NavigationItem from './NavigationItem';

import {
    FiStar,
    FiSettings,
    FiFileText,
    FiTrash2,
    FiDownload,
    FiPlay,
    FiEye,
    FiUser,
    FiCornerLeftUp
  } from 'react-icons/fi';

import { downloadData } from '../../util/Storage';

  function Navigation({setCurrent, getData, current, selectProject}) {


    // Define Navigation items that will be displayed at the top of the navigation

    let LinkItems = [
        { name: 'Project Overview', icon: FiEye, path: '/overview', event: () =>  setCurrent("Overview") },
      ];

    let scenarioSpecificLinkItems = [
      { name: 'Scenario Overview', icon: FiSettings, path: '/scenario', event: () =>  setCurrent("Scenario Parameters") },
      { name: 'Resource Parameters', icon: FiUser, path: '/resource', event: () =>  setCurrent("Resource Parameters")},
      { name: 'Model-based Parameters', icon: FiStar, path: '/modelbased', event: () =>  setCurrent("Modelbased Parameters") },
    ]

    
    let LinkItems2 = [
      { name: 'Run Simulation', icon: FiPlay, path: '/simulation', event: () =>  setCurrent("Run Simulation") },
      { name: 'Run Process Miner', icon: FiPlay, path: '/processminer', event: () =>  setCurrent("Run Process Miner") },
      // { name: 'Debugging View', icon: FiPlay, path: '/debug', event: () =>  setCurrent("Debug View") }
    ];

      if (!getData().getCurrentScenario()) {
        scenarioSpecificLinkItems = [];
      }

      if (!getData().getCurrentModel()) {
        scenarioSpecificLinkItems = scenarioSpecificLinkItems.filter(item => !['/modelbased'].includes(item.path))
      }

      // Define Navigation items that will be displayed at the bottom of the navigation
     
      const LinkItems3 = [
        { name: 'Download Project', icon: FiDownload, path: null, event: (e) => {
          e.preventDefault();
          save();
        } },
        { name: 'Close Project', icon: FiCornerLeftUp, path: '/#', event: () => selectProject(null) },
      ];

      
    const Nav = () => {
        return <Text fontSize={{base: "xs", md:"sm"}} textAlign="center" color="RGBA(0, 0, 0, 0.80)" fontWeight="bold">SimuBridge</Text> 
      };


      // function to download the internal data as a json file
      const save = () =>{
        const jsonData = JSON.stringify(getData().getAllScenarios());
        downloadData(jsonData, `${getData().projectName}.json`);
      }
      
  return (
        <>
          <Sidebar side="left" backgroundColor="white" title={<Nav/>}
            content={
                  <>
                  <Flex fontWeight="bold"> Project: {getData().projectName}</Flex>
                  <NavigationItem current={current}  items={LinkItems} clickedcolor="#AEC8CA" color="#FFFF" exitButton={false} setCurrent={setCurrent}  />

                  <Flex flexDir='row-reverse'>
                    <Flex w="80%"  flexDir='column'>
                      <Flex fontWeight="bold" alignItems='center'>
                        Scenario:
                        <Select value={getData().getCurrentScenario()?.scenarioName} bg="white" onChange={evt => getData().setCurrentScenarioByName(evt.target.value)}>
                            {getData().getAllScenarios().map((scenario, index) => {
                                return <option value={scenario.scenarioName} key={scenario.scenarioName}>{scenario.scenarioName}</option>
                            })}
                        </Select>
                      </Flex>
                      <NavigationItem current={current}  items={scenarioSpecificLinkItems} clickedcolor="#AEC8CA" color="#FFFF" exitButton={false} setCurrent={setCurrent}  />
                    </Flex>
                  </Flex>

                  <NavigationItem current={current}  items={LinkItems2} clickedcolor="#AEC8CA" color="#FFFF" exitButton={false} setCurrent={setCurrent}  />
                  
                  <Divider/>
                  <Spacer/>
                  <NavigationItem items={LinkItems3} clickedColor="blackAlpha.400" color="blackAlpha.00" bottom="0" exitButton={true} />                    
                  </>
              } 
          />
        </>
  )
}

export default Navigation;