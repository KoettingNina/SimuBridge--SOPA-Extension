import React, { useState, useEffect } from 'react';

import {
  Box, Card, CardHeader, CardBody, Heading, Text,
  Stack, Flex, VStack,
  Input, NumberInput, NumberInputField, NumberInputStepper, NumberIncrementStepper, NumberDecrementStepper,
  Select, Button, IconButton,
  SlideFade, Tooltip
} from '@chakra-ui/react';

import { FiSave, FiSlash, FiInfo } from 'react-icons/fi';
import { AiOutlineMinusCircle } from 'react-icons/ai';

import DistributionEditor from '../../DistributionEditor';


export default function VariantEditor({ costVariant,
  allCostDrivers,
  saveCostVariant, setCurrentVariant,
  toasting }) {
  const defaultFrequency = 50;
  const minFrequency = 0;
  const maxFrequency = 100;

  const [isNewVariant, setIsNewVariant] = useState(!costVariant.id);
  const [driverMapping, setDriverMapping] = useState(isNewVariant ? [] : costVariant.mappings);
  const [isVariantNameValid, setIsVariantNameValid] = useState(true);
  const [variantName, setVariantName] = useState(isNewVariant ? '' : costVariant.name);
  const [frequency, setFrequency] = useState(isNewVariant ? defaultFrequency : costVariant.frequency);
  const [mappingValidations, setMappingValidations] = useState([]);

  const formatFrequency = (val) => val + `%`;
  const updateFrequency = (val) => {
    updateVariantDetails('frequency', val.replace(/^\%/, ''));
  }

    

  useEffect(() => {
    
    const mappings = (costVariant.mappings || []).map(mapping => ({
      ...mapping,
      distribution: mapping.distribution ? {
        distributionType: mapping.distribution.distributionType,
        distributionValues: mapping.distribution.values,
      } : {
        distributionType: '',
        distributionValues: [],
      }
    }));

    setDriverMapping(mappings);
    setVariantName(costVariant.name || '');
    setFrequency(costVariant.frequency || defaultFrequency);
    setIsNewVariant(!costVariant.id);
  }, [costVariant]);

  useEffect(() => {
    const initialValidations = driverMapping.map(mapping => ({
      abstractDriverValid: !!mapping.abstractDriver,
      concreteDriverValid: !!mapping.concreteDriver
    }));
    setMappingValidations(initialValidations);
    setShowMappings(driverMapping.map(() => true));
  }, [driverMapping]);

  const [showMappings, setShowMappings] = useState(driverMapping.map(() => true));

  const addNewDriverMapping = () => {
    setDriverMapping([...driverMapping, { abstractDriver: '', concreteDriver: '', distribution: {
      distributionType: 'constant',
      distributionValues: [1],
      timeUnit: ''
    }}]);
    setShowMappings([...showMappings, true]);
  };

  const removeDriverMapping = (index) => {
    let updatedShowMappings = [...showMappings];
    updatedShowMappings[index] = false;
    setShowMappings(updatedShowMappings);

    setTimeout(() => {
      const updatedMappings = driverMapping.filter((_, idx) => idx !== index);
      setDriverMapping(updatedMappings);

      const updatedVisibility = showMappings.filter((_, idx) => idx !== index);
      setShowMappings(updatedVisibility);
    }, 300);
  };


  const updateVariantDetails = (field, value) => {
    if (field === 'name') {
      setIsVariantNameValid(value.length > 0);
      setVariantName(value);
    } else if (field === 'frequency') {
      setFrequency(value);
    }
  };

  const abstractDriverNames = Array.from(new Set(allCostDrivers.map(driver => driver.name)));

  const updateMapping = (index, field, value) => {
    const updatedMappings = [...driverMapping];
    updatedMappings[index][field] = value;
    setDriverMapping(updatedMappings);

    const updatedValidations = [...mappingValidations];
    updatedValidations[index][`${field}Valid`] = !!value;
    setMappingValidations(updatedValidations);
  };

  const saveVariantClicked = () => {
    const allMappingsValid = mappingValidations.every(validation =>
      validation.abstractDriverValid && validation.concreteDriverValid);

    if (!variantName || driverMapping.length === 0 || !allMappingsValid) {
      toasting("error", "Invalid input", "All fields are required and must be valid.");
      return;
    }

    saveCostVariant({
      ...costVariant,
      mappings: driverMapping,
      name: variantName,
      frequency: frequency
    });
  };

  return (
    <Card my={2}>
      <CardHeader>
        <Flex justifyContent="space-between" alignItems="center">
          <VStack align="start">
            <Heading size='md'>{isNewVariant ? 'Add' : 'Edit'} Variant</Heading>
            {costVariant.id &&
              <Text fontSize='sm' color='gray.500'>
                ID: {costVariant.id}
              </Text>
            }
          </VStack>
          <Stack direction="row" spacing={2}>
            {
              !isNewVariant &&
              <Button
                onClick={() => {
                  setCurrentVariant({ name: '', mappings: [], frequency: 15 });
                }}
                id="cancelVariantButton"
                colorScheme='white'
                variant='outline'
                border='1px'
                borderColor='#B4C7C9'
                color='#6E6E6F'
                _hover={{ bg: '#B4C7C9' }}
                leftIcon={<FiSlash />}
              >
                Cancel
              </Button>
            }
            <Button
              id="saveVariantButton"
              onClick={saveVariantClicked}
              colorScheme='white'
              variant='outline'
              border='1px'
              borderColor='#B4C7C9'
              color='#6E6E6F'
              _hover={{ bg: '#B4C7C9' }}
              leftIcon={<FiSave />}
            >{isNewVariant ? 'Add' : 'Save'}</Button>
          </Stack>
        </Flex>
      </CardHeader>
      <CardBody>
        <Stack>
          <Text>Please specify variant name and frequency</Text>
          <Flex mt={2}>
            <Input
              id="variantNameInput"
              placeholder="Variant Name"
              value={variantName}
              onChange={(e) => updateVariantDetails('name', e.target.value)}
              isInvalid={!isVariantNameValid}
              errorBorderColor='red.300'
            />
            <NumberInput
              id="variantFrequencyInput"
              placeholder="Frequency"
              onChange={(valueString) => updateFrequency(valueString)}
              value={formatFrequency(frequency)}
              defaultValue={defaultFrequency}
              min={minFrequency}
              max={maxFrequency}
              ml={3}
            >
              <NumberInputField />
              <NumberInputStepper>
                <NumberIncrementStepper />
                <NumberDecrementStepper />
              </NumberInputStepper>
            </NumberInput>
          </Flex>
          {driverMapping.map((mapping, index) =>
            <SlideFade key={index} in={showMappings[index]} animateOpacity>
              <Flex mt={3} alignItems="center" id={'mapping' + index} gap={3}>
                <Text minW="24px">{index + 1}.</Text>
                <Select
                  flex="1"
                  minW="120px"
                  id="abstractDriverSelect"
                  placeholder="Select Abstract Driver"
                  key={`abstract${index}`}
                  value={mapping.abstractDriver}
                  onChange={(e) => updateMapping(index, 'abstractDriver', e.target.value)}
                  isInvalid={!mappingValidations[index]?.abstractDriverValid}
                  errorBorderColor='red.300'
                  mr={0}
                >
                  {abstractDriverNames.map(name => (
                    <option value={name} key={name}>{name}</option>
                  ))}
                </Select>
                <Flex flex="1" alignItems="center" gap={2}>
                  <Select
                    flex="1"
                    minW="120px"
                    id="concreteDriverSelect"
                    placeholder="Select Concrete Driver"
                    value={mapping.concreteDriver}
                    key={`concrete${index}`}
                    onChange={(e) => updateMapping(index, 'concreteDriver', e.target.value)}
                    isInvalid={!mappingValidations[index]?.concreteDriverValid}
                    errorBorderColor='red.300'
                  >
                    {allCostDrivers
                      .find(driver => driver.name === mapping.abstractDriver)?.concreteCostDrivers
                      .map(concreteDriver => (
                        <option value={concreteDriver.id} key={concreteDriver.id}>
                          {concreteDriver.name} 
                        </option>
                      ))}
                  </Select>
                  <Tooltip 
                    label={
                      allCostDrivers
                        .find(driver => driver.name === mapping.abstractDriver)
                        ?.concreteCostDrivers.find(cd => cd.id === mapping.concreteDriver)
                        ?.processName || 'No process name available'
                    }
                    placement="top"
                    hasArrow
                  >
                    <IconButton
                      aria-label="Show process name"
                      icon={<FiInfo />}
                      size="md"
                      variant="ghost"
                      colorScheme="teal"
                      isDisabled={!mapping.concreteDriver}
                    />
                  </Tooltip>
                </Flex>
                <Box flex="1" minW="220px">
                  <DistributionEditor
                    state={mapping.distribution}
                    setState={(newDistribution) => {
                      setDriverMapping(prevMappings => {
                        const newMappings = [...prevMappings];
                        newMappings[index] = {
                          ...newMappings[index],
                          distribution: newDistribution
                        };
                        return newMappings;
                      });
                    }}
                    showTimeUnit={false}
                    targetUnit={
                      allCostDrivers
                        .find(driver => driver.name === mapping.abstractDriver)
                        ?.concreteCostDrivers.find(cd => cd.id === mapping.concreteDriver)
                        ?.unit || ''
                    }
                  />
                </Box>
                <IconButton
                  aria-label="Remove mapping"
                  icon={<AiOutlineMinusCircle />}
                  isRound={true}
                  ml={2}
                  colorScheme="teal"
                  variant="outline"
                  onClick={() => removeDriverMapping(index)}
                />
              </Flex>
            </SlideFade>
          )}
          <Button
            onClick={addNewDriverMapping}
            colorScheme='white'
            variant='outline'
            border='1px'
            borderColor='#B4C7C9'
            color='#6E6E6F'
            _hover={{ bg: '#B4C7C9' }}
            mt={2}
          >
            Add Driver Concretization
          </Button>
        </Stack>
      </CardBody>
    </Card>
  );
}
