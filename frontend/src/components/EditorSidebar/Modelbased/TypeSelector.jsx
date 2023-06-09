import Activity from './Activity';
import Event from './Event';
import Gateway from './Gateway';

function TypeSelector(props) {

  let ComponentType;
  const {currentElement} = props;

  if (currentElement.$type.includes('Gateway')) {
    ComponentType = Gateway;
  } else if (currentElement.$type.includes('Task')) {
    ComponentType = Activity;
  } else if (currentElement.$type.includes('Event') && !currentElement.$type.includes('Gateway')) {
    ComponentType = Event;
  }

  if (ComponentType) {
    return <ComponentType {...props}/>
  } else {
    return <></>;
  }

}

export default TypeSelector;