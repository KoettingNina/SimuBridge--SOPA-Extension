import React from 'react'
import Sidebar from '../Sidebar';

import {
    Text,
  } from '@chakra-ui/react'


import TypeSelector from './Modelbased/TypeSelector';
import AddResource from './ResourcesBased/AddResource';
import AddRole from './ResourcesBased/AddRole';
import EditResource from './ResourcesBased/EditResource';
import EditRole from './ResourcesBased/EditRole';


const Title = ({text}) => {
    return <Text fontSize={{base: "xs", md:"sm"}} textAlign="center" color="RGBA(0, 0, 0, 0.80)" fontWeight="bold" textTransform="uppercase">{text}</Text>            
};

//TODO get rid of this type of sidebar management
function EditorSidebar(props) {


    const SelectEditor = () =>{
        switch (props.current) {
            case "Resource Parameters": return <EditResource currentResource={props.currentResource} setResource={props.setResource} getData={props.getData} setCurrent={props.setCurrent}/>
            case "Resource Parameters for Roles": return <EditRole currentRole={props.currentRole} setRole={props.setRole} getData={props.getData} setCurrent={props.setCurrent}/>
            case "Add Resource": return <AddResource getData={props.getData}  setCurrent={props.setCurrent}  />
            case "Add Role": return <AddRole getData={props.getData}  setCurrent={props.setCurrent}  />
            default:
                <></>
        }
    }
    return (
        <>
            <Sidebar side="right" backgroundColor="#F0F0F1" title={<Title text={props.current}/>} content={<SelectEditor/>} />
        </>
    )
}

export function EditorSidebarAlternate({content, title}) {
    return (
        <>
            <Sidebar side="right" backgroundColor="#F0F0F1" title={<Title text={title}/>} content={content} />
        </>
    )
}

export default EditorSidebar;