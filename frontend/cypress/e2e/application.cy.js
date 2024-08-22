import { getScenarioFileName, purgeDatabase, setFile, updateProject } from "../../src/util/Storage";
import { deepCopy } from "../../src/util/ObjectUtil";
import { CopyIcon, DeleteIcon } from "@chakra-ui/icons";
import { FiEye } from "react-icons/fi";
import { renderToString } from 'react-dom/server';


import defaultScenarioData from '../fixtures/defaultTestScenario.json'
import defaultConfigMinerOutput from '../fixtures/defaultConfigurationMinerOutput.json'
import defaultBpmnMinerOutput from '../fixtures/defaultBpmnMinerOutput.js'
import defaultEventLog from '../fixtures/defaultXESLog.js'

import lcaTestScenarioData from '../fixtures/lca/lcaTestScenario.json'
import defaultImpactMethod from '../fixtures/lca/defaultImpactMethod.json'
import defaultCostDrivers from '../fixtures/lca/defaultCostDrivers.json'
import defaultCalculatedCostDriver from '../fixtures/lca/defaultCalculatedDriver.json'
import defaultStateResponse from '../fixtures/lca/defaultStateResponse.json'

function udescribe() { }; // For debug; quick way to comment out a test

const defaultProjectName = 'testProject';
const defaultScenarioName = defaultScenarioData.scenarioName;
const noModelConfigScenarioName = defaultScenarioName + '_noModelConfig';

function loadProjectData(projectNameArg, scenarioName, scenarioData) {
    return cy.wrap((async () => {
        // Default Scenario
        const scenarioFileName = arguments.length === 0 ?
            getScenarioFileName(defaultScenarioName) :
            getScenarioFileName(scenarioName);

        const projectName = arguments.length === 0 ?
            defaultProjectName :
            projectNameArg;

        await setFile(
            projectName,
            scenarioFileName,
            JSON.stringify(
                arguments.length === 0 ? defaultScenarioData : scenarioData
            ));

        // Scenario without model data (as if it was newly created)
        const noModelConfigScenarioData = deepCopy(defaultScenarioData);
        noModelConfigScenarioData.scenarioName = noModelConfigScenarioName;
        noModelConfigScenarioData.models[0].modelParameter = {};
        const noModelConfigScenarioFileName = getScenarioFileName(noModelConfigScenarioData.scenarioName);
        await setFile(defaultProjectName, noModelConfigScenarioFileName, JSON.stringify(noModelConfigScenarioData));

        await updateProject(defaultProjectName);
    })()).then(() => cy.reload()) // Reload to ensure new data is displayed
}

function iconFilter(icon) {
    const iconExample = icon.render ? icon.render() : icon();
    const iconPath = renderToString(iconExample.props.children);
    return (index, element) => {
        return element?.firstChild?.innerHTML === iconPath;
    }
}

function clickButton(label) {
    cy.findByRole('button', { name: new RegExp(label, 'gi') }).click();
    return { shouldLeadTo: (url) => { return cy.url().should('contain', url) } }
}


// There seems to be an issue with test isolation on the local runner. This database purge should at least isolate suite runs.
before(() => {
    purgeDatabase();
});


beforeEach(() => {
    cy.visit('http://localhost:3000');
});

describe('Application', () => {
    it('is available', () => {

    })
});

describe('Project Management', () => {

    function expectCurrentProjectToBe(projectName) {
        cy.findByText(`Project: ${projectName}`).should('exist');
    }

    it('allows creating new projects', () => {
        const projectName = 'foobar';
        cy.findByText('Start new project').click();
        cy.findByRole('textbox', { placeholder: /ProjectName:/i }).type(projectName);
        cy.findByRole('button', { name: /Confirm/i }).click();
        expectCurrentProjectToBe(projectName);
    });

    it('allows to import a project from file', () => {
        const button = cy.findByText('Import Project From File')
        button.should('exist')
        // var x = new MutationObserver(function (e) {
        //     console.log(e);
        //   });  
        // x.observe(document.body, { childList: true });

        button.click();
        // cy.get('input[type=file]').selectFile({
        //     contents: Cypress.Buffer.from('file contents'),
        //     fileName: 'file.txt',
        //     lastModified: Date.now(),
        //   });
        // TODO: Cypress cannot properly handle the file chooser popup, nor can it detect the file input that is deleted directly after clicking it
    });

    it('allows to select an existing project', () => {
        loadProjectData().then(() => {
            cy.findByText(defaultProjectName).click();
            expectCurrentProjectToBe(defaultProjectName);
        });
    })
})

