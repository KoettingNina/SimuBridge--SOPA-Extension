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
import { getFiles, getProjectData, getProjects, getScenarios, setProjectData } from './util/Storage';

const { compare } = require('js-deep-equals')

function App() {
  const [projectStarted, setStarted] = useState(sessionStorage.getItem('st') || "false") // checks if the starting flaf is stet in the session storage to display the dashboard or otherwise the startpage


  const [parsed, setParsed] = useState(true) // TODO to be removed

  const [currentProject, setCurrentProject] = useState(); //TODO, yes switching project would be nice

  // State is used for changing / adding a project projectName, it firest checks if project is already set as current in the session storage
  const [projectName, setProjectName] = useState(sessionStorage.getItem('currentProject') || "")
  const [projectNameHelper, setProjectNameHelper] = useState(sessionStorage.getItem('currentProject') || "")


  //TODO to be renamed to currentPage or similar
  const [current, setCurrent] = useState("Scenario Parameters")  // Current Page => Imoprtant for the navigation to highlight the current page 


  //TODO remove those or move them to a specific component; this is not global state
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

  let projectData;

  let initializeData; //TODO remove

  {
    // store and set information which BPMN and scenario is currently selected
    const [data, setDataInternal] = useState([]) // method is used to save data from the discoverytool
    const [currentBpmn, setBpmn] = useState(0)
    const [currentScenario, setScenario] = useState(0);

    initializeData = setDataInternal;

    function storeScenario(d) { //TODO
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

    projectData = {
      getCurrentScenario : () => data[currentScenario],
      getAllScenarios : () => data,
      getCurrentModel : () => data[currentScenario]?.models[currentBpmn],
      getAllModels : () => data[currentScenario],

      getScenarioByIndex : index => data[index], //TODO remove
      setScenarioByIndex : (index, scenarioData) => data[index] = scenarioData, //TODO remove
      deleteScenarioByIndex : (index) => data = data.splice(index, 1), //TODO remove
      setCurrentScenarioByIndex : index => setScenario(index), //TODO remove
      setCurrentBpmnByIndex : index => setBpmn(index), //TODO remove
  
      addScenario : (scenarioData) => {
        data.push(scenarioData);
      },

      // Call after some in-place operation has happened
      saveCurrentScenario : () => {
        throw 'Not yet implemented' //TODO
      },

      updateCurrentModel : modelData => {
        throw 'Not yet implemented' //TODO
      },
      updateCurrentScenario : scenarioData => {
        throw 'Not yet implemented' //TODO
      },
    }

    window.projectData = projectData; //TODO for debugging purposes


  }


// Function to make it easy to access only parts of the data
 function getData() {
  return projectData;
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
    getScenarios(projectName).then(scenarioFiles => {
      initializeData(scenarioFiles.map(scenarioFile => JSON.parse(scenarioFile.data)[0])) //TODO remove scenario data inside array
    });
  }

}, [projectStarted]);


  // state to check if a project projectName already exists
  const [invalidProjectName, setInvaild] = useState(false)

  // function to save a project in the storage with a projectName
  // The projectName is also added to the array "projects" in the storage, which includes all project projectNames that are saved in the Storage
  const saveProject = () => {
    //TODO implement
    throw 'Not implemented'
    // let projects = Object.values(getProjects())

    // if((projects.map(x => x.projectName).includes(projectNameHelper)) || (projectNameHelper === "projects")){
    //   setInvaild(true)
    // } else {
    //   setProjectName(projectNameHelper)
    //   sessionStorage.setItem('currentProject', projectNameHelper);

    //   setProjectData(projectNameHelper, data);

    //   toasting("success", "Autosaving", "Autosaving is activated.")

    // }
  }

  return (
    <ChakraProvider theme={theme}>
      <Flex bg="#F9FAFC" h="100%" zIndex={-3} minH="100vh" overflowX="hidden">

      {/*If not session exists the start view is displayed */}

        {projectStarted === "false"?
          <StartView setStarted={setStarted} setProjectName={setProjectName}/>
        :
        <>
      {/* TODO: initialize currentProject somehow */}
      {/*If a session and data exists the dashboard is displayed */}
      {true /* data && data[0]*/ ?
       <>
          <Box zIndex={2} paddingTop={{base: "0", md:"6"}} >
            <Navigation 
              setCurrent={setCurrent}  
              current={current} 
              setStarted={setStarted} 
             
              getData={getData} 

              toasting={toasting}
              />
          </Box>

        
          <Container maxWidth="100%" padding={{base: "0", md:"5"}} overflowX="scroll">

            {/* Modal is a chakra UI component similar to a popup. Here it is used to save a project by its projectName and display an error if the projectName already existis  */}
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
              <Route path="/overview" element={<OverviewPage path="/overview" projectName={projectName} parsed={parsed} getData={getData} setCurrent={setCurrent} current={current} setObject={setObject}  scenariosCompare={scenariosCompare} setScenariosCompare={setScenariosCompare}/>} />
              <Route path="/resource" element={<ResourceOverview path="/resource" getData={getData} current={current} setCurrent={setCurrent} setObject={setObject}   currentResource={currentResource} setResource={setResource} currentRole={currentRole} setRole={setRole} currentTimetable={currentTimetable} setTimetable={setTimetable} />} />
              <Route path="/resource/overview" element={<ResourceOverview path="/resource" getData={getData} current={current} setCurrent={setCurrent} setObject={setObject}   currentResource={currentResource} setResource={setResource} currentRole={currentRole} setRole={setRole} currentTimetable={currentTimetable} setTimetable={setTimetable} />} />
              <Route path="/resource/timetable" element={<TimetableOverview  path="/resource" getData={getData} current={current} setCurrent={setCurrent} setObject={setObject}   currentResource={currentResource} setResource={setResource} currentRole={currentRole} setRole={setRole} currentTimetable={currentTimetable} setTimetable={setTimetable}/>} />

              <Route path="/scenario" element={<ScenarioPage getData={getData} current={current} setCurrent={setCurrent} setObject={setObject}   scenariosCompare={scenariosCompare} setScenariosCompare={setScenariosCompare}  currentResource={currentResource} setResource={setResource} currentRole={currentRole} setRole={setRole} currentTimetable={currentTimetable} setTimetable={setTimetable} selectedScenario={selectedScenario} setSelectedScenario={setSelectedScenario}/>} />
              <Route path="/overview/compare" element={<ComparePage path="/overview" getData={getData} setCurrent={setCurrent} current={current} setObject={setObject}  scenariosCompare={scenariosCompare} setScenariosCompare={setScenariosCompare} notSameScenario={notSameScenario} setNotSameScenario={setNotSameScenario} resourceCompared={resourceCompared} setResourceCompared={setResourceCompared}/>}  />
              <Route path="/overview/compare/differences" element={<OnlyDifferencesPage path="/overview" getData={getData} setCurrent={setCurrent} current={current} setObject={setObject}  notSameScenario={notSameScenario} setNotSameScenario={setNotSameScenario} scenariosCompare={scenariosCompare} setScenariosCompare={setScenariosCompare} resourceCompared={resourceCompared} setResourceCompared={setResourceCompared}/>} />


              <Route path="/modelbased" element={ <BpmnViewSelector zIndex={-5} projectName={projectName} getData={getData} setCurrent={setCurrent} current={current} setObject={setObject}  />} />
              <Route path="/modelbased/tableview" element={ <ModelbasedParametersTable parsed={parsed} getData={getData} current={current} setCurrent={setCurrent} setObject={setObject}   />} />
              <Route path="/simulation" element={<SimulationPage path="/simulation"  projectName={projectName} getData={getData} setCurrent={setCurrent} current={current} setObject={setObject}  toasting={toasting} />} />
              <Route path="/processminer" element={<ProcessMinerPage path="/processminer" projectName={projectName} getData={getData} setCurrent={setCurrent} current={current} setObject={setObject}  toasting={toasting} />} />
              <Route path="/debug" element={<DebugPage path="/debug" projectName={projectName} getData={getData} setCurrent={setCurrent} current={current} setObject={setObject}  toasting={toasting} />} />
              <Route path='*' element={<Navigate to='/overview' />} />
            </Routes>
         </Container>

{/*  These routes define which components are loaded into the right side of the page (sidebar) for each path and pass the needed props*/}
         <Box zIndex={2} paddingTop={{base: "0", md:"6"}} >
            <Routes>
              <Route path="/resource"           element={<EditorSidebar  setCurrent={setCurrent} getData={getData} current={current} currentResource={currentResource} setResource={setResource} selectedObject={currentObject}   currentRole={currentRole} setRole={setRole} currentTimetable={currentTimetable} setTimetable={setTimetable} />} />
              <Route path="/resource/overview"  element={<EditorSidebar  setCurrent={setCurrent} getData={getData} current={current} currentResource={currentResource} setResource={setResource} selectedObject={currentObject}   currentRole={currentRole} setRole={setRole} currentTimetable={currentTimetable} setTimetable={setTimetable}/>} />
              <Route path="/resource/timetable" element={<EditorSidebar  setCurrent={setCurrent} getData={getData} current={current} currentResource={currentResource} setResource={setResource} selectedObject={currentObject}   currentRole={currentRole} setRole={setRole} currentTimetable={currentTimetable} setTimetable={setTimetable}/>} />
              
              <Route path="/scenario"           element={<EditorSidebar  getData={getData} current={current} selectedObject={currentObject}    setCurrent={setCurrent} selectedScenario={selectedScenario} setSelectedScenario={selectedScenario}/> } />


              <Route path="/modelbased"         element={<EditorSidebar  getData={getData} current={current} selectedObject={currentObject}   setObject={setObject} />} />

            </Routes>
          </Box>
        </>
        : <ProgressPage/> }  {/*  The progresspage is shown if a session is started but the data is still not there (waiting from the discovery tool) */}
        </>
        }
      </Flex>


    </ChakraProvider>
  );
}

export default App;
