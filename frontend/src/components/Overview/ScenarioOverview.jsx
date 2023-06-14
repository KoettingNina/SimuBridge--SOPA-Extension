import { Button, Card, CardBody, CardHeader, Heading } from "@chakra-ui/react";
import OverviewResourceTable from "../TablesOverviewComparison/OverviewResourceTable";
import TabBar from "../TabBar";
import ModelBasedOverview from "../TablesOverviewComparison/ModelBasedOverview";
import { getFile, uploadFileToProject } from "../../util/Storage";
import { model } from "../../util/DataModel";

export default function ScenarioOverview({getData}) {
    return <>
        <Card bg="white" mt="25px">
            <CardHeader>
                <Heading size='md'>Resource Overview</Heading>
            </CardHeader>
            <CardBody>
                {/*Call of ResourceParameter Table*/}
                < OverviewResourceTable scenario={getData().getCurrentScenario()}/>
            </CardBody>
        </Card>
        {/*Tabbar to switch between different bpmns within one scenario*/}
        {(getData().getCurrentScenario().models?.length)
            ? <TabBar
            setCurrent={() => {/* TODO */}}
            items={getData().getCurrentScenario().models.map((model, index_bpmn) => {
                return {
                    tabname: model.name,
                    content:
                    // Call of Model-based Table
                        < ModelBasedOverview getData={getData}
                                             currentModel={getData().getCurrentScenario().models?.[index_bpmn]}
                                             parsed={true}/>
                }
            })}/>
            : <Card bg="white" mt="25px">
                <CardHeader>
                    <Heading size='md'>Models Overview</Heading>
                </CardHeader>
                <CardBody>
                    This scenario currently does not have any models. <Button variant='link' onClick={async () => {
                        const fileName = await uploadFileToProject(getData().getProjectName()); //TODO potentially do not create an additional file for this?
                        if (fileName) {
                            const fileData = (await getFile(getData().getProjectName(), fileName)).data;
                            getData().getCurrentScenario().addModel(model(fileName, fileData));
                        }
                    }}> Upload one</Button>.
                </CardBody>
            </Card>}
    </>
}