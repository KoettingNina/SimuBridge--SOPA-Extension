import Activity from './Activity';
import Event from './Event';
import Gateway from './Gateway';

function TypeSelector({
  getData,
  selectedObject,
  setData,
  setDataObj
}) {

  // If no selectedObject is defined, render the name of the current model
  if (selectedObject.$type === undefined) {
    return <>{getData().getCurrentModel().name}</>;
  }
// If the selectedObject is a gateway, render the Gateway component 
  if (selectedObject.$type.includes('Gateway')) {
    return (
      <Gateway
        getData={getData}
        selectedObject={selectedObject}
       
        setDataObj={setDataObj}
        value={selectedObject.name || ''}
      />
    );
  }

  // If the selectedObject is a task, render the Activity component 
  if (selectedObject.$type.includes('Task')) {
    return (
      <Activity
        getData={getData}
        selectedObject={selectedObject}
       
        setDataObj={setDataObj}
        value={selectedObject.name || ''}
      />
    );
  }

  // If the selectedObject is an event, render the Event 
  if (selectedObject.$type.includes('Event') && !selectedObject.$type.includes('Gateway')) {
    return (
      <Event
        getData={getData}
        selectedObject={selectedObject}
       
        setDataObj={setDataObj}
        value={selectedObject.name || ''}
      />
    );
  }

  // If none of the above conditions are met, render nothing
  return <></>;
}

export default TypeSelector;