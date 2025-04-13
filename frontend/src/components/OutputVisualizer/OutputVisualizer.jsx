import { Box, Button, Card, CardBody, CardHeader, Flex, Heading, Spacer, Stack } from "@chakra-ui/react";
import Multibarchart from "./Multibarchart";
import { deleteFile, getFile, getFiles } from "../../util/Storage";
import { useEffect, useState } from "react";
import TabBar from "../TabBar.jsx";
import { axisClasses } from "@mui/x-charts";

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


    useEffect(() => {
        getFiles(projectName).then(async fileList => {
            const event_logs = fileList.filter(fileName => fileName.endsWith('.xes')) //TODO create better filter function
            console.log(event_logs);
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

            allEventLogs.forEach(fileData => {
                const fileXml = parser.parseFromString(fileData.data, "text/xml");

                // TODO hacky way to get scenario name
                const folderName = fileData.path.split('/').slice(3, -1).join('/');
                const resourceUtilsFile = fileList.filter(fileName => fileName.startsWith(folderName) && fileName.endsWith('resourceutilization.xml'))[0];
                let scenarioLabel;
                try {
                    scenarioLabel = resourceUtilsFile.split('/').slice(-1)[0].split('_Global_resourceutilization.xml')[0];
                } catch (error) {
                    scenarioLabel = "Uploaded"
                }

                const scenarioKey = 'scenario_' + folderName;
                totalChartDataToBe.series.push({ dataKey: scenarioKey, label: scenarioLabel, valueFormatter });
                activityChartDataToBe.series.push({ dataKey: scenarioKey, label: scenarioLabel, valueFormatter });

                // change calculation!
                var processInstanceCosts = [];
                for (const trace of [...fileXml.getElementsByTagName('trace')]) {
                    // get element by key: cost:Process Instance, and get value attribute
                    const processInstanceCost = trace.innerHTML.querySelectorAll('[key="cost:Process_Instance"]')[0].getAttribute("value");
                    const parsedProcessInstanceCost = parseFloat(processInstanceCost);
                    processInstanceCosts.push(parsedProcessInstanceCost);
                }
                const averageProcessInstanceCost = (processInstanceCosts.reduce((a, b) => a + b, 0) / processInstanceCosts.length) * normalizationFactor;
                totalChartDataToBe.dataset[0][scenarioKey] = averageProcessInstanceCost;

                const activityCostMap = new Map();
                for (const trace of [...fileXml.getElementsByTagName('trace')]) {
                    // get all events
                    for (const event of trace.getElementsByTagName('events').innerHTML) {
                        const activityName = event.querySelectorAll('[key=concept:name]')[0].getAttribute("value");
                        const activityCost = event.querySelectorAll('[key=cost:activity]')[0].getAttribute("value");
                        let allCostsOfActivity = activityCostMap.get(activityName)
                        if (totalActivityCost && activityCost !== undefined) {
                           activityCostMap.set(activityName, allCostsOfActivity.push(parseFloat(activityCost)))
                        } else {
                            activityCostMap.set(activityName, [parseFloat(activityCost)])                        
                        }
                    }
                }
                activityCostMap.array.forEach((allCostsForActivity, activityName) => {
                    let dataPoint = activityChartDataToBe.dataset.filter(dataPoint => dataPoint.data == activityName)[0];
                    if(!dataPoint) {
                        dataPoint = {data : activityName};
                        activityChartDataToBe.dataset.push(dataPoint);
                    }

                    // const averageProcessInstanceCost = (processInstanceCosts.reduce((a, b) => a + b, 0) / processInstanceCosts.length) * normalizationFactor;
                    dataPoint[scenarioKey] = (allCostsForActivity.reduce((a,b) => a + b, 0) / allCostsForActivity.length) * normalizationFactor;
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