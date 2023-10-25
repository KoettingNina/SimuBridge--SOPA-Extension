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
SimulationModelModdle.prototype = Object.create(Moddle.prototype);


// Utility function to initialize singleton, e.g., in a non-default way with extensions
SimulationModelModdle.setInstance = function(instance) {
    if (!SimulationModelModdle._instance) {
        SimulationModelModdle._instance = instance;
    } else {
        throw new Error('SimulationModelModdle singleton instance already set.')
    }
}

SimulationModelModdle.getInstance = function() {
    if (!SimulationModelModdle._instance) {
        SimulationModelModdle._instance = new SimulationModelModdle();
    }
    return SimulationModelModdle._instance;
}


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
        const isValidNull =  obj === null && descriptor.isNullable /* Accepts only null, not undefined */;
        const isValidIdentifier = Object.keys(descriptor.values).includes(obj) || isValidNull;
        const isValidValue = Object.values(descriptor.values).some(value => JSON.stringify(value) === JSON.stringify(obj)) /*Check deep equalish*/ || isValidNull;
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

// SimulationModelModdle.prototype.isValidForEnum = function (object, enumTypeName) {
//     if(!enumTypeName || !this.isEnumType(enumTypeName)) {
//         throw Error(`Invalid enum type name ${enumTypeName}`);
//     }
//     const descriptor = this.getTypeDescriptor(enumTypeName);
//     return Object.values(descriptor.values).includes(object) || (object === null && descriptor.isNullable /* Accepts only null, not undefined */); //TODO what about equal but not identical?
// }

// Eg. limitToDataScheme(myScenario)
export function limitToDataScheme(object) {
    if(object === undefined) return null;
    return Object.fromEntries(Object.entries(object)
        .map(([key, value]) => ({key, value, moddleProperty : object.$descriptor.properties.find(prop => parseNameNS(prop.name).localName === key)}) )
        .filter(({moddleProperty}) => moddleProperty)
        .map(({key, value, moddleProperty}) => [key, isSimpleType(moddleProperty.type) || SimulationModelModdle.getInstance().isEnumType(moddleProperty.type) ? 
            value : 
            Array.isArray(value) ? 
                value.map(limitToDataScheme) : 
                limitToDataScheme(value)])
    );
}

export function assign(moddleElement, plainObject) {
    Object.entries(SimulationModelModdle.getInstance().create(moddleElement.$descriptor.name, plainObject))
        .filter(([key, value]) => moddleElement.$descriptor.properties.find(prop => parseNameNS(prop.name).localName === key))
        .forEach(([key, value]) => moddleElement[key] = value);
}