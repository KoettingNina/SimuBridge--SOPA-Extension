export const distributionTypes = {
    exponential: { distribution_params: ["mean"] },
    normal: { distribution_params: ["mean", "standardDeviation"] },
    uniform: { distribution_params: ["lower", "upper"] },
    constant: { distribution_params: ["constantValue"] },
    erlang: { distribution_params: ["order", "mean"] },
    triangular: { distribution_params: ["lower", "peak", "upper"] },
    binomial: { distribution_params: ["probabiliy", "amount"] },
    arbitraryFiniteProbabilityDistribution: { distribution_params: [] }
}

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