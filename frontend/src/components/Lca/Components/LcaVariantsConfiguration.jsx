import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Link as ReactRouterLink } from "react-router-dom";

import {
  Box, Heading, Progress, Tooltip,
  Card, CardHeader, CardBody,
  Button, Flex, Text, Alert, AlertIcon, AlertDescription,
  UnorderedList, ListItem, Link as ChakraLink,
  Accordion, AccordionItem, AccordionPanel, AccordionButton
} from '@chakra-ui/react';

import { CheckCircleIcon, WarningIcon } from '@chakra-ui/icons';

import { FiEdit, FiTrash2 } from 'react-icons/fi';

import VariantEditor from './VariantEditor';
import * as lcaDm from '../Logic/LcaDataManager';
import BasicSpinner from './BasicSpinner';


function LcaVariantsConfiguration({ getData, toasting }) {
  const [variants, setVariants] = useState([]);
  const [currentVariant, setCurrentVariant] = useState({ name: '', mappings: [], frequency: 15 });
  const [allCostDrivers, setAllCostDrivers] = useState([]);
  const [isCostDriversLoaded, setIsCostDriversLoaded] = useState(false);
  const [isScenarioModelLoaded, setIsScenarioModelLoaded] = useState(false);

  useEffect(() => {
    const uniqueCostDrivers = lcaDm.getCostDriversFromScenario(getData);
    setAllCostDrivers(uniqueCostDrivers);
    setIsCostDriversLoaded(uniqueCostDrivers.length > 0);

    const loadedVariants = lcaDm.getVariants(getData);
    setVariants(lcaDm.getVariants(getData));
    setIsScenarioModelLoaded(true);
  }, [getData]);

  const handleSaveCostVariant = async (variant) => {
    const isExistingVariant = variant.id && variants.some(v => v.id === variant.id);
    if (!isExistingVariant) {
      variant.id = uuidv4();
    }

    const updatedMappings = (variant.mappings || []).map(mapping => ({
      ...mapping,
      
      distribution: mapping.distribution?.distributionType 
        ? {
            distributionType: mapping.distribution.distributionType,
            distributionValues: mapping.distribution.distributionValues || [],
            timeUnit: mapping.distribution.timeUnit || ''
          }
        : null
    }));

    const updatedVariant = {
      ...variant,
      mappings: updatedMappings,
      frequency: parseInt(variant.frequency) || 15
    };

    const updatedVariants = variants.filter(v => v.id !== variant.id);
    updatedVariants.push(variant);

    setVariants(updatedVariants);

    await lcaDm.saveCostVariant(updatedVariant, updatedVariants, getData, toasting);

    setCurrentVariant({ name: '', mappings: [], frequency: 15 });
    toasting("success", "Variant saved", "Cost variant saved successfully");
    if(updatedVariants.reduce((sum, variant) => sum + parseInt(variant.frequency), 0) != 100){
      toasting("warning", "Frequencies sum is not 100%", "For correct simulation, the sum of frequencies must be 100%");
    }
  };

  const editVariant = (variant) => {
    setCurrentVariant({ ...variant });
  };

  const handleDeleteVariant = async (variantId) => {
    setVariants(variants.filter(v => v.id !== variantId));
    if (currentVariant.id === variantId) {
      setCurrentVariant({ name: '', mappings: [], frequency: 15 });
    }

    await lcaDm.deleteVariantFromConfiguration(variantId, getData);

    toasting("info", "Variant deleted", "Cost variant deleted successfully");
  };

  return (
    !isScenarioModelLoaded ?
    <BasicSpinner /> :
    <Box>
      <Heading size='lg'>OpenLCA Variants for {getData().getCurrentScenario().scenarioName}</Heading>
      {!isCostDriversLoaded ?
        <Alert status='warning' mt={2} display='flex' alignItems='center' justifyContent='space-between'>
          <Flex alignItems='center'>
            <AlertIcon />
            <AlertDescription>Cost drivers are not loaded. Please load the cost drivers from the OpenLCA server.</AlertDescription>
          </Flex>
          <ChakraLink
            as={ReactRouterLink}
            to='/lcaintegration'
            color='teal'
          >
            Load cost drivers
          </ChakraLink>
        </Alert> :
        <Box>
          <Card my={2}>
            <CardHeader>
              <Flex alignItems="center">
                <Heading flex="1" size='md'>Saved Variants (Total: {variants.length})</Heading>
                <Text fontSize="sm" color='gray.500' mr={2}>Σ frequencies: {
                  variants.reduce((sum, variant) => sum + parseInt(variant.frequency), 0)}%
                </Text>
                <Tooltip label='For correct simulation, the sum of frequencies must be 100%'>
                  {variants.reduce((sum, variant) => sum + parseInt(variant.frequency), 0) === 100 ?
                    <CheckCircleIcon color='green.500' /> :
                    <WarningIcon color='red.500' />}
                </Tooltip>
              </Flex>
            </CardHeader>
            <CardBody>
              <Accordion allowMultiple>
                {variants.map((variant, index) => (
                  <AccordionItem key={index}>
                    <h2>
                      <AccordionButton>
                        <Box flex="1" textAlign="left">
                          <Text fontSize="lg" fontWeight="bold">
                            {variant.name}
                          </Text>
                        </Box>
                        <Text fontSize="sm" color='gray.500' mr={2}>{variant.frequency}%</Text>
                        <Progress value={variant.frequency} max={100} colorScheme='teal' size='sm' w='100px' mr={2} />
                        <Button
                          colorScheme='white'
                          variant='outline'
                          border='1px'
                          borderColor='#B4C7C9'
                          color='#6E6E6F'
                          _hover={{ bg: '#B4C7C9' }}
                          onClick={() => editVariant(variant)}
                          leftIcon={<FiEdit />}
                        >Edit</Button>
                        <Button
                          colorScheme='white'
                          variant='outline'
                          border='1px'
                          borderColor='#B4C7C9'
                          color='#6E6E6F'
                          _hover={{ bg: '#B4C7C9' }}
                          ml={2}
                          onClick={() => handleDeleteVariant(variant.id)}
                          leftIcon={<FiTrash2 />}
                        >Delete</Button>
                      </AccordionButton>
                    </h2>
                    <AccordionPanel pb={4}>
                      <UnorderedList>
                        {variant.mappings.map((mapping, mappingIndex) => (
                          <ListItem key={mappingIndex}>
                            {mapping.abstractDriver}{" - "}
                            {allCostDrivers.find(driver => driver.name === mapping.abstractDriver)
                              ?.concreteCostDrivers.find(concreteDriver => concreteDriver.id === mapping.concreteDriver)
                              ?.name}
                            {allCostDrivers.find(driver => driver.name === mapping.abstractDriver)
                              ?.concreteCostDrivers.find(concreteDriver => concreteDriver.id === mapping.concreteDriver)
                              ?.unit ? ` (${allCostDrivers.find(driver => driver.name === mapping.abstractDriver)
                              ?.concreteCostDrivers.find(concreteDriver => concreteDriver.id === mapping.concreteDriver)
                              ?.unit})` : ''}
                            {" - "}{"distribution: "}
                            {mapping.distribution
                              ? `${mapping.distribution.distributionType} (${Array.isArray(mapping.distribution.values) ? mapping.distribution.values.join(", ") : ""})`
                              : "none"}
                          </ListItem>
                        ))}
                      
                      </UnorderedList>
                    </AccordionPanel>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardBody>
          </Card>
          
          <VariantEditor
            costVariant={currentVariant}
            allCostDrivers={allCostDrivers}
            saveCostVariant={handleSaveCostVariant}
            setCurrentVariant={setCurrentVariant}
            toasting={toasting}
          />
        </Box>}
    </Box>
  );
}

export default LcaVariantsConfiguration;
