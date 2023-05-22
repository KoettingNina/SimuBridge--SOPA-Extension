import {React, useState, useEffect} from 'react';
import './styles/globals.css'
import {
  ChakraProvider, Box, theme, Flex, Container, Text, useToast, useDisclosure, Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, FormControl, Button, Input, FormLabel, FormErrorMessage,  ModalCloseButton
} from '@chakra-ui/react';
import Navigation from './components/Navigation/Navigation';
import EditorSidebar from './components/EditorSidebar/EditorSidebar';
import StartView from './components/StartView/StartView';
import BpmnViewSelector from './components/ModelbasedParameters/BpmnViewSelector';
import ScenarioPage from './components/ScenarioParameters/ScenarioPage';
import OverviewPage from './components/Overview/OverviewPage';
import OnlyDifferencesPage from './components/Comparison/OnlyDifferencesPage'
import ModelbasedParametersTable from './components/ModelbasedParameters/ModelbasedParametersTable';
import SimulationPage from './components/Simulation/SimulationPage';
import ProcessMinerPage from './components/Processminer/ProcessMinerPage'
import DebugPage from './components/Debug/DebugPage';
import ComparePage from "./components/Comparison/ComparePage";
import TimetableOverview from './components/ResourceParameters/TimeTable/TimetableOverview';
import ResourceOverview from './components/ResourceParameters/Resources/ResourceOverview';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProgressPage from './components/StartView/ProgressPage';
import { getProjectData, getProjects, setProjectData } from './util/Storage';

const { compare } = require('js-deep-equals')

