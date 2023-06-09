import {React, useState, useEffect} from 'react';
import './styles/globals.css'
import {
  ChakraProvider, Box, theme, Flex, Container, Text, useToast, useDisclosure, Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, FormControl, Button, Input, FormLabel, FormErrorMessage,  ModalCloseButton
} from '@chakra-ui/react';
import Navigation from './components/Navigation/Navigation';
import EditorSidebar from './components/EditorSidebar/EditorSidebar';
import StartView from './components/StartView/StartView';
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
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import ProgressPage from './components/StartView/ProgressPage';
import { deleteFile, getFiles, getProjectData, getProjects, getScenarioFileName, getScenarios, setFile, setProjectData } from './util/Storage';
import BpmnView from './components/ModelbasedParameters/BpmnView';
import { limitToDataScheme, model, scenario } from './util/DataModel';
import BPMNModdle from 'bpmn-moddle';


const { compare } = require('js-deep-equals')

function App() {

  const moddle = new BPMNModdle();

  const [projectStarted, setStarted] = useState(sessionStorage.getItem('st') || "false") // checks if the starting flaf is stet in the session storage to display the dashboard or otherwise the startpage


  const [parsed, setParsed] = useState(true) // TODO to be removed

  // State is used for changing / adding a project projectName, it firest checks if project is already set as current in the session storage
  const [projectName, setProjectName] = useState(sessionStorage.getItem('currentProject') || "")
  const [projectNameHelper, setProjectNameHelper] = useState(sessionStorage.getItem('currentProject') || "")


  //TODO to be renamed to currentPage or similar
  const [current, setCurrent] = useState("Scenario Parameters")  // Current Page => Imoprtant for the navigation to highlight the current page 


  //TODO remove those or move them to a specific component; this is not global state
  // These states are used to store information which "items" are currently selected in the table and are then displayed on the rigth sidebar (EditorSidebar)
  const [currentResource, setResource] = useState("")
  const [currentRole, setRole] = useState("")

  const [currentRightSideBar, setCurrentRightSideBarInternal] = useState(<></>);
  const [rightSideBarHasToBeReset, setRightSideBarHasToBeReset] = useState(false);
  function setCurrentRightSideBar(newRightSideBar) {
    setRightSideBarHasToBeReset(false);
    setCurrentRightSideBarInternal(newRightSideBar);
  }
  // Location effect is racing with component effect, but happens later!
  const location = useLocation();
  useEffect(() => {
    if (rightSideBarHasToBeReset) {
      setCurrentRightSideBar(<></>);
    } else {
      setRightSideBarHasToBeReset(true);
    }
  }, [location])

  // State is used to store information about which BPMN object (event, gateway, task) is selected and displayed on the rigth sidebar (EditorSidebar)
  const [currentObject, setObject] = useState({})



  const [scenariosCompare, setScenariosCompare] = useState("")
  const [notSameScenario, setNotSameScenario] = useState("")
  const [resourceCompared, setResourceCompared] = useState("")



  const {onClose } = useDisclosure()

  const [dataLoaded, setDataLoaded] = useState(false);

  let ProjectDataClass;

  {
    const [data, setDataInternal] = useState(undefined);
    // store and set information which BPMN and scenario is currently selected
    const [currentBpmn, setBpmn] = useState(0)
    const [currentScenarioIndex, setCurrentScenarioIndex] = useState(0);

    function storeProject(d) { //TODO
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

    class ProjectData {

      constructor(projectName) {
        this.projectName = projectName;
        if (data) {
          data.forEach(scenario => scenario.parentProject = this);
        }
      }
      
      addClasses(scenario) {
        scenario.__proto__ = new ScenarioData(this);
        scenario.models.forEach(model => model.__proto__ = new ModelData(scenario));
      }

      getProjectName() {
        return this.projectName;
      }

      async initializeData() {
        const scenarioFiles = await getScenarios(this.projectName);
        const scenarioData = scenarioFiles.map(scenarioFile => { 
          if (!scenarioFile.data) {console.error(`Scenario file ${scenarioFile.path.split('/').pop()} is empty. Skip.`)}
          return scenarioFile.data && JSON.parse(scenarioFile.data)
        }).filter(x => x);
        scenarioData.forEach(this.addClasses);
        await Promise.all(scenarioData.flatMap(scenario => scenario.models.map(model => model.parseXML())));
        setDataInternal(scenarioData);
      }

      getAllScenarios() { return data; }
      getCurrentScenario() { return this.getAllScenarios()?.[currentScenarioIndex]; }
      getAllModels() { return this.getCurrentScenario()?.models; } //TODO should it be in scenario if its about the current one?
      getCurrentModel() { return this.getAllModels()?.[currentBpmn]; } // TODO "

      getScenario(scenarioName) { return this.getAllScenarios().find(scenario => scenario.scenarioName === scenarioName) }
      getScenarioByIndex(index) { return data[index]; }//TODO remove
      deleteScenarioByIndex(index) { 
        const scenario = this.getScenarioByIndex(index);
        this.deleteScenario(scenario);
        setCurrentScenarioIndex(0);
      }//TODO remove
      setCurrentScenarioByIndex(index) { setCurrentScenarioIndex(index); }//TODO remove
      setCurrentBpmnByIndex(index) { setBpmn(index); }//TODO remove

      addScenario(scenario) {
        scenario.__proto__ = new ScenarioData(this);
        scenario.save();
      }

      setCurrentScenario(scenario) {
        if(!this.getAllScenarios().includes(scenario)) throw 'Setting current scenario to unknown scenario';
        setCurrentScenarioIndex(this.getAllScenarios().indexOf(scenario));
      }

      renameScenario(scenario, newName) {
        this.deleteScenario(scenario);
        scenario.scenarioName = newName;
        this.addScenario(scenario);
      }

      deleteScenario(scenario) {
        const scenarioFileName = getScenarioFileName(scenario.scenarioName);
        deleteFile(this.projectName, scenarioFileName); 
        this.initializeData();
      }

      // Call after some in-place operation has happened
      saveCurrentScenario() {
        this.getCurrentScenario().save();
      }
    }

    class ScenarioData {
      constructor(parentProject) {
        this.parentProject = parentProject;
      }

      save() {
        console.log('save')
        //TODO automatically detect renames
        let scenarioFileName = getScenarioFileName(this.scenarioName);
        setFile(this.parentProject.projectName, scenarioFileName, JSON.stringify(this));
        this.parentProject.initializeData();
      }

      addModel(model) {
        model.__proto__ = new ModelData(this);
        this.models.push(model);
        this.save();
      }

      toJSON() {
        return limitToDataScheme(this, scenario);
      }
    }

    class ModelData {
      constructor(parentScenario) {
        this.parentScenario = parentScenario;
      }

      async parseXML() {
        const {
          rootElement,
          references,
          warnings,
          elementsById
        } = await moddle.fromXML(this.BPMN, 'bpmn:Definitions');
        this.elementsById = elementsById;
        this.rootElement = rootElement;
        this.references = references;

        function fixGatewayIncomingAndOutgoing() {
          const gateways = Object.values(elementsById).filter(element => element.$type.includes('Gateway'));
          const sequences = Object.values(elementsById).filter(element => element.$type.includes('SequenceFlow'));
          gateways.forEach(gateway => {
            sequences.forEach(sequence => {
              if (sequence.targetRef === gateway && !gateway.incoming.includes(sequence)) {
                gateway.incoming.push(sequence);
              } 
              if (sequence.sourceRef === gateway && !gateway.outgoing.includes(sequence)) {
                gateway.outgoing.push(sequence);
              } 
            });
          });
        }
        fixGatewayIncomingAndOutgoing();
      }

      toJSON() {
        return limitToDataScheme(this, model);
      }
    }

    ProjectDataClass = ProjectData;

    useEffect(() => {
      if(data && projectData) {
        setDataLoaded(true);
      }
    }, [data])
  }


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


useEffect(() => { //TODO obsolete?
  if(!sessionStorage.getItem('currentProject')){
    sessionStorage.setItem('st', false);
    setStarted("false")
  }

} ,[])



const oldProjectName = projectData?.projectName;
let projectData = new ProjectDataClass(projectName);
window.projectData = projectData; //TODO for debugging purposes

// if a project is started and has a projectName (meaning it is started by selecting and existing project), the internal data is filled with data from the Storage
useEffect(() => {
  if (projectName) {
    if (oldProjectName === projectName) {
      console.log('data set from existing')
    } else {
      projectData.initializeData().then(() => {
        console.log('data set')
      });
    }
  } else {
    projectData = undefined;
    console.log('reset project data')
  }
}, [projectName]);


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

  //TODO further encapsulate side bar related functionality
  function SideBarContentSetterButton({ type, id, ...props }) {

    const sideBarContentTypes = {
      'role': { setter: setRole, getter: () => currentRole, current: 'Resource Parameters for Roles' },
      'resource': { setter: setResource, getter: () => currentResource, current: 'Resource Parameters' }
    }

    function setSideBarContent(type, id) {
      Object.values(sideBarContentTypes).forEach(sideBarContentType => sideBarContentType.setter(undefined)); // Reset all others
      sideBarContentTypes[type].setter(id);
      setCurrent(sideBarContentTypes[type].current);
    }

    function getSideBarContentId() {
      const contentTypeKey = Object.keys(sideBarContentTypes).find(key => sideBarContentTypes[key].current === current);
      return sideBarContentTypes[contentTypeKey]?.getter();
    }

    return <Button {...(getSideBarContentId() === id && { background: "#AEC8CA!important" })} onClick={() => setSideBarContent(type, id)} {...props} >{id}</Button>;
  }

  const atLeastOneScenario = dataLoaded && getData().getCurrentScenario();
  const atLeastOneModel = dataLoaded && atLeastOneScenario && getData().getCurrentModel();

  return (
    <ChakraProvider theme={theme}>
      <Flex bg="#F9FAFC" h="100%" zIndex={-3} minH="100vh" overflowX="hidden">

      {/*If not session exists the start view is displayed */}

        {projectStarted === "false"?
          <StartView setStarted={setStarted} setProjectName={setProjectName}/>
        :
        <>
      {/*If a session and data exists the dashboard is displayed */}
      {dataLoaded ?
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
              <Route path="/overview/compare" element={atLeastOneScenario && <ComparePage path="/overview" getData={getData} setCurrent={setCurrent} current={current} setObject={setObject} scenariosCompare={scenariosCompare} setScenariosCompare={setScenariosCompare} notSameScenario={notSameScenario} setNotSameScenario={setNotSameScenario} resourceCompared={resourceCompared} setResourceCompared={setResourceCompared} />} />
              <Route path="/overview/compare/differences" element={atLeastOneScenario && <OnlyDifferencesPage path="/overview" getData={getData} setCurrent={setCurrent} current={current} setObject={setObject} notSameScenario={notSameScenario} setNotSameScenario={setNotSameScenario} scenariosCompare={scenariosCompare} setScenariosCompare={setScenariosCompare} resourceCompared={resourceCompared} setResourceCompared={setResourceCompared} />} />

              <Route path="/resource" element={atLeastOneScenario && <ResourceOverview path="/resource" getData={getData} setCurrent={setCurrent} SideBarContentSetterButton={SideBarContentSetterButton} />} />
              <Route path="/resource/overview" element={atLeastOneScenario && <ResourceOverview path="/resource" getData={getData} setCurrent={setCurrent} SideBarContentSetterButton={SideBarContentSetterButton} />} />
              <Route path="/resource/timetable" element={atLeastOneScenario && <TimetableOverview path="/resource" {...{getData, setCurrentRightSideBar}} />} />

              <Route path="/scenario" element={atLeastOneScenario && <ScenarioPage {...{ getData, setCurrentRightSideBar }} />} />
              
              <Route path="/modelbased" element={atLeastOneModel && <BpmnView {...{ getData, setCurrentRightSideBar }} />} />
              <Route path="/modelbased/tableview" element={atLeastOneModel && <ModelbasedParametersTable parsed={parsed} getData={getData} current={current} setCurrent={setCurrent} setObject={setObject}   />} />


              <Route path="/simulation" element={<SimulationPage path="/simulation"  {...{projectName, getData, toasting }} />} />
              <Route path="/processminer" element={<ProcessMinerPage path="/processminer" {...{projectName, getData, toasting }} />} />
              <Route path="/debug" element={<DebugPage path="/debug" {...{projectName, getData, toasting }} />} />
              <Route path='*' element={<Navigate to='/overview' />} />
            </Routes>
         </Container>

{/*  These routes define which components are loaded into the right side of the page (sidebar) for each path and pass the needed props*/}
         <Box zIndex={2} paddingTop={{base: "0", md:"6"}} > {/*TODO Translate all other sidebars to the setCurrentRightSideBar pattern*/}
            <Routes>
              <Route path="/resource"           element={<EditorSidebar  setCurrent={setCurrent} getData={getData} current={current} currentResource={currentResource} setResource={setResource} selectedObject={currentObject}   currentRole={currentRole} setRole={setRole}/>} />
              <Route path="/resource/overview"  element={<EditorSidebar  setCurrent={setCurrent} getData={getData} current={current} currentResource={currentResource} setResource={setResource} selectedObject={currentObject}   currentRole={currentRole} setRole={setRole}/>} />
              
              <Route path='*'                   element={currentRightSideBar} />
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
