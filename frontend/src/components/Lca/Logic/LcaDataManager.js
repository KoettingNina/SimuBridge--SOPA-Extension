import SimulationModelModdle from "simulation-bridge-datamodel/DataModel";

export const getCostDriversFromScenario = (getData) => {
    const scenario = getData().getCurrentScenario();

    if (scenario) {
        const costDrivers = scenario.resourceParameters.costDrivers;
        if (costDrivers) {
            const uniqueCostDrivers = Array.from(new Map(costDrivers.map(item => [item.id, item])).values());
            return uniqueCostDrivers;
        }
    }
    return [];
};

export const getVariants = (getData) => {
    const scenario = getData().getCurrentScenario();
    
    if (scenario && scenario.resourceParameters.variants) {
        return scenario.resourceParameters.variants;
    }
    return [];
};

export const mapAbstractDriversFromConcrete = (concreteCostDrivers) => {
    let abstractCostDriversMap = new Map();
    concreteCostDrivers.forEach(el => {
        let concreteDriver = SimulationModelModdle.getInstance().create("simulationmodel:ConcreteCostDriver", {
            id: el.id,
            name: el.name,
            cost: el.cost,
        });
        if (!abstractCostDriversMap.has(el.category)) {
            let abstractDriver = SimulationModelModdle.getInstance().create("simulationmodel:AbstractCostDriver", {
                id: el.category,
                name: el.category,
                concreteCostDrivers: [concreteDriver]
            });
            abstractCostDriversMap.set(el.category, abstractDriver);
        } else {
            let abstractDriver = abstractCostDriversMap.get(el.category);
            abstractDriver.concreteCostDrivers.push(concreteDriver);
        }
    }
    );
    return Array.from(abstractCostDriversMap.values());
};

export const saveAllCostDrivers = async (abstractCostDrivers, getData) => {
    getData().getCurrentScenario().resourceParameters.costDrivers = abstractCostDrivers;
    await getData().saveCurrentScenario();
};

export const saveCostVariant = async (variant, updatedVariants, getData) => {
    //save variants and its mappings
    let driversMappings = variant.mappings.map(mapping => {
        return SimulationModelModdle.getInstance().create("simulationmodel:DriverConcretization", {
            abstractDriver: mapping.abstractDriver,
            concreteDriver: mapping.concreteDriver,
        });
    });

    let updatedVariant = SimulationModelModdle.getInstance().create("simulationmodel:Variant", {
        id: variant.id,
        name: variant.name,
        frequency: variant.frequency,
        mappings: driversMappings,
    });
    let updatedVariantsObject = [...updatedVariants.filter(v => v.id !== variant.id), updatedVariant];
    getData().getCurrentScenario().resourceParameters.variants = updatedVariantsObject;
    await getData().saveCurrentScenario();
};


export const deleteVariantFromConfiguration = async (variantId, getData) => {
    getData().getCurrentScenario().resourceParameters.variants = getData().getCurrentScenario().resourceParameters.variants.filter(v => v.id !== variantId);
    await getData().saveCurrentScenario();
};