describe('Inside a project', () => {
    beforeEach(() => {
        cy.visit('http://localhost:3000'); // Necessary duplicate to avoid not being able to click on select project
        // load and open default project:
        loadProjectData().then(() => {
            cy.findByText(defaultProjectName).click();
            cy.get('select').select(defaultScenarioName);
        });
    });


    describe('Left Side Bar', () => {

        it('displays the current scenario', () => {
            cy.get('select').find('option:selected').should('have.text', defaultScenarioName);
        });

        it('allows navigation', () => {
            clickButton('Scenario Overview').shouldLeadTo('/scenario');
            clickButton('Resource Parameters').shouldLeadTo('/resource');
            clickButton('Model-based Parameters').shouldLeadTo('/modelbased');
            clickButton('LCA Variants').shouldLeadTo('/lcavariants');
            clickButton('Run Simulation').shouldLeadTo('/simulation');
            clickButton('Run Process Miner').shouldLeadTo('/processminer');
            clickButton('OpenLCA Integration').shouldLeadTo('/lcaintegration');
            clickButton('Project Overview').shouldLeadTo('/overview');
        });

        it('allows to close the project', () => {
            clickButton('Close Project').shouldLeadTo('localhost:3000');
        });

        it('allows to download the project', () => {
            clickButton('Download Project');
            cy.verifyDownload(`${defaultProjectName}.json`)
        });

        //TODO test that scenario / model are hidden when they are not present
        //TODO test that scenario can be selected
    });

    describe('Overview Page', () => {
        it('is shown by default', () => {
            cy.url().should('contain', '/overview')
        });

        function rowForScenario(scenarioName) {
            return cy.get('tr').filter((index, row) => Array.from(row.children).some(cell => cell.textContent === scenarioName));
        }

        describe('Upper Button Bar', () => {
            it('allows to create a new empty scenario', () => {
                const newEmptyScenarioName = 'NewEmptyScenarioFromOverview';
                cy.window().then(window => {
                    cy.stub(window, 'prompt').returns(newEmptyScenarioName);
                    cy.findByRole('button', { name: /new.*empty.*scenario/ig }).click();
                    rowForScenario(newEmptyScenarioName).should('exist');
                    // Postprocess due to bad isolation
                    rowForScenario(newEmptyScenarioName).find('*').filter(iconFilter(DeleteIcon)).click();
                });
            });

            it('forwards to process miner page to create new scenario', () => {
                cy.findByText(/Add Scenario From Process Mining/gi).click()
                cy.url().should('contain', '/processminer')
            });
        });

        describe('Scenario Overview Table', () => {

            it('has a row for the default scenario', () => {
                rowForScenario(defaultScenarioName).should('exist');
            });

            describe('Control Cell', () => {

                function getControlCell() {
                    return rowForScenario(defaultScenarioName).find('td').last();
                }

                it('allows scenario inspection', () => {
                    getControlCell().children().filter(iconFilter(FiEye)).click();
                    cy.url().should('contain', '/scenario');
                    cy.findByText(`Scenario ${defaultScenarioName}`).should('exist');

                });

                it('allows scenario duplication', () => {
                    getControlCell().children().filter(iconFilter(CopyIcon)).click();
                    rowForScenario(`${defaultScenarioName}_copy`).should('exist');
                });

                it('allows scenario deletion', () => {
                    getControlCell().children().filter(iconFilter(DeleteIcon)).click();
                    rowForScenario(defaultScenarioName).should('not.exist');
                });
            });
        })
    });

    describe('Model-based Parameter Page', () => {

        function getModelElement(id) {
            return cy.get(`g[data-element-id=${id}]`)
        }

        const defaultModelParameter = defaultScenarioData.models[0].modelParameter;
        const parameters = [{ scenarioName: defaultScenarioName }, { scenarioName: noModelConfigScenarioName }];


        // BEGIN foreach scenario
        parameters.forEach(currentParameters => {
            describe(JSON.stringify(currentParameters), () => {

                beforeEach(() => {
                    cy.visit('http://localhost:3000/modelbased');
                    cy.get('select').select(currentParameters.scenarioName);
                });

                it('shows all activities and gateways', () => {
                    [...defaultModelParameter.activities, ...defaultModelParameter.gateways]
                        .forEach(({ id }) => getModelElement(id).should('exist'));
                });

                //TODO refactor common code between edit element tests

                it('allows to edit activity costs', () => {
                    const field = () => cy.findAllByRole('textbox', { name: /.*cost.*/gi }).first();
                    const selectElement = () => {
                        getModelElement(defaultModelParameter.activities[0].id).click();
                        cy.findByText('General Parameters').click();
                    };
                    const value = 42.0;

                    selectElement();
                    field().type('{selectAll}{backspace}' + value);
                    cy.wait(1000); // After each keystroke there is a short delay until saved to allow more inputs
                    cy.reload();
                    cy.get('select').select(currentParameters.scenarioName);
                    selectElement();
                    field().should('have.value', '' + value);;
                });

                it('allows to edit gateway probabilities', () => {
                    const field = () => cy.findAllByRole('textbox', { name: /to.*/g }).first();
                    const selectElement = () => getModelElement(defaultModelParameter.gateways[0].id).click();
                    const value = 0.9;

                    selectElement();
                    field().type('{selectAll}{backspace}' + value);
                    cy.wait(1000); // After each keystroke there is a short delay until saved to allow more inputs
                    cy.reload();
                    cy.get('select').select(currentParameters.scenarioName);
                    selectElement();
                    field().should('have.value', '' + value);;
                });

                it('allows to edit event arrival rate', () => {
                    const distributionType = 'triangular';
                    const typeSelect = () => cy.contains(distributionType).parent();
                    const field = () => cy.findAllByRole('textbox', { name: /upper/gi }).first();
                    const selectElement = () => getModelElement(defaultModelParameter.events[0].id).click();
                    const value = 420;

                    selectElement();
                    cy.contains(distributionType).should('not.to.be.visible');
                    typeSelect().select(distributionType);
                    field().type('{selectAll}{backspace}' + value);
                    cy.wait(1000); // After each keystroke there is a short delay until saved to allow more inputs
                    cy.reload();
                    cy.get('select').select(currentParameters.scenarioName);
                    selectElement();
                    field().should('have.value', '' + value);;
                });

                // END foreach scenario
            })
        })

    });

    describe('Resource Parameter Page', () => {

        beforeEach(() => cy.visit('http://localhost:3000/resource'));

        it('allows to create a new role', () => {
            const testRoleName = 'TestRole';
            clickButton('Add Role');
            cy.findByRole('textbox', { name: /Name/g }).type(testRoleName);
            clickButton('Add Role');
            cy.findByRole('button', { name: testRoleName }).should('exist');
        });

        it('allows to create a new resource', () => {
            const testResourceName = 'TestResource';
            clickButton('Add Resource');
            cy.findByRole('textbox', { name: /Name/g }).type(testResourceName);
            clickButton('Add Resource');
            cy.findByRole('button', { name: testResourceName }).should('exist');
        });
    })

    describe('Process Miner Page', () => {
        beforeEach(() => cy.visit('http://localhost:3000/processminer'));

        it('allows converting miner output to a new scenario', () => {
            const defaultConfigMinerOutputFilename = 'simod_results/foobar/best_result/default_simulation_parameters.json';
            const defaultBpmnMinerOutputFilename = 'simod_results/foobar/structure_trial/defaultBpmnMinerOutput.bpmn';
            const defaultEventlogFilename = 'event_log.xes';
            const convertedScenarioName = 'Converted_Scenario';
            cy.wrap((async () => {
                await setFile(defaultProjectName, defaultConfigMinerOutputFilename, JSON.stringify(defaultConfigMinerOutput));
                await setFile(defaultProjectName, defaultBpmnMinerOutputFilename, defaultBpmnMinerOutput);
                await setFile(defaultProjectName, defaultEventlogFilename, defaultEventLog);
            })()).then(() => {
                cy.get('select').contains(/Event Log/gi).select(defaultEventlogFilename);
                cy.get('select').contains(/Config File/gi).select(defaultConfigMinerOutputFilename);
                cy.get('select').contains(/Bpmn File/gi).select(defaultBpmnMinerOutputFilename);
                cy.window().then(window => {
                    cy.stub(window, 'prompt').returns(convertedScenarioName);
                    cy.findByRole('button', { name: /Convert.*Scenario/gi }).click();
                });
                cy.findByText(convertedScenarioName).should('be.selected');
            });
        });
    });


});

