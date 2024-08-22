import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import {
  Input, FormControl, FormLabel, Select, Box, ButtonGroup, IconButton, Text,
  Flex,
  Link as ChakraLink, Icon,
  Accordion, AccordionItem, AccordionButton, AccordionPanel, AccordionIcon
} from '@chakra-ui/react';
import { AddIcon, SettingsIcon, CloseIcon } from '@chakra-ui/icons';

import DistributionEditor from '../../DistributionEditor';
import AbstractModelElementEditor from './AbstractModelElementEditor';

import { distributionToState, stateToDistribution } from '../../../util/Distributions';
import { saveCostVariantConfig } from '../../Lca/Logic/LcaDataManager';


const Activity = ({ getData, currentElement, setCurrentRightSideBar }) => {
  const [allAbstractCostDrivers, setAllAbstractCostDrivers] = useState([]);
  const reactDomNavigator = useNavigate();

  //init
  useEffect(() => {
    const scenario = getData().getCurrentScenario();

    if (scenario) {
      const costDrivers = scenario.resourceParameters.costDrivers;
      if (costDrivers) {
        setAllAbstractCostDrivers(costDrivers);
      }
    }
  }, []);

  const nodeId = currentElement.id;

  function getExistingActivityConfiguration() {
    return getData().getCurrentModel().modelParameter.activities.find(value => value.id === currentElement.id)
  }

  const [activityConfiguration, setActivityConfiguration] = useState(undefined);

  let save = () => { throw 'Not set yet' };
  function setSave(saveFunc) {
    save = saveFunc;
  }


  function setCost(cost) {
    activityConfiguration.cost = cost;
    save();
  }

  function setResources(resources) {
    activityConfiguration.resources = resources;
    save();
  }
  function setAbstractCostDrivers(abstractCostDrivers) {
    activityConfiguration.costDrivers = abstractCostDrivers;
    save();
  }
  function setDuration(duration) {
    activityConfiguration.duration = stateToDistribution(duration);
    save();
  }


  const addResource = () => {
    setResources([...activityConfiguration.resources.filter(resource => resource), undefined])
  }

  const removeResource = (index) => {
    setResources(activityConfiguration.resources.filter((value, localIndex) => localIndex !== index))
  }

  const handleResources = (index, value) => {
    activityConfiguration.resources[index] = value;
    setResources(activityConfiguration.resources.filter(resource => resource));
  }
  const addAbstractCostDriver = () => {
    setAbstractCostDrivers([...activityConfiguration.costDrivers.filter(abstractCostDriver => abstractCostDriver), undefined])
  }

  const removeAbstractCostDriver = (index) => {
    setAbstractCostDrivers(activityConfiguration.costDrivers.filter((value, localIndex) => localIndex !== index));
    saveCostVariantConfig(getData, allAbstractCostDrivers);
  }

  const handleAbstractCostDrivers = (index, value) => {
    activityConfiguration.costDrivers[index] = value;
    setAbstractCostDrivers(activityConfiguration.costDrivers.filter(abstractCostDriver => abstractCostDriver));
    saveCostVariantConfig(getData, allAbstractCostDrivers);
  }

  return <AbstractModelElementEditor  {...{
    type: 'activities',
    typeName: 'Activity',
    state: activityConfiguration,
    setState: setActivityConfiguration,
    currentElement,
    getData,
    moddleClass: 'simulationmodel:Activity',
    setSave
  }}>

    {activityConfiguration && (
      <Accordion allowToggle>
        <AccordionItem>
          <h2>
            <AccordionButton>
              <Box as="span" flex='1' textAlign='left'>
                General Parameters
              </Box>
              <AccordionIcon />
            </AccordionButton>
          </h2>
          <AccordionPanel pb={4}>
            <FormControl>
              <FormLabel>Fix costs:</FormLabel>
              <Input name="cost" type="input" value={activityConfiguration.cost} onChange={(event) => setCost(event.target.value)} bg="white" /> {/* TODO: Potentially also display the current money unit for the scenario */}
            </FormControl>
          </AccordionPanel>
        </AccordionItem>

        <AccordionItem>
          <h2>
            <AccordionButton>
              <Box as="span" flex='1' textAlign='left'>
                Duration
              </Box>
              <AccordionIcon />
            </AccordionButton>
          </h2>
          <AccordionPanel pb={4}>
            <DistributionEditor {...{ state: distributionToState(activityConfiguration.duration), setState: setDuration }} />
          </AccordionPanel>
        </AccordionItem>

        <AccordionItem>
          <h2>
            <AccordionButton>
              <Box as="span" flex='1' textAlign='left'>
                Resources
              </Box>
              <AccordionIcon />
            </AccordionButton>
          </h2>
          <AccordionPanel pb={4}>
            <Text fontWeight="bold" fontSize="md">Resources:</Text>

            {
              activityConfiguration.resources.map((resource, index) => {
                return <FormControl>
                  <FormLabel>Resource {(index + 1)}:</FormLabel>
                  <Flex gap='0' flexDirection='row'>
                    <Select key={index} name="resource" value={resource} {...(!resource && { placeholder: 'Select resource', color: 'red' })} onChange={(event) => handleResources(index, event.target.value)} bg="white">
                      {getData().getCurrentScenario().resourceParameters.roles
                        .filter(alternativeResource => !activityConfiguration.resources.includes(alternativeResource.id) || alternativeResource.id === resource)
                        .map(x => {
                          return <option style={{ color: 'black' }} value={x.id} key={x.id}>{x.id}</option>
                        })}

                    </Select>
                    <IconButton icon={<CloseIcon />} onClick={() => removeResource(index)} />
                  </Flex>
                </FormControl>
              })

            }

            <ButtonGroup size='md' isAttached variant="outline" >
              {/* <IconButton icon={<MinusIcon />} onClick={() => changeValueAmount(-1)} /> */}
              <IconButton icon={<AddIcon />} disabled={activityConfiguration.resources.filter(res => !res).length} onClick={() => addResource()} />
            </ButtonGroup>
          </AccordionPanel>
        </AccordionItem>
        <AccordionItem pb={4}>
          <h2>
            <AccordionButton>
              <Box as="span" flex='1' textAlign='left'>
                OpenLCA Drivers
              </Box>
              <AccordionIcon />
            </AccordionButton>
          </h2>
          <AccordionPanel pb={4}>
            {allAbstractCostDrivers.length === 0 ?
              <Box>
                Cost Drivers not found
                <ChakraLink
                  onClick={() => {
                    setCurrentRightSideBar(undefined);
                    reactDomNavigator('/lcavariants');
                  }}
                  color='teal'>
                  <Flex
                    flexDirection='row'
                    gap={3}
                    alignItems="center">
                    <Icon as={SettingsIcon} color='teal' />
                    Configure
                  </Flex>
                </ChakraLink></Box> :
              <Box id='abstractDriversConfigurator' pb={4}>
                <Text fontWeight="bold" fontSize="md">Abstract Cost Drivers</Text>
                {
                  activityConfiguration.costDrivers.map((abstractCostDriver, index) => {
                    return <FormControl>
                      <Flex gap='0' flexDirection='row' mt={2}>
                        <Select
                          key={index}
                          name="abstractCostDriver"
                          value={abstractCostDriver}
                          {...(!abstractCostDriver && { placeholder: 'Select abstract cost driver', color: 'red' })}
                          onChange={(event) => handleAbstractCostDrivers(index, event.target.value)}
                          bg="white"
                        >
                          {allAbstractCostDrivers
                            .filter(alternativeAbstractCostDriver => !activityConfiguration.costDrivers.includes(alternativeAbstractCostDriver.id) || alternativeAbstractCostDriver.id === abstractCostDriver)
                            .map(abstractCostDriver => {
                              return <option style={{ color: 'black' }} value={abstractCostDriver.id} key={abstractCostDriver.id}>{abstractCostDriver.name}</option>
                            })}
                        </Select>
                        <IconButton icon={<CloseIcon />} onClick={() => removeAbstractCostDriver(index)} />
                      </Flex>
                    </FormControl>
                  })
                }

                <ButtonGroup size='md' isAttached variant="outline" mt={2} >
                  <IconButton icon={<AddIcon />} disabled={activityConfiguration.costDrivers.filter(abstractCostDriver => !abstractCostDriver).length} onClick={() => addAbstractCostDriver()} />
                </ButtonGroup>
              </Box>
            }
          </AccordionPanel>
        </AccordionItem>
      </Accordion>
    )}
  </AbstractModelElementEditor>
}


export default Activity;