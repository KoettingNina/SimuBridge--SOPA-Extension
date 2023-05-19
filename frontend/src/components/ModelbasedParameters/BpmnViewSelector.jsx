import React, { useEffect } from 'react'
import BpmnView from './BpmnView'

function BpmnViewSelector({projectName, data, getData, currentScenario, currentBpmn, setObject, setCurrent }) {
  useEffect(() => { 
    setCurrent("Modelbased Parameters")
  }, [setCurrent])

  return getData('currentScenario') && (
    <BpmnView key={currentBpmn} projectName={projectName} getData={getData} setObject={setObject} />
  )
}

export default BpmnViewSelector;
