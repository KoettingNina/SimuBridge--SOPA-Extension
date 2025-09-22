import * as o from "olca-ipc";


export const getAllImpactMethods = async (apiUrl) => {
    const client = new o.IpcClient.on(apiUrl);
    const impactMethods = await client.getAll(o.RefType.ImpactMethod);
    return impactMethods;
}

export const getImpactMethod = async (apiUrl, impactMethodId) => {
    const client = new o.IpcClient.on(apiUrl);
    const impactMethod = await client.get(
        o.RefType.ImpactMethod,
        { id: impactMethodId, refType: o.RefType.ImpactMethod });
    return impactMethod;
}

export const getAllCostDrivers = async (apiUrl, onSuccess, onError) => {
    try {
        const client = new o.IpcClient.on(apiUrl);
        const systems = await client.getAll(o.RefType.ProductSystem);
        
        onSuccess(systems);
    }
    catch (error) {
        console.error('API Error:', error);
        onError(error);
    }
}

export const calculateCostDriver = async (apiUrl, impactMethod, normalizationSetId,
    targetDriver, onSuccess, onError) => {
    try {
        const client = new o.IpcClient.on(apiUrl);
        let normalizationSet = normalizationSetId && impactMethod.nwSets.filter(set => set.id == normalizationSetId)[0];
        let calcSetup = await o.CalculationSetup.of({
            target: targetDriver,
            impactMethod: impactMethod,
            nwSet: normalizationSet,
            allocation: o.AllocationType.USE_DEFAULT_ALLOCATION,
            withCosts: false,
            withRegionalization: false,
            amount: targetDriver.targetAmount,
            unit: targetDriver.targetUnit
        });

        const result = await client?.calculate(calcSetup);

        if (!result) {
            console.log("calculation failed: no result retrieved");
        }
        const s = await result.untilReady();
        if (s.error) {
            console.log(s.error);
        }

        const driverWeights = await result.getWeightedImpacts();
       
        onSuccess({
            weights: driverWeights,
          
        });
    }
    catch (error) {
        console.error('API Error:', error);
        onError(error);
    }
}
