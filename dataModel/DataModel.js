import { Moddle, isBuiltInType, isSimpleType, parseNameNS } from 'moddle';
import SimulationModelDescriptor, { TimeUnits } from './SimulationModelDescriptor.js';

//TODO potentially rename file

export default function SimulationModelModdle(extensionPackages, options) {
    const packages = Object.assign({simulationmodel : SimulationModelDescriptor}, extensionPackages);
    Moddle.call(this, packages, options);
    Object.values(packages).forEach(pkg => {
        pkg.enumerations.forEach(rawDescriptor => {
            this.registry.registerType(rawDescriptor, pkg);
            const descriptorName = parseNameNS(rawDescriptor.name, pkg.prefix).name;
            const descriptor = this.getTypeDescriptor(descriptorName);
            descriptor.isEnum = true;
            // descriptor.keys = Object.entries(descriptor.values).forEach((key, value) => {
            //     if(!isSimpleType(descriptor.t))
            //     value.$type = descriptorName
            // });
        });
    });
}

SimulationModelModdle.setInstance = function() {
    //TODO
}

SimulationModelModdle.getInstance = function() {
    if (!SimulationModelModdle._instance) {
        SimulationModelModdle._instance = new SimulationModelModdle();
    }
    return SimulationModelModdle._instance;
}

SimulationModelModdle.prototype = Object.create(Moddle.prototype);

//TODO resolve double recursion between create and moddlefy

SimulationModelModdle.prototype.create = function(typeName, attrs) {
    const object = Moddle.prototype.create.call(this, typeName, attrs);
    const descriptor = this.getType(typeName).$descriptor;

    if (isSimpleType(typeName)) {
        throw new Error(`Cannot create object of generic type ${typeName}`);
    }

    if (this.isEnumType(typeName)) {
        throw new Error(`Cannot create object of enum type ${typeName}`);
    }

    const addParentWhereAppropriate = (obj) => {
        if (obj?.$type) obj.$parent = object;
    };

    // Enforce every attribute to be present
    descriptor.properties.forEach(p => {
        try {
            if (p.isMany) {
                object[p.name] = (object[p.name] || []).map(obj => this.moddlefy(obj, p));
                object[p.name].forEach(addParentWhereAppropriate);
            } else {
                object[p.name] = this.moddlefy(object[p.name], p);
                addParentWhereAppropriate(object[p.name]);
            }
        } catch(err) {
            throw new Error(`Failed to moddlefy attribute ${p.name} for parent of type ${typeName}`, {cause : err})
        }
    });

    return object;
}   

SimulationModelModdle.prototype.moddlefy = function(obj, property) {
    const typeName = property?.type;
    if(!typeName) {
        throw Error('No typename defined for object moddlefy');
    }

    if (isSimpleType(typeName) || obj?.$type === typeName) {
        return obj; //TODO: Subattributes?
    } else if (this.isEnumType(typeName)) {
        const descriptor = this.getTypeDescriptor(typeName);
        const isValidIdentifier = Object.keys(descriptor.values).includes(obj);
        const isValidValue = Object.values(descriptor.values).some(value => JSON.stringify(value) === JSON.stringify(obj)); // Check deep equalish
        if (property.isReference && !isValidIdentifier) {
            throw new Error(`${JSON.stringify(obj)} is not a valid identifier for enum ${typeName}`);
        } else if (!property.isReference && !isValidValue) {
            throw new Error(`${JSON.stringify(obj)} is not a valid value for enum ${typeName}`);
        }
        return obj;
    // } else if (property.isReference) {
    //     throw new Error(`Missing value for reference ${property.name} of type ${typeName}`);
    } else {
        return this.create(typeName, obj || {}); 
    }
}

SimulationModelModdle.prototype.isEnumType = function (typeName) {
    return this.getTypeDescriptor(typeName)?.isEnum;
}

SimulationModelModdle.prototype.isValidForEnum = function (object, enumTypeName) {
    if(!enumTypeName || !this.isEnumType(enumTypeName)) {
        throw Error(`Invalid enum type name ${enumTypeName}`);
    }
    const descriptor = this.getTypeDescriptor(enumTypeName);
    return Object.values(descriptor.values).includes(object) || (object === null && descriptor.isNullable /* Accepts only null, not undefined */); //TODO what about equal but not identical?
}



export function scenario(scenarioName) {
    return {
        scenarioName: scenarioName,
        startingDate: "01-01-0000",
        startingTime: "00:00",
        numberOfInstances: 1,
        currency: Currencies.EURO,
        resourceParameters: {
            roles: [],
            resources: [],
            timeTables: []
        },
        models: []
    }
}

//TODO role
//TODO resource
//TODO timetables

export function model(modelName, bpmnXml) {
    return {
        BPMN : bpmnXml,
        name : modelName,
        modelParameter : {
            activities : [],
            events : [],
            gateways : [],
        }
    }
}

export function activity(elementId) {
    return {
        id : elementId,
        resources: [],
        cost: 0,
        duration: distribution()
      }
}

export function event(elementId) {
    return {
        id : elementId,
        interArrivalTime: distribution()
    }
}

export function gateway(elementId) {
    return {
        id : elementId,
        probabilities : {}
    }
}

export function distribution() {
    return {
        distributionType: undefined,
        timeUnit : TimeUnits.MINUTES,
        values: []
    }
}

// Eg. limitToDataScheme(myScenario)
export function limitToDataScheme(object, DEPRECATED_dataScheme) {
    if (DEPRECATED_dataScheme) console.log(`Deprecated parameter data scheme ${DEPRECATED_dataScheme} provided to limit to data scheme`)
    if (!object?.$descriptor) { 
        return object 
    } else {
        return Object.fromEntries(Object.entries(object)
            .filter(([key, value]) => object.$descriptor.properties.some(prop => parseNameNS(prop.name).localName === key))
            .map(([key, value]) =>  [key, Array.isArray(value) ? value.map(limitToDataScheme) : limitToDataScheme(value)])
        );
    }
}