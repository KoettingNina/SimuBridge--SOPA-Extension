import { Text } from '@chakra-ui/react';
import React, { useState } from 'react';
import DistributionEditor from '../../DistributionEditor';
import { distributionToState, stateToDistribution } from '../../../util/Distributions';
import AbstractModelElementEditor from './AbstractModelElementEditor';
import SimulationModelModdle from 'simulation-bridge-datamodel/DataModel';

const Event = ({ getData, currentElement }) => {

  const [eventConfiguration, setEventConfiguration] = useState(undefined);

  let save = () => {throw 'Not set yet'};
  function setSave(saveFunc) {
    save = saveFunc;
  }

  function setArrivalRate(arrivalRate) {
    eventConfiguration.interArrivalTime = stateToDistribution(arrivalRate);
    save();
  }


  return (
    <AbstractModelElementEditor {...{
      type : 'events',
      typeName : 'Event',
      state : eventConfiguration, 
      setState : setEventConfiguration,
      currentElement,
      getData,
      moddleClass : 'simulationmodel:Event',
      setSave
    }}>{
      eventConfiguration && (
        currentElement && !currentElement.$type.includes('EndEvent') ? 
          <>
            <Text fontWeight="bold" fontSize="md">Interarrival Time:</Text>
            <DistributionEditor {...{ state: distributionToState(eventConfiguration.interArrivalTime), setState: setArrivalRate }} />
          </>
          : <>Nothing to configure</>
      )
    }</AbstractModelElementEditor>)
}



export default Event;
