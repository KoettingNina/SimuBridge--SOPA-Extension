import React, { useEffect } from 'react'
import BpmnView from './BpmnView'

function BpmnViewSelector({projectName, getData, setObject, setCurrent }) {
  useEffect(() => { 
    setCurrent("Modelbased Parameters")
  }, [setCurrent])

  return getData().getCurrentScenario() && (
    <BpmnView projectName={projectName} getData={getData} setObject={setObject} />
  )
}

export default BpmnViewSelector;
