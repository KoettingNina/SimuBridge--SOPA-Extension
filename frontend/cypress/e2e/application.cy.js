import { getScenarioFileName, purgeDatabase, setFile, updateProject } from "../../src/util/Storage";
import defaultScenarioData from '../fixtures/defaultTestScenario.json'

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


// There seems to be an issue with test isolation on the local runner. This should at least isolate suide runs.
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
    });
});