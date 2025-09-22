import conv_ele from './ConvertElements.js';

export default function createNewJsonGlob (scenario) {
    var newJson = {"_declaration": {"_attributes": {"version": "1.0", "encoding": "UTF-8"}}};
    newJson.globalConfiguration = createGlobConfig(scenario);
    return newJson;
}   

/** Scylla global configuration:
 * https://github.com/bptlab/scylla/wiki/Global-Configuration
 *
 * unique id,
 * resource assignment strategies, (<resourceAssignmentOrder> tag)
 * a global simulation seed, (<randomSeed> tag)
 * simulation time zone, ( <zoneOffset> tag) +hh:mm or -hh:mm
 * timetables for resources,(<timetables>) parseable by java LocalTime.pars
 * resource definitions (<resourceData>)
 */
function createGlobConfig(scenario) {
    var globConfig = new Object;
    var attributes = new Object;
    var resourceData = new Object;
    var timetables = new Object;
    var costDriver = new Object; // TODO: should the variable be called costDriver or costDrivers? , in the xml it is called costDriver
    var impactMethodInfo = new Object;

    // Add impact method and normalization set info
    impactMethodInfo._attributes = {
        selectedImpactMethod: scenario.environmentImpactParameters?.selectedImpactMethod || '',
        selectedNormalizationSet: scenario.environmentImpactParameters?.selectedNormalizationSet || ''
    };

    //create Elements from resource parameters:

    // resources:
    resourceData.dynamicResource = conv_ele.createRoles(scenario.resourceParameters.roles);
    let roleMapping = {};
    for (let role of scenario.resourceParameters.roles) {
        for (let resource of role.resources) {
            if (roleMapping[resource.id]) throw new Error(`Resource ${resource} assigned to role ${role} while already being assigned to role ${roleMapping[resource.id]}`);
            roleMapping[resource.id] = role.id;
        }
    }

    scenario.resourceParameters.resources.forEach(resourceInstance => {
        let role = resourceData.dynamicResource.find(role => role._attributes.id === roleMapping[resourceInstance.id]);
        if (!role) throw new Error(`Couldn't assign resource ${resourceInstance.id} to any role.`);
        role.instance.push(conv_ele.createResourceInstance(resourceInstance))
    });

    //timetables:
    timetables.timetable = conv_ele.createTimeTables(scenario.resourceParameters.timeTables);

    costDriver.abstractCostDriver = conv_ele.createAbstractCostDrivers(scenario.environmentImpactParameters.costDrivers);

    attributes.id = scenario.scenarioName + '_Global'
    globConfig.resourceData = resourceData;
    globConfig.timetables = timetables;
    globConfig._attributes = attributes;
    globConfig.costDriver = costDriver;
    globConfig.impactMethodInfo = impactMethodInfo;
    return globConfig;
}