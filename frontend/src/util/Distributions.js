import SimulationModelModdle from "simulation-bridge-datamodel/DataModel.js";
import { DistributionTypes } from "simulation-bridge-datamodel/SimulationModelDescriptor.js";

export function getParamsForDistribution(distributionType, distributionValues) {
    return (distributionType === "arbitraryFiniteProbabilityDistribution"
        ? distributionValues?.map((_, index) => 'entry' + index) //TODO: this currently only supports single frequency entries
        : DistributionTypes[distributionType]?.distribution_params);
}

export function stateToDistribution(state) {
    return  SimulationModelModdle.getInstance().create('simulationmodel:TimeDistribution', {
        distributionType: state.distributionType,
        values: getParamsForDistribution(state.distributionType, state.distributionValues).map((key, index) => { return { id: key, value: state.distributionValues[index] } }),
        timeUnit : state.timeUnit
    });
}

export function distributionToState(element) {
    return {
        distributionType : element.distributionType,
        timeUnit: element.timeUnit,
        distributionValues: element.values.map(v => v.value)
    }
}