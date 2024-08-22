import * as openLca from "./OpenLcaConnector.js";

export const calculateCostDrivers = async (apiUrl, impactMethodId, costDrivers,
  updateProgress, onSuccess, onError) => {

  try {
    const impactMethod = await (openLca.getImpactMethod)(apiUrl, impactMethodId);

    let normalizedCostDrivers = [];

    for (const el of costDrivers) {
      await (openLca.calculateCostDriver)(
        apiUrl, impactMethod, el,
        (driverWeights) => {
          const impactSum = driverWeights.map(i => i.amount || 0).reduce((sum, current) => sum + current, 0);
          normalizedCostDrivers.push(
            {
              id: el.id,
              name: el.name,
              category: el.category,
              cost: impactSum
            }
          );

          updateProgress((costDrivers.indexOf(el) + 2) / (costDrivers.length + 1) * 100);
        },
        (error) => onError(error)
      );
    }

    onSuccess(normalizedCostDrivers);
  }
  catch (error) {
    console.error('Calculate cost drivers error:', error);
    onError(error);
  }
}

export const fetchAllCostDrivers = async (apiUrl, onSuccess, onError) => {
  try {
    await (openLca.getAllDescriptors)(apiUrl, onSuccess, onError);
  }
  catch (error) {
    console.error('Fetch all cost drivers error:', error);
    onError(error);
  }
};
