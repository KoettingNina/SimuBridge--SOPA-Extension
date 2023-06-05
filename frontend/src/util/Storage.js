import {openDB} from 'idb'

const PROJECT_PREFIX = 'projects'
const FILE_PREFIX = 'files'
const SCENARIO_PREFIX = 'scenarios'
//TODO make even better interface, e.g., with class-like access
//TODO mask project names to avoid issues with bad naming or introduce project ids


//TODO project data storage to be changed from localstorage to database storage

export function getProjects() {
    return JSON.parse(localStorage.getItem(PROJECT_PREFIX)) || {};
}

function setProjects(projects) {
    localStorage.setItem(PROJECT_PREFIX, JSON.stringify(projects));
}

export function getProjectData(projectName) {
    return JSON.parse(localStorage.getItem(PROJECT_PREFIX + '/' + projectName));
}

export function setProjectData(projectName, data) {
    //TODO check for uniqueness of project
    localStorage.setItem(PROJECT_PREFIX + '/' + projectName, JSON.stringify(data));

    // Update last-changed-date
    let projects = getProjects();
    if (projects[projectName]) console.log(`Project named ${projectName} already exists. Will be overridden`);
    projects[projectName] = {projectName: projectName, date: new Date()};
    setProjects(projects); 
}

function projectFilesPrefix(projectName) {
    return PROJECT_PREFIX + '/' + projectName + '/' + FILE_PREFIX;
}

function sanitizePath(fileName) { //TODO unused
    return fileName.replace(' ', '_')
}

function filePath(projectName, fileName) {

    return projectFilesPrefix(projectName) + '/' + fileName;
}

async function getDatabase() {
    return await openDB('default', 3, {
        upgrade(database) {
            if (!database.objectStoreNames.contains(FILE_PREFIX)) {
                database.createObjectStore(FILE_PREFIX, {keyPath : 'path'});
            }
            if (!database.objectStoreNames.contains(PROJECT_PREFIX)) {
                database.createObjectStore(PROJECT_PREFIX, {keyPath: 'id', autoIncrement: true});
            }
        }
    });
}

async function getFileObjectStorage(mode='readonly') {
    const database = await getDatabase();
    console.log(database.objectStoreNames)
    const transaction = database.transaction(FILE_PREFIX, mode);
    const filesStore = transaction.objectStore(FILE_PREFIX);
    return {transaction, filesStore}
}

export async function getFiles(projectName) {
    const folderPrefix = projectFilesPrefix(projectName);
    return (await (await getFileObjectStorage('readwrite')).filesStore.getAllKeys())
        .filter(key => key.startsWith(folderPrefix))
        .map(key => key.substring(key.indexOf(folderPrefix) + folderPrefix.length + 1))
}

export async function getScenarios(projectName) {
    return (await Promise.all(
        (await getFiles(projectName))
            .filter(fileName => fileName.startsWith(SCENARIO_PREFIX))
            .map(fileName => getFile(projectName, fileName))
        ));
}

export async function getFile(projectName, fileName) {
    if(!projectName) throw 'No project name provided';
    if(!fileName) throw 'No file name provided';

    const {transaction, filesStore} = await getFileObjectStorage('readonly')
    return await filesStore.get(filePath(projectName, fileName));
}

export async function setFile(projectName, fileName, data) {
    if(!projectName) throw 'No project name provided';
    if(!fileName) throw 'No file name provided';

    const {transaction, filesStore} = await getFileObjectStorage('readwrite');
    filesStore.put({
        path : filePath(projectName, fileName),
        data : data,
        lastChanged : new Date().getTime()
    });
    await transaction.complete;
}

export function getScenarioFileName(scenarioName) {
    return SCENARIO_PREFIX + '/' + scenarioName + '.json';
}

export async function deleteFile(projectName, fileName) {
    if(!projectName) throw 'No project name provided';
    if(!fileName) throw 'No file name provided';

    const {transaction, filesStore} = await getFileObjectStorage('readwrite');
    filesStore.delete(filePath(projectName, fileName));
    await transaction.complete;
}

export async function deleteAllFiles(projectName) {
    const {transaction, filesStore} = await getFileObjectStorage('readwrite');
    filesStore.clear(); //TODO projectname unused
    await transaction.complete;
}

export async function downloadFile(projectName, fileName, encoding='charset=UTF-8') {
    if(!projectName) throw 'No project name provided';
    if(!fileName) throw 'No file name provided';

    const data = (await getFile(projectName, fileName)).data;
    const encodedData = encodeURIComponent(data);
    const a = document.createElement("a");
    // Creating a download link and triggering a click event
    const fileType = fileName.split('.').pop();

    a.href = 'data:application/' + fileType + ';' + encoding + ',' + encodedData;
    a.download = fileName;
    a.click();
}

export async function uploadFile(projectName, encoding='UTF-8') {
    if(!projectName) throw 'No project name provided';

    let fileInput = document.createElement("input");
    document.body.appendChild(fileInput);
    fileInput.setAttribute('type', 'file');
    const filePromise = new Promise((resolve, reject) => {
        fileInput.addEventListener('change', function (e) {
            let file = e.target.files[0];
            if (file) {
                let reader = new FileReader();
                if (encoding === 'base64') {
                    reader.readAsDataURL(file);
                } else {
                    reader.readAsText(file, encoding);
                }
                reader.onload = function (evt) {
                    const fileContents = evt.target.result;
                    setFile(projectName, file.name, fileContents).then(() => resolve(file.name));
                }
            } else {
                reject();
            }
        }, false);
        fileInput.click();
        document.body.removeChild(fileInput);
    });
    return await filePromise;
}