describe('LCA Configuration Tests', () => {
    beforeEach(() => {
        cy.visit('http://localhost:3000');

        loadProjectData(
            'testProject',
            lcaTestScenarioData.scenarioName,
            lcaTestScenarioData
        ).then(() => {
            cy.findByText('testProject').click();
        });
    });

    describe('OpenLCA Integration Tests', () => {
        beforeEach(() => {
            cy.intercept(
                'POST',
                'http://localhost:8081',
                (req) => {
                    if (req.body.includes('ImpactMethod')) {
                        if (req.body.includes('get/all')) {
                            req.reply({
                                "jsonrpc": "2.0",
                                result : [defaultImpactMethod.result]
                            });
                        } else {
                            req.reply(defaultImpactMethod);
                        }
                    }
                    else if (req.body.includes('ProductSystem')) {
                        req.reply(defaultCostDrivers);
                    }
                    else if (req.body.includes('data/get/descriptors')) {
                        req.reply(defaultCostDrivers);
                    }
                    else if (req.body.includes('result/total-impacts/weighted')) {
                        req.reply(defaultCalculatedCostDriver);
                    }
                    else if (req.body.includes('result/state')) {
                        req.reply(defaultStateResponse);
                    }
                })
                .as('apiRequest');

            cy.visit('http://localhost:3000/lcaintegration');
        });

        it('checks if the API URL input is present and can be typed into', () => {
            cy.get('input[type="url"]').as('apiUrlInput');
            cy.get('@apiUrlInput').should('be.visible').type('http://localhost:8081');
        });

        it('validates the API URL format on input change', () => {
            const invalidUrl = 'invalid-url';
            const validUrl = 'http://localhost:8081';
            cy.get('input[type="url"]').as('apiUrlInput');
            cy.get('@apiUrlInput').type(invalidUrl);
            clickButton('Fetch Impact Methods');
            cy.get('#apiUrlInput')
                .should('have.attr', 'aria-invalid', 'true');
            cy.findByText('Invalid URL').should('exist');
            cy.get('@apiUrlInput').clear().type(validUrl);
            cy.get('#apiUrlInput')
                .not('have.attr', 'aria-invalid', 'true');
        });

        // TODO test selection of impact method & normalization set

        it('fetches cost drivers when Fetch Costs button is clicked', () => {
            clickButton('Fetch Impact Methods');
            cy.get('#fetchButton').click();
            cy.get('#fetchButton').should('be.disabled');
            cy.get('div[role="progressbar"]').should('be.visible');
        });

        it('displays fetched cost drivers correctly', () => {
            clickButton('Fetch Impact Methods');
            cy.get('#fetchButton').click();
            cy.get('#fetchButton', { setTimeout: 50000 }).not('be.disabled').then(() => {
                cy.get('.chakra-accordion').should('be.visible');
                cy.log(cy.get('.chakra-accordion__button[data-index="0"]'));
                cy.get('.chakra-accordion__button').first().click();
                cy.get('ul[role="list"').find('li').should('have.length', 14);
                cy.get('ul[role="list"').first().find('li').should('have.length', 4);
                cy.get('ul[role="list"').first().find('li').first()
                    .should('contain', 'Delivery_A_Lorry')
                    .should('be.visible');
                cy.get('.chakra-accordion__button[data-index="0"]')
                    .find('.chakra-text')
                    .should('contain', 'Delivery');
            }
            );
        });
    });

    describe('Model-based Parameter Page LCA', () => {
        beforeEach(() => {
            cy.visit('http://localhost:3000/modelbased');
            cy.get('select').select(lcaTestScenarioData.scenarioName);

            const field = () => cy.findAllByRole('textbox', { name: /.*cost.*/gi }).first();
            const selectElement = () => {
                getModelElement(defaultModelParameter.activities[0].id).click();
            };
        });

        it('allows to assign abstract cost drivers', () => {
            const activities = defaultScenarioData.models[0].modelParameter.activities;
            cy.get(`g[data-element-id=${activities[0].id}]`).click();

            cy.findByText('OpenLCA Drivers').click();
            cy.wait(1000);
            cy.findByText('Abstract Cost Drivers').should('exist');
            cy.get('div[id="abstractDriversConfigurator"]')
                .find('button.chakra-button')
                .should('exist')
                .click();
            cy.get('select[name="abstractCostDriver"]')
                .should('exist')
                .select('Delivery');
            cy.get(`g[data-element-id=${activities[1].id}]`)
                .click();
            cy.get('select[name="abstractCostDriver"]')
                .should('not.exist');

            cy.get(`g[data-element-id=${activities[0].id}]`).click({ force: true });
            cy.get('select[name="abstractCostDriver"]')
                .should('exist');
            cy.get('select[name="abstractCostDriver"] option:selected')
                .should('have.text', 'Delivery');
        });

        it('displays the saved abstract drivers', () => {
            const activities = defaultScenarioData.models[0].modelParameter.activities;
            cy.get(`g[data-element-id=${activities[2].id}]`).click();
            cy.findByText('OpenLCA Drivers').click();
            cy.wait(1000);
            cy.get('select[name="abstractCostDriver"]')
                .should('be.visible');
            cy.get('select[name="abstractCostDriver"] option:selected')
                .should('have.text', 'Filling Material');
        });

        it('checks unique abstract drivers', () => {
            const activities = defaultScenarioData.models[0].modelParameter.activities;
            cy.get(`g[data-element-id=${activities[2].id}]`).click();
            cy.findByText('OpenLCA Drivers').click();
            cy.wait(1000);
            cy.get('select[name="abstractCostDriver"] option')
                .should('not.have.text', 'Filling Material');
        });
    });

    describe('Variants Page LCA', () => {
        beforeEach(() => {
            cy.visit('http://localhost:3000/lcavariants');
            cy.get('select').select(lcaTestScenarioData.scenarioName);
        });

        it('LCA variant validation', () => {
            const newVariantName = 'NewVariant';
            cy.findByRole('textbox', { placeholder: /Variant Name/i }).type(newVariantName);
            cy.wait(1000);
            cy.get('button[id="cancelVariantButton"]').should('not.exist');
            cy.get('button[id="saveVariantButton"]').click();
            cy.findByText('Invalid input').should('exist');
            cy.get('div[id^="mapping"]').should('not.exist');
        });

        it('loads with default values for a new variant', () => {
            cy.findByRole('textbox', { placeholder: /Variant Name/i }).should('have.value', '');
            cy.get('input[id="variantFrequencyInput"').should('have.value', '15%');
        });

        it('adds a new driver mapping', () => {
            cy.findByText('Add Driver Concretization').click();
            cy.get('div[id^="mapping"]').should('have.length', 1);
        });

        it('removes a driver mapping', () => {
            cy.findByText('Add Driver Concretization').click();
            cy.get('button[aria-label="Remove mapping"]').first().click();
            cy.get('div[id^="mapping"]').should('have.length', 0);
        });

        it('saves a new variant', () => {
            const newVariantName = 'NewVariant';
            cy.findByRole('textbox', { placeholder: /Variant Name/i }).type(newVariantName);
            cy.findByText('Add Driver Concretization').click();
            cy.get('input[id="variantFrequencyInput"').type('87');
            cy.get('select[id="abstractDriverSelect"]').select('Shipment');
            cy.get('select[id="concreteDriverSelect"] option').should('have.length', 5);
            cy.get('select[id="concreteDriverSelect"]').select('Shipment_B_Lorry');
            cy.get('button[id="saveVariantButton"]').click();
            cy.wait(1000);
            cy.findByText('Variant saved').should('exist');
            cy.findByRole('textbox', { placeholder: /Variant Name/i }).should('have.value', '');
            cy.get('input[id="variantFrequencyInput"').should('have.value', '15%');
            cy.get('button.chakra-accordion__button').should('have.length', 1);
        });
    });
});
