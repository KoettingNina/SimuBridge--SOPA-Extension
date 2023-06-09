const elementTypeNames = {
    "bpmn:InclusiveGateway" : 'Inclusive Gateway',
    "bpmn:ParallelGateway" : 'Parallel Gateway',
    "bpmn:ExclusiveGateway" : 'Exclusive Gateway',
    "bpmn:StartEvent" : 'Start Event',
    "bpmn:EndEvent" : 'End Event',
    "bpmn:IntermediateEvent" : 'Intermediate Event'
}

export function getElementTypeName(element) {
    if (!element || !element.$type) {
        return 'Element';
    } else if (element.$type.includes('Task')) {
        return 'Activity';
    } else if (elementTypeNames[element.$type]) {
        return elementTypeNames[element.$type]
    } else {
        return element.$type.split(':').pop();
    }
}

export function getElementLabel(element) {
    return element.name || (getElementTypeName(element) + ' ' + element.id)
}