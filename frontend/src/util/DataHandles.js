import BPMNModdle from "bpmn-moddle";
import { deleteFile, getScenarioFileName, setFile, updateProject } from "./Storage.js";
import  SimulationModelModdle, { limitToDataScheme } from 'simulation-bridge-datamodel/DataModel.js';

const moddle = new BPMNModdle();


// Patch clazz in prototype chain between the moddle type and its original supertype
function patchModdleType(clazz, moddleTypeName) {   
    const moddleType = SimulationModelModdle.getInstance().getType(moddleTypeName);
    const baseTypePrototype = Object.getPrototypeOf(moddleType.prototype);
    Object.setPrototypeOf(clazz.prototype, baseTypePrototype);
    Object.setPrototypeOf(moddleType.prototype, clazz.prototype);
    clazz.$moddleType = moddleType;
}

export class ModelData {

    async parseXML() {
        const {
            rootElement,
            references,
            warnings,
            elementsById
        } = await moddle.fromXML(this.BPMN, 'bpmn:Definitions');
        this.elementsById = elementsById;
        this.rootElement = rootElement;
        this.references = references;

        function fixGatewayIncomingAndOutgoing() {
            const gateways = Object.values(elementsById).filter(element => element.$type.includes('Gateway'));
            const sequences = Object.values(elementsById).filter(element => element.$type.includes('SequenceFlow'));
            gateways.forEach(gateway => {
                sequences.forEach(sequence => {
                    if (sequence.targetRef === gateway && !gateway.incoming.includes(sequence)) {
                        gateway.incoming.push(sequence);
                    }
                    if (sequence.sourceRef === gateway && !gateway.outgoing.includes(sequence)) {
                        gateway.outgoing.push(sequence);
                    }
                });
            });
        }
        fixGatewayIncomingAndOutgoing();
    }
}
patchModdleType(ModelData, 'simulationmodel:Model');

export class ScenarioData {

    async save() {
        console.log('save')
        //TODO automatically detect renames
        let scenarioFileName = getScenarioFileName(this.scenarioName);
        await setFile(this.parentProject.projectName, scenarioFileName, JSON.stringify(this));
        updateProject(this.parentProject.projectName)
        await this.parentProject.initializeData();
    }

    async addModel(model) {
        // model.__proto__ = new ModelData();
        model.$parent = this;
        this.models.push(model);
        await this.save();
    }

    toJSON() {
        return limitToDataScheme(this);
    }

    async duplicate() {
        const newScenario = { ...this };
        newScenario.scenarioName = this.scenarioName + '_copy'
        await this.parentProject.addScenario(newScenario);
        //this.parentProject.setCurrentScenarioByName(newScenario.scenarioName);
    }

    async delete() {
        let scenarioFileName = getScenarioFileName(this.scenarioName);
        await deleteFile(this.parentProject.projectName, scenarioFileName);
        await this.parentProject.initializeData();
    }
}
patchModdleType(ScenarioData, 'simulationmodel:Scenario');