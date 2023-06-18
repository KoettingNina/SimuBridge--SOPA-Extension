import React from "react";
import {
    Text,
} from '@chakra-ui/react'
import ModelBasedOverview from "./ModelBasedOverview";
import DiffPopover from "./DiffPopover";


function BPMNTableCompare({getData, scenariosCompare}) {
    class ModelBasedOverviewWithComparison extends ModelBasedOverview {

        constructor(props) {
            super(props);

            const {getData, scenariosCompare} = props;


            const differentScenarios = getData().getAllScenarios().filter(item => scenariosCompare.includes(item.scenarioName));
            this.tableData = {};
            differentScenarios.forEach(scenario => {
                this.currentModel = scenario.models[0]; // TODO magic array access // Set current model so super methods can access correct models elements by id
                let scenarioTableData = {};
                this.currentModel.modelParameter.activities.forEach(activity => scenarioTableData[activity.id] = super.createActivityRow(activity));
                this.currentModel.modelParameter.gateways.forEach(gateway => scenarioTableData[gateway.id] = super.createGatewayRow(gateway));
                this.currentModel.modelParameter.events.forEach(event => scenarioTableData[event.id] = super.createEventRow(event));
                this.tableData[scenario.scenarioName] = scenarioTableData;
            });

            console.log(this.tableData)
            this.currentModel = getData().getCurrentModel();
        }

        getCurrentModel() {
            return this.currentModel;
        }

        createCellWithDiff(element, cell, index) {
            const valuesPerScenario = Object.entries(this.tableData).map(([scenarioName, scenarioTableData]) => {
                return {
                    scenarioName,
                    value : scenarioTableData[element.id]?.[index]
                }
            });

            const differences = new Set(valuesPerScenario.map(({scenarioName, value}) => JSON.stringify(value))).size > 1;

            if (differences) {
                return <DiffPopover buttonLabel={cell} body={<>{valuesPerScenario.map(({scenarioName, value}) => {
                    return <Text>{scenarioName} : { value != undefined ? value : "Element not configured" } </Text>
                })}</>}/>
            } else {
                return cell;
            }
        }

        createActivityRow(element) {
            return super.createActivityRow(element).map((cell, index) => this.createCellWithDiff(element, cell, index));
        }

        createGatewayRow(element) {
            return super.createGatewayRow(element).map((cell, index) => this.createCellWithDiff(element, cell, index));
        }

        createEventRow(element) {
            return super.createEventRow(element).map((cell, index) => this.createCellWithDiff(element, cell, index));
        }


    }

    return <ModelBasedOverviewWithComparison {...{getData, scenariosCompare}} />
}

export default BPMNTableCompare


