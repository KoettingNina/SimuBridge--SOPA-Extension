import { getScenarioFileName, purgeDatabase, setFile, updateProject } from "../../src/util/Storage";
import { CopyIcon, DeleteIcon } from "@chakra-ui/icons";
import { FiEye } from "react-icons/fi";
import { renderToString } from 'react-dom/server';


import defaultScenarioData from '../fixtures/defaultTestScenario.json'
import defaultConfigMinerOutput from '../fixtures/defaultConfigurationMinerOutput.json'
import defaultBpmnMinerOutput from '../fixtures/defaultBpmnMinerOutput.js'
import defaultEventLog from '../fixtures/defaultXESLog.js'

function udescribe(){}; // For debug; quick way to comment out a test

const defaultProjectName = 'testProject';
const defaultScenarioName = defaultScenarioData.scenarioName;

function loadDefaultProjectData() {
    const fileName = getScenarioFileName(defaultScenarioName);
    return cy.wrap((async () => {
        await setFile(defaultProjectName, fileName, JSON.stringify(defaultScenarioData));
        await updateProject(defaultProjectName);
    })()).then(() => cy.reload()) // Reload to ensure new data is displayed
}

function iconFilter(icon) {
    const iconExample = icon.render ? icon.render() : icon();
    const iconPath = renderToString(iconExample.props.children);
    return (index, element) => {
        return element.firstChild.innerHTML === iconPath;
    }
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
        loadDefaultProjectData().then(() => {
            cy.findByText(defaultProjectName).click();
            expectCurrentProjectToBe(defaultProjectName);
        });
    })
})

describe('Inside a project', () => {
    beforeEach(() => {
        cy.visit('http://localhost:3000'); // Necessary duplicate to avoid not being able to click on select project
        // load and open default project:
        loadDefaultProjectData().then(() => cy.findByText(defaultProjectName).click())
    });


    describe('Left Side Bar', () => {
        function clickButton(label) {
            cy.findByRole('button', { name: new RegExp(label, 'i') }).click();
            return { shouldLeadTo : (url) => { return cy.url().should('contain', url) } }
        }

        it('displays the current scenario', () => {
            cy.get('select').find('option:selected').should('have.text', defaultScenarioName);
        });

        it('allows navigation', () => {
            clickButton('Scenario Overview').shouldLeadTo('/scenario');
            clickButton('Resource Parameters').shouldLeadTo('/resource');
            clickButton('Model-based Parameters').shouldLeadTo('/modelbased');
            clickButton('Run Simulation').shouldLeadTo('/simulation');
            clickButton('Run Process Miner').shouldLeadTo('/processminer');
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

        describe('Scenario Overview Table', () => {

            function rowForScenario(scenarioName) {
                return cy.get('tr').filter((index, row) => Array.from(row.children).some(cell => cell.textContent === scenarioName));
            }
            
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

        beforeEach(() => cy.visit('http://localhost:3000/modelbased'));

        it('shows all activities and gateways', () => {
            [... defaultModelParameter.activities, ... defaultModelParameter.gateways]
                .forEach(({id}) => getModelElement(id).should('exist'));
        });

        it('allows to edit gateway probabilities', () => {
            const field = () => cy.findAllByRole('textbox', { name: /to.*/g }).first();
            const selectElement = () => getModelElement(defaultModelParameter.gateways[0].id).click();
            const value = 0.9;

            selectElement();
            field().type('{selectAll}{backspace}'+value);
            cy.wait(1000); // After each keystroke there is a short delay until saved to allow more inputs
            cy.reload();
            selectElement();
            field().should('have.value', ''+value);;
        });

    });

    describe.only('Process Miner Page', () => {
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