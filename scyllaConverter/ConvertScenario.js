// Fix error "Buffer is not defined" from xml-js; https://ethereum.stackexchange.com/questions/140178/referenceerror-buffer-is-not-defined
import { Buffer } from 'buffer';
window.Buffer = window.Buffer || Buffer;

import { json2xml } from 'xml-js';
import createNewJsonGlob from './GlobConfig.js';
import createNewJsonSim from './SimConfig.js';

// set options for conversion from .json to .xml
var options = {
    fullTagEmptyElement: false,
    compact: true,
    ignoreComment: true,
    spaces: '\t',
    instructionHasAttributes: false,
    indentCdata: true,
    addParent: true
};


export async function convertScenario(scenario) {

    if (!scenario.models.length) throw 'No models to convert were provided';

    // create one global configuration:
    const globalConfig_json = createNewJsonGlob(scenario);
    var globalConfig = json2xml(globalConfig_json, options);
    // create one simulation configuration for each model in a scenario:

    const simConfigs = await Promise.all(scenario.models.map(async currentModel => {
        const simConfig_json = await createNewJsonSim(scenario, currentModel);
        var simConfig = json2xml(simConfig_json, options);
        return simConfig;
    }));

    console.log('Converter is finished');
    return {
        globalConfig,
        simConfigs
    }
}