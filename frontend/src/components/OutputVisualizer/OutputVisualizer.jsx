import { Box, Button, Card, CardBody, CardHeader, Flex, FormControl, FormLabel, Heading, Spacer, Select, Stack, Text } from "@chakra-ui/react";
import Multibarchart from "./Multibarchart";
import { deleteFile, getFile, getFiles, uploadFileToProject, uploadFile, setFile } from "../../util/Storage";
import { useEffect, useState } from "react";
import { FiChevronDown } from 'react-icons/fi';
import TabBar from "../TabBar.jsx";
import { axisClasses } from "@mui/x-charts";

const median = arr => {
    const mid = Math.floor(arr.length / 2),
      nums = [...arr].sort((a, b) => a - b);
    return arr.length % 2 !== 0 ? nums[mid] : (nums[mid - 1] + nums[mid]) / 2;
  };

const OutputVisualizerPage = ({projectName, getData, toasting }) => {
   
    const [reloadFlag, setReloadFlag] = useState(true);
    function reload() {
        setReloadFlag(!reloadFlag);
    }

    const [totalChartData, setTotalChartData] = useState();
    const [activityChartData, setActivityChartData] = useState();
    const normalizationFactor = 1000.0;
    const normalizationString = ' x 10^' + (-Math.log10(normalizationFactor));
    const valueFormatter = (value) => (<span>{value.toFixed(2) + ' x 10'}<sup>{-Math.log10(normalizationFactor)}</sup></span>);
    const [calculationMode, setCalculationMode] = useState();

    useEffect(() => {
        getFiles(projectName).then(async fileList => {
            const event_logs = fileList.filter(fileName => fileName.endsWith('.xes')) //TODO create better filter function
            const allEventLogs = await Promise.all(event_logs.map(file => getFile(projectName, file)));

            const parser = new DOMParser();
    
            const totalChartDataToBe = {
                dataset : [{ data : '' }],
                series : []
            };
    
            const activityChartDataToBe = {
                dataset : [],
                series : []
            };

            
            if (allEventLogs === undefined || allEventLogs == [] || (allEventLogs.length == 1 && allEventLogs[0] == undefined)) {
                return;
            }
            allEventLogs.forEach(fileData => {
                const fileXml = parser.parseFromString(fileData.data, "text/xml");

                // TODO hacky way to get scenario name
                let scenarioLabel;
                let scenarioKey;
                
                const folderName = fileData.path.split('/').slice(3, -1).join('/');
                
                const resourceUtilsFile = fileList.filter(fileName => fileName.startsWith(folderName) && fileName.endsWith('resourceutilization.xml'))[0];

                if (resourceUtilsFile === undefined || folderName === "") {
                    scenarioLabel = "Uploaded"; // todo: find better method for naming and finding uploaded scenarios
                    scenarioKey = 'uploaded';
                } else {

                    scenarioLabel = resourceUtilsFile.split('/').slice(-1)[0].split('_Global_resourceutilization.xml')[0];
                    scenarioKey = 'scenario_' + folderName;
                }
                
                
                totalChartDataToBe.series.push({ dataKey: scenarioKey, label: scenarioLabel, valueFormatter });
                activityChartDataToBe.series.push({ dataKey: scenarioKey, label: scenarioLabel, valueFormatter });

                // calculate average cost for process instances
                var processInstanceCosts = [];
                for (const trace of [...fileXml.getElementsByTagName('trace')]) {
                    // get element by key: cost:Process Instance, and get value attribute
                    const processInstanceCost = trace.querySelectorAll('[key="cost:Process_Instance"]')[0].getAttribute("value");
                    const parsedProcessInstanceCost = parseFloat(processInstanceCost);
                    processInstanceCosts.push(parsedProcessInstanceCost);
                }

                // depending on calculation mode, calculate median, max, min or average process instance costs
                switch (calculationMode) {
                    case "MEDIAN":
                        totalChartDataToBe.dataset[0][scenarioKey] = median(processInstanceCosts) * normalizationFactor;
                        break;
                    case "MAX":
                        totalChartDataToBe.dataset[0][scenarioKey] = Math.max(...processInstanceCosts) * normalizationFactor;
                        break;
                    case "MIN":
                        totalChartDataToBe.dataset[0][scenarioKey] = Math.min(...processInstanceCosts) * normalizationFactor;
                        break;
                    default:
                    case "AVERAGE":
                        totalChartDataToBe.dataset[0][scenarioKey] = (processInstanceCosts.reduce((a, b) => a + b, 0) / processInstanceCosts.length) * normalizationFactor;
                        break;
                }

                // calculate costs per activity
                const activityCostMap = new Map();
                for (const trace of [...fileXml.getElementsByTagName('trace')]) {
                    // get all events
                    for (const event of trace.getElementsByTagName('event')) {
                        const lifecycleTransition = event.querySelector('[key="lifecycle:transition"]').getAttribute("value");
                        const activityName = event.querySelector('[key="concept:name"]').getAttribute("value");
                        const storedEventCost = event.querySelector('[key="cost:activity"]')
                        // check if event has cost attached to it and is an end activity
                        if (storedEventCost != null && lifecycleTransition == "complete") {
                            const activityCost = storedEventCost.getAttribute("value");

                            let allCostsOfActivity = activityCostMap.get(activityName)
                            if (allCostsOfActivity && activityCost !== undefined) {
                                allCostsOfActivity.push(parseFloat(activityCost))
                                activityCostMap.set(activityName, allCostsOfActivity)
                            } else {
                                allCostsOfActivity = [parseFloat(activityCost)]
                                activityCostMap.set(activityName, allCostsOfActivity)
                            }
                        }
                    }
                }
                
                activityCostMap.forEach((allCostsForActivity, activityName) => {
                    let dataPoint = activityChartDataToBe.dataset.filter(dataPoint => dataPoint.data == activityName)[0];
                    if(!dataPoint) {
                        dataPoint = {data : activityName};
                        activityChartDataToBe.dataset.push(dataPoint);
                    }
                    
                    //depending on calculation mode, calculate median, max, min or average activity instance costs
                    switch (calculationMode) {
                        case "MEDIAN":
                            dataPoint[scenarioKey] = median(allCostsForActivity) * normalizationFactor;
                            break;
                        case "MAX":
                            dataPoint[scenarioKey] = Math.max(...allCostsForActivity) * normalizationFactor;
                            break;
                        case "MIN":
                            dataPoint[scenarioKey] = Math.min(...allCostsForActivity) * normalizationFactor;
                            break;
                        default:
                        case "AVERAGE":
                            dataPoint[scenarioKey] = (allCostsForActivity.reduce((a, b) => a + b, 0) / allCostsForActivity.length) * normalizationFactor;
                            break;
                    }

                    
                });
            })

            setTotalChartData(totalChartDataToBe);
            setActivityChartData(activityChartDataToBe);
        });
        }, [getData, reloadFlag]);

    function deletePreviousOutputs() {
        getFiles(projectName).then(async fileList => {
            const outputFiles = fileList.filter(fileName => fileName.startsWith('request0')) //TODO create better filter function
            outputFiles.forEach(file => deleteFile(projectName, file));
            const uploadedFile = fileList.find(fileName => fileName.endsWith('uploaded_scenario.xes'))
            if (uploadedFile !== undefined) {
                deleteFile(projectName, uploadedFile);
            }
        });
        reload();
    }

    const totalChartSetting = {
        layout : 'vertical',
        yAxis: [
            { label: 'Average Normalized Environmental Cost per Case'+normalizationString }
        ],
        xAxis: [
            { scaleType: 'band', dataKey : 'data', label: ''}
        ],
    }

    const activityChartSetting = {
        layout : 'horizontal',
        //Controls alignment of X axis label.
        sx: {
            [`.${axisClasses.left} .${axisClasses.label}`]: {
                transform: 'translate(-200px, 0)',
            },
        },
        yAxis: [
            { scaleType: 'band', dataKey: 'data', label: "Activity", barGapRatio: 0.3, categoryGapRatio: 0.4 }
        ],
        xAxis: [
            {
                label: 'Average Normalized Environmental Cost'+normalizationString, //TODO unit
            },
        ],
    }

    return (
        <Box h="93vh" overflowY="auto" p="5" >
            <Stack gap="2">
                <Card bg="white">
                        <CardHeader>
                            <Flex mt={2}>
                                <Heading size='md'> Simulation Output Visualizer </Heading>
                                <Spacer/>
                                <Button onClick={deletePreviousOutputs}>Delete Previous Outputs</Button>
                                <Spacer/>
                                <Button onClick={async () => {
                                const { name, data } = await uploadFile('UTF-8');
                                await setFile(projectName, "uploaded_scenario.xes", data)
                                await uploadFileToProject(projectName).then(reload()); // todo: fix duplicate opening of dialogue
                                    }
                                }>Add Executed Event Log</Button>
                                <Spacer/>
                                <Box>
                                    <FormControl>
                                        <Select value={calculationMode}
                                            width = '100%'  {...(!calculationMode && {color: "gray"})} 
                                            backgroundColor= 'white' icon={<FiChevronDown />}
                                            onChange={evt => {setCalculationMode(evt.target.value); reload();}}>
                                            <option value='' disabled={true} hidden={true}>Calculation Mode</option>
                                            <option value='AVERAGE' color="black">Average</option>
                                            <option value='MEDIAN' color="black">Median</option>
                                            <option value='MIN' color="black">Min</option>
                                            <option value='MAX' color="black">Max</option>
                                        </Select>
                                        <FormLabel>Calculation Mode</FormLabel>
                                    </FormControl>
                                </Box>
                                <Spacer/>
                            </Flex>
                        </CardHeader>
                        <CardBody>
                            {activityChartData && totalChartData && <TabBar
                                setCurrent={() => {reload()}}
                                items={[
                                    {
                                        tabname: 'Total Costs',
                                        content: <Multibarchart {...{chartData: totalChartData, chartSetting : totalChartSetting}}/>
                                    },
                                    {
                                        tabname: 'Costs Per Activity',
                                        content: <Multibarchart {...{chartData: activityChartData, chartSetting : activityChartSetting}}/>
                                    }
                                ]}
                            />}
                            {!activityChartData && <span>No data to display.</span>}
                        </CardBody>
                </Card>
            </Stack>
        </Box>
    );

}

export default OutputVisualizerPage;