function App() {
  const [projectStarted, setStarted] = useState(sessionStorage.getItem('st') || "false") // checks if the starting flaf is stet in the session storage to display the dashboard or otherwise the startpage


  const [parsed, setParsed] = useState(true) // to be removed

  const [data, setDataInternal] = useState([]) // method is used to save data from the discoverytool
  const [globalState, setGlobalState] = useState({
    projects : [],
    currentProject : undefined,
    currentScenario : undefined,
    currentBpmn : undefined
  });

  // State is used for changing / adding a project projectName, it firest checks if project is already set as current in the session storage
  const [projectName, setProjectName] = useState(sessionStorage.getItem('currentProject') || "")
  const [projectNameHelper, setProjectNameHelper] = useState(sessionStorage.getItem('currentProject') || "")


  //TODO to be renamed to currentPage or similar
  const [current, setCurrent] = useState("Scenario Parameters")  // Current Page => Imoprtant for the navigation to highlight the current page 

  // store and set information which BPMN and scenario is currently selected
  const [currentBpmn, setBpmn] = useState(0)
  const [currentScenario, setScenario] = useState(0)


  // These states are used to store information which "items" are currently selected in the table and are then displayed on the rigth sidebar (EditorSidebar)
  const [currentResource, setResource] = useState("")
  const [currentRole, setRole] = useState("")
  const [currentTimetable, setTimetable] = useState("")
  const [selectedScenario, setSelectedScenario] = useState("")

  // State is used to store information about which BPMN object (event, gateway, task) is selected and displayed on the rigth sidebar (EditorSidebar)
  const [currentObject, setObject] = useState({})



  const [scenariosCompare, setScenariosCompare] = useState("")
  const [notSameScenario, setNotSameScenario] = useState("")
  const [resourceCompared, setResourceCompared] = useState("")



  const {onClose } = useDisclosure()


// This method updates the internal data in the tool if a subcomponent calls the setData method.
//But before the data is changed first it checks if there is realy a change in the data and gives returns a message which is displayed
const setData = (d) => {
  setDataInternal(d)

  if(projectName){

    if(!compare(getProjectData(projectName), d)){
      toasting("success", "Saved", "Saved data")


      console.log(getProjectData(projectName))
      console.log(d)

      setProjectData(projectName, d);
    } else{
      toasting("warning", "Changes", "No changes were detected")
    }

  }

}

// Is a state that comes from the Chakra-UI and is used to display messages (success, warning or error)
const toast = useToast()

// Function coming from chakra UI and is used to display messages (success, warning or error)
const toasting = (type, title, text) =>{
  toast({
    title: title,
    description: text,
    status: type,
    duration: 4000,
    isClosable: true,
  })
}


useEffect(() => {
  if(!sessionStorage.getItem('currentProject')){
    sessionStorage.setItem('st', false);
    setStarted("false")
  }

} ,[])


// if a project is started and has a projectName (meaning it is started by selecting and existing project), the internal data is filled with data from the Storage
useEffect(() => {
  if(projectName){
    setDataInternal(getProjectData(projectName))
  }

}, [projectStarted]);


// code for debugging
useEffect(() => {
  console.log(data)
})


  // state to check if a project projectName already exists
  const [invalidProjectName, setInvaild] = useState(false)

  // function to save a project in the storage with a projectName
  // The projectName is also added to the array "projects" in the storage, which includes all project projectNames that are saved in the Storage
  const saveProject = () => {
    let projects = Object.values(getProjects())

    if((projects.map(x => x.projectName).includes(projectNameHelper)) || (projectNameHelper === "projects")){
      setInvaild(true)
    } else {
      setProjectName(projectNameHelper)
      sessionStorage.setItem('currentProject', projectNameHelper);

      setProjectData(projectNameHelper, data);

      toasting("success", "Autosaving", "Autosaving is activated.")

    }
  }

// Function to make it easy to access only parts of the data
 const getData = (type) => {
  switch (type) {
    case "currentScenario": return data[currentScenario]
    case "allScenarios": return data
    case "currentModel": return data[currentScenario].models[currentBpmn]
    case "allModels": return data[currentScenario]
    default:
      return data
  }

 }

 const addFile = (File) => {
  setData(JSON.parse(JSON.stringify(eval(File))));

}

  return (
    <ChakraProvider theme={theme}>
      <Flex bg="#F9FAFC" h="100%" zIndex={-3} minH="100vh" overflowX="hidden">

      {/*If not session exists the start view is displayed */}

        {projectStarted === "false"?
          <StartView setStarted={setStarted} giveApp={addFile} setProjectName={setProjectName} setData={setData}/>
        :
        <>
      {/* TODO: initialize currentProject somehow */}
      {/*If a session and data exists the dashboard is displayed */}
      {data /*&& data[0]*/ ?
       <>
          <Box zIndex={2} paddingTop={{base: "0", md:"6"}} >
            <Navigation 
              setCurrent={setCurrent}  
              current={current} 
              setStarted={setStarted} 
              currentBpmn={currentBpmn} 
              setBpmn={setBpmn} 
              currentScenario={currentScenario}
              data={data} 
              setScenario={setScenario}
              toasting={toasting}
              />
          </Box>

        
          <Container maxWidth="100%" padding={{base: "0", md:"5"}} overflowX="scroll">

            {/* Modal is a chakra UI component similar to a popup. Her it is used to save a pproject by its projectName and display an error if the projectName already existis  */}
          <Modal
            isOpen={projectName === ""}  //Modal is only shown as long as no projectName is set
            onClose={onClose}
          >
            <ModalOverlay />
            <ModalContent>
              <ModalHeader>Save project</ModalHeader>
              <ModalCloseButton />
              <ModalBody pb={6}>
                <Text>Provide a projectprojectName under which your data is stored</Text>
                <FormControl isInvalid={invalidProjectName}>
                  <FormLabel>ProjectprojectName: </FormLabel>
                  <Input autoFocus={true}  value={projectNameHelper} onChange={(e) => setProjectNameHelper(e.target.value)} placeholder='ProjectprojectName' />
                  {invalidProjectName?  <FormErrorMessage>Project with this projectName already exists</FormErrorMessage> : ""}

                </FormControl>
              </ModalBody>

              <ModalFooter>
                <Button colorScheme='blue' mr={3} onClick={saveProject}>
                  Save
                </Button>
                <Button onClick={onClose}>Cancel</Button>
              </ModalFooter>
            </ModalContent>
          </Modal>

            {/*  These routes define which components are loaded into the center of the page for each path and pass the needed props*/}
            <Routes>
              <Route path="/overview" element={<OverviewPage path="/overview" projectName={projectName} parsed={parsed} getData={getData} setCurrent={setCurrent} current={current} setObject={setObject} currentBpmn={currentBpmn}  data={data} currentScenario={currentScenario} scenariosCompare={scenariosCompare} setScenariosCompare={setScenariosCompare}/>} />
              <Route path="/resource" element={<ResourceOverview path="/resource" setData={setData} getData={getData} current={current} setCurrent={setCurrent} setObject={setObject} currentBpmn={currentBpmn}  data={data} setScenario={setScenario} currentScenario={currentScenario} currentResource={currentResource} setResource={setResource} currentRole={currentRole} setRole={setRole} currentTimetable={currentTimetable} setTimetable={setTimetable} />} />
              <Route path="/resource/overview" element={<ResourceOverview path="/resource" setData={setData} getData={getData} current={current} setCurrent={setCurrent} setObject={setObject} currentBpmn={currentBpmn}  data={data} setScenario={setScenario} currentScenario={currentScenario} currentResource={currentResource} setResource={setResource} currentRole={currentRole} setRole={setRole} currentTimetable={currentTimetable} setTimetable={setTimetable} />} />
              <Route path="/resource/timetable" element={<TimetableOverview  path="/resource" setData={setData} getData={getData} current={current} setCurrent={setCurrent} setObject={setObject} currentBpmn={currentBpmn}  data={data} setScenario={setScenario} currentScenario={currentScenario} currentResource={currentResource} setResource={setResource} currentRole={currentRole} setRole={setRole} currentTimetable={currentTimetable} setTimetable={setTimetable}/>} />

              <Route path="/scenario" element={<ScenarioPage setData={setData} getData={getData} current={current} setCurrent={setCurrent} setObject={setObject} currentBpmn={currentBpmn}  data={data} setScenario={setScenario} currentScenario={currentScenario} scenariosCompare={scenariosCompare} setScenariosCompare={setScenariosCompare}  currentResource={currentResource} setResource={setResource} currentRole={currentRole} setRole={setRole} currentTimetable={currentTimetable} setTimetable={setTimetable} selectedScenario={selectedScenario} setSelectedScenario={setSelectedScenario}/>} />
              <Route path="/overview/compare" element={<ComparePage path="/overview" getData={getData} setCurrent={setCurrent} current={current} setObject={setObject} currentBpmn={currentBpmn}  data={data} currentScenario={currentScenario} scenariosCompare={scenariosCompare} setScenariosCompare={setScenariosCompare} notSameScenario={notSameScenario} setNotSameScenario={setNotSameScenario} resourceCompared={resourceCompared} setResourceCompared={setResourceCompared}/>}  />
              <Route path="/overview/compare/differences" element={<OnlyDifferencesPage path="/overview" getData={getData} setCurrent={setCurrent} current={current} setObject={setObject} currentBpmn={currentBpmn}  notSameScenario={notSameScenario} setNotSameScenario={setNotSameScenario} data={data} currentScenario={currentScenario} scenariosCompare={scenariosCompare} setScenariosCompare={setScenariosCompare} resourceCompared={resourceCompared} setResourceCompared={setResourceCompared}/>} />


              <Route path="/modelbased" element={ <BpmnViewSelector zIndex={-5} projectName={projectName} getData={getData} setCurrent={setCurrent} current={current} setObject={setObject} currentBpmn={currentBpmn}  data={data} currentScenario={currentScenario} />} />
              <Route path="/modelbased/tableview" element={ <ModelbasedParametersTable parsed={parsed} setData={setData} getData={getData} current={current} setCurrent={setCurrent} setObject={setObject} currentBpmn={currentBpmn}   data={data} currentScenario={currentScenario} />} />
              <Route path="/simulation" element={<SimulationPage path="/simulation"  projectName={projectName} getData={getData} setCurrent={setCurrent} current={current} setObject={setObject} currentBpmn={currentBpmn}  data={data} currentScenario={currentScenario} toasting={toasting} />} />
              <Route path="/processminer" element={<ProcessMinerPage path="/processminer" projectName={projectName} setData={setData} getData={getData} setCurrent={setCurrent} current={current} setObject={setObject} currentBpmn={currentBpmn}  data={data} currentScenario={currentScenario} toasting={toasting} />} />
              <Route path="/debug" element={<DebugPage path="/debug" projectName={projectName} setData={setData} getData={getData} setCurrent={setCurrent} current={current} setObject={setObject} currentBpmn={currentBpmn}  data={data} currentScenario={currentScenario} toasting={toasting} />} />
              <Route path='*' element={<Navigate to='/overview' />} />
            </Routes>
         </Container>

{/*  These routes define which components are loaded into the right side of the page (sidebar) for each path and pass the needed props*/}
         <Box zIndex={2} paddingTop={{base: "0", md:"6"}} >
            <Routes>
            <Route path="/resource" element={<EditorSidebar  setCurrent={setCurrent} setData={setData} getData={getData} current={current} currentBpmn={currentBpmn} currentResource={currentResource} setResource={setResource} selectedObject={currentObject}  currentScenario={currentScenario} setScenario={setScenario} currentRole={currentRole} setRole={setRole} currentTimetable={currentTimetable} setTimetable={setTimetable} />} />
              <Route path="/resource/overview" element={<EditorSidebar  setCurrent={setCurrent} setData={setData} getData={getData} current={current} currentBpmn={currentBpmn} currentResource={currentResource} setResource={setResource} selectedObject={currentObject}  currentScenario={currentScenario} setScenario={setScenario} currentRole={currentRole} setRole={setRole} currentTimetable={currentTimetable} setTimetable={setTimetable}/>} />
              <Route path="/resource/timetable" element={<EditorSidebar  setCurrent={setCurrent} setData={setData} getData={getData} current={current} currentBpmn={currentBpmn} currentResource={currentResource} setResource={setResource} selectedObject={currentObject}  currentScenario={currentScenario} setScenario={setScenario} currentRole={currentRole} setRole={setRole} currentTimetable={currentTimetable} setTimetable={setTimetable}/>} />
              
              <Route path="/scenario" element={<EditorSidebar  setData={setData} getData={getData} current={current} currentBpmn={currentBpmn} selectedObject={currentObject}  currentScenario={currentScenario} setScenario={setScenario}  setCurrent={setCurrent} selectedScenario={selectedScenario} setSelectedScenario={selectedScenario}/> } />


              <Route path="/modelbased" element={<EditorSidebar  setData={setData} getData={getData} current={current} currentBpmn={currentBpmn} selectedObject={currentObject}  currentScenario={currentScenario}  setObject={setObject} />} />

            </Routes>
          </Box>
        </>
        : <ProgressPage/> }  {/*  The progresspage is showen if a session is started but the data is still not there (waiting from the discovery tool) */}
        </>
        }
      </Flex>


    </ChakraProvider>
  );
}

export default App;
