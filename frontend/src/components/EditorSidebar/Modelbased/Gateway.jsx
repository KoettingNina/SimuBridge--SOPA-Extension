import { Input, FormControl, FormLabel, Text } from "@chakra-ui/react";
import { React, useState } from "react";
import { getElementLabel } from "../../../util/BpmnUtil";
import { gateway } from "../../../util/DataModel";
import AbstractModelElementEditor from "./AbstractModelElementEditor";


const Gateway = ({ currentElement, getData}) => {

  const [gatewayConfiguration, setGatewayConfiguration] = useState(undefined);

  let save = () => { throw 'Not set yet' };
  function setSave(saveFunc) {
    save = saveFunc;
  }

  function setProbabilities(probabilities) {
    gatewayConfiguration.probabilities = probabilities;
    save();
  }

  function withDefaultProbabilities(gatewayConfiguration) {
    gatewayConfiguration.probabilities = Object.fromEntries(currentElement.outgoing.map(flow => [flow.id, 1 / currentElement.outgoing.length]));
    return gatewayConfiguration;
  }

  const handleprobability = (event, outgoingFlow) => {
    const value = event.target.value;
    gatewayConfiguration.probabilities[outgoingFlow.id] = value;
    setProbabilities(gatewayConfiguration.probabilities);
  };





  return (
    <AbstractModelElementEditor {...{
      type: 'gateways',
      typeName: 'Gateway',
      state: gatewayConfiguration,
      setState: setGatewayConfiguration,
      currentElement,
      getData,
      emptyConfig: withDefaultProbabilities(gateway(currentElement.id)),
      setSave
    }}>

      {gatewayConfiguration && (currentElement && !currentElement.$type.includes('Parallel') && currentElement.outgoing.length > 1 ?
        <FormControl>
          <Text fontWeight="bold" fontSize="md">Branching Probabilities:</Text>
          {currentElement.outgoing.map((outgoingFlow, index) => (
            <FormControl key={index}>
              <FormLabel>to <i>{getElementLabel(outgoingFlow.targetRef)}:</i></FormLabel>
              <Input
                onChange={(event) => handleprobability(event, outgoingFlow)}
                value={gatewayConfiguration.probabilities?.[outgoingFlow.id]}
                bg="white"
                w="50%"
                marginLeft="4%"
                marginBottom="10px"
              />
            </FormControl>
          ))}
        </FormControl>
        : <>Nothing to configure</>)}
    </AbstractModelElementEditor>
  );
};

export default Gateway;
