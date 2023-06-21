import { distributionTypes } from "simulation-bridge-datamodel/DataModel.js";

export function getParamsForDistribution(distributionType, distributionValues) {
    return (distributionType === "arbitraryFiniteProbabilityDistribution"
        ? distributionValues?.map((_, index) => 'entry' + index) //TODO: this currently only supports single frequency entries
        : distributionTypes[distributionType]?.distribution_params);
}

export function stateToDistribution(state) {
    return {
        distributionType: state.distributionType,
        values: getParamsForDistribution(state.distributionType, state.distributionValues).map((key, index) => { return { id: key, value: state.distributionValues[index] } }),
        timeUnit : state.timeUnit
    }
}

export function distributionToState(element) {
    return {
        distributionType : element.distributionType,
        timeUnit: element.timeUnit,
        distributionValues: element.values.map(v => v.value)
    }
}