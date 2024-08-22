import React, { useState, useEffect } from "react";

import {
  Alert, AlertIcon, AlertDescription, CloseButton, useDisclosure,
  Accordion, AccordionItem, AccordionButton, AccordionPanel, AccordionIcon,
  Flex, Heading, Card, CardHeader, CardBody,
  Text, Input, InputGroup, InputRightElement, InputLeftElement,
  Select, Button, Progress, Box, Spinner,
  UnorderedList, ListItem
} from '@chakra-ui/react';
import { ExternalLinkIcon } from '@chakra-ui/icons';

import { fetchAllCostDrivers, calculateCostDrivers } from '../Logic/LcaIntegrationUtils';
import { getCostDriversFromScenario, mapAbstractDriversFromConcrete, saveAllCostDrivers } from "../Logic/LcaDataManager";
import FormattedConcreteDriver from './FormattedConcreteDriver';
import BasicSpinner from "./BasicSpinner";

const LcaIntegration = ({ getData, toasting }) => {
  //vars
  const defaultApiUrl = 'http://localhost:8081';
  const [apiUrl, setApiUrl] = useState(defaultApiUrl);
  const impactMethodId = 'b4571628-4b7b-3e4f-81b1-9a8cca6cb3f8'; //TODO: fix magic string
  const [isApiUrlValid, setIsApiUrlValid] = useState(true);
  const [isFetchingRunning, setIsFetchingRunning] = useState(false);
  const [fetchingProgress, setFetchingProgress] = useState(-1);
  const [isScenarioModelLoaded, setIsScenarioModelLoaded] = useState(false);
  const [allCostDrivers, setAllCostDrivers] = useState([]);
  const [isCostDriversLoaded, setIsCostDriversLoaded] = useState(false);

  //init
  useEffect(() => {
    const uniqueCostDrivers = getCostDriversFromScenario(getData);
    setAllCostDrivers(uniqueCostDrivers);
    setIsCostDriversLoaded(uniqueCostDrivers.length > 0);
    setIsScenarioModelLoaded(true);
  }, [getData]);

  const handleApiUrlChange = (event) => {
    const value = event.target.value;
    setApiUrl(value);
    validateUrl(value);
  };

  const validateUrl = (url) => {
    const regex = /^http:\/\/[\w.]+:\d+$/;
    setIsApiUrlValid(regex.test(url));
  };

  const fillDefaultHostPortButtonClick = () => {
    setApiUrl(defaultApiUrl);
    setIsApiUrlValid(true);
  };

  const handleFetchCostsButtonClick = async () => {
    if (!isApiUrlValid) {
      toasting("error", "Invalid URL", "Please enter a valid URL in the format 'http://[host]:[port]'");
      return;
    }
    setIsFetchingRunning(true);
    setFetchingProgress(0);

    await fetchAllCostDrivers(apiUrl,
      (abstractCostDrivers) => {
        toasting("info", "Success", "Cost drivers fetched successfully. Normalizing results...");
        setFetchingProgress(1 / (abstractCostDrivers.length + 1) * 100);
        calculateCostDrivers(apiUrl, impactMethodId, abstractCostDrivers,
          (progress) => setFetchingProgress(progress),
          (normalizedCostDrivers) => {
            const abstractCostDriversMap = mapAbstractDriversFromConcrete(normalizedCostDrivers);

            saveAllCostDrivers(
              abstractCostDriversMap,
              getData
            );

            toasting("success", "Success", "Cost drivers were successfully saved to the application");
            setIsFetchingRunning(false);
            setAllCostDrivers(abstractCostDriversMap);
            setIsCostDriversLoaded(true);
          },
          (error) => {
            setIsFetchingRunning(false);
            toasting("error", "Error", "Error calculating cost drivers. Please check if the OpenLCA IPC server is running and the URL is correct");
            console.error('API Error:', error);
          });
      },
      (error) => {
        setIsFetchingRunning(false);
        toasting("error", "Error", "Please check if the OpenLCA IPC server is running and the URL is correct");
        console.error('API Error:', error);
      }
    );
  };

  const {
    isOpen: isAlertBoxVisible,
    onClose,
  } = useDisclosure({ defaultIsOpen: true })

  return (
    !isScenarioModelLoaded ?
      <BasicSpinner />
      :
      <Box>
        <Card bg="white" mt="25px">
          <CardHeader>
            <Heading size='md'>Configure OpenLCA integration</Heading>
          </CardHeader>
          <CardBody>
            OpenLCA IPC server host and port:
            <Flex mt={2}>
              <InputGroup size='md' flex='2'>
                <InputLeftElement pointerEvents='none'>
                  <ExternalLinkIcon color='gray.300' />
                </InputLeftElement>
                <Input
                  id="apiUrlInput"
                  size="md"
                  type="url"
                  value={apiUrl}
                  isInvalid={!isApiUrlValid}
                  errorBorderColor='red.300'
                  onChange={handleApiUrlChange}
                  placeholder={'e.g., ' + defaultApiUrl}
                />
                <InputRightElement width='4.5rem' mr={2}>
                  <Button h='1.75rem' size='sm'
                    onClick={fillDefaultHostPortButtonClick}>
                    Default
                  </Button>
                </InputRightElement>
              </InputGroup>
              <Select isDisabled value={impactMethodId} ml={2} flex='2'>
                <option value={impactMethodId}>EF 3.0 weighted and normalized</option>
              </Select>
              <Button
                id='fetchButton'
                onClick={handleFetchCostsButtonClick}
                disabled={isFetchingRunning}
                isLoading={isFetchingRunning}
                loadingText='Fetching...'
                colorScheme='white'
                flex='1'
                variant='outline'
                border='1px'
                borderColor='#B4C7C9'
                color='#6E6E6F'
                _hover={{ bg: '#B4C7C9' }}
                ml={2}
              >
                Fetch
              </Button>
            </Flex>
            {isFetchingRunning &&
              <Progress mt={2} colorScheme='green' size='md' hasStripe
                {...(fetchingProgress >= 0 ? { value: fetchingProgress } : { isIndeterminate: true })}
              />
            }
          </CardBody>
        </Card>

        {!isCostDriversLoaded && isAlertBoxVisible &&
          <Alert status='warning' mt={2} display='flex' alignItems='center' justifyContent='space-between'>
            <Flex alignItems='center'>
              <AlertIcon />
              <AlertDescription>There are no cost drivers saved in the system. Use the window above to fetch.</AlertDescription>
            </Flex>
            <CloseButton position='relative' onClick={onClose} />
          </Alert>
        }
        {isCostDriversLoaded &&
          <Card mt={2}>
            <CardHeader>
              <Heading size='md'>{allCostDrivers.length} abstract cost drivers</Heading>
            </CardHeader>
            <CardBody>
              <Accordion allowToggle>
                {allCostDrivers.map((costDriver, index) => (
                  <AccordionItem key={index}>
                    <h2>
                      <AccordionButton>
                        <Box flex="1" textAlign="left">
                          <Text fontSize="lg" fontWeight="bold">
                            {costDriver.name}
                          </Text>
                        </Box>
                        <AccordionIcon />
                      </AccordionButton>
                    </h2>
                    <AccordionPanel pb={4}>
                      <UnorderedList>
                        {costDriver.concreteCostDrivers.map((concreteCostDriver, index) => (
                          <ListItem key={index}>
                            <FormattedConcreteDriver concreteCostDriver={concreteCostDriver} />
                          </ListItem>
                        ))}
                      </UnorderedList>
                    </AccordionPanel>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardBody>
          </Card>
        }
      </Box>
  );
};

export default LcaIntegration;
