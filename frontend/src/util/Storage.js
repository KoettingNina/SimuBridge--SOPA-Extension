import {openDB} from 'idb'

const PROJECT_PREFIX = 'projects'
const FILE_PREFIX = 'files'
const SCENARIO_PREFIX = 'scenarios'
//TODO make even better interface, e.g., with class-like access
//TODO mask project names to avoid issues with bad naming or introduce project ids

export async function getProjects() {
    const {store} = await getStore(PROJECT_PREFIX, 'readwrite')
    return store.getAll();
}

export async function updateProject(projectName) {
    const {transaction, store} = await getStore(PROJECT_PREFIX, 'readwrite');
    store.put({
        projectName,
        date : new Date().getTime()
    });
    await transaction.complete;
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
    return await openDB('default', 6, {
        upgrade(database) {
            if (!database.objectStoreNames.contains(FILE_PREFIX)) {
                database.createObjectStore(FILE_PREFIX, {keyPath : 'path'});
            }
            if (!database.objectStoreNames.contains(PROJECT_PREFIX)) {
                database.createObjectStore(PROJECT_PREFIX, {keyPath: 'projectName'});
            }
        }
    });
}

async function getStore(storeId, mode='readonly') {
    const database = await getDatabase();
    const transaction = database.transaction(storeId, mode);
    const store = transaction.objectStore(storeId);
    return {transaction, store}
}

async function getFileObjectStorage(mode='readonly') {
    return getStore(FILE_PREFIX, mode);
}

export async function getFiles(projectName) {
    const folderPrefix = projectFilesPrefix(projectName);
    return (await (await getFileObjectStorage('readwrite')).store.getAllKeys())
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
    if(!projectName) throw new Error('No project name provided');
    if(!fileName) throw new Error('No file name provided');

    const {transaction, store} = await getFileObjectStorage('readonly')
    return await store.get(filePath(projectName, fileName));
}

export async function setFile(projectName, fileName, data) {
    if(!projectName) throw new Error('No project name provided');
    if(!fileName) throw new Error('No file name provided');

    const {transaction, store} = await getFileObjectStorage('readwrite');
    store.put({
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
    if(!projectName) throw new Error('No project name provided');
    if(!fileName) throw new Error('No file name provided');

    const {transaction, store} = await getFileObjectStorage('readwrite');
    store.delete(filePath(projectName, fileName));
    await transaction.complete;
}

export async function deleteAllFiles(projectName) {
    const {transaction, store} = await getFileObjectStorage('readwrite');
    store.clear(); //TODO projectname unused
    await transaction.complete;
}

export async function downloadFile(projectName, fileName, encoding='charset=UTF-8') {
    if(!projectName) throw new Error('No project name provided');
    if(!fileName) throw new Error('No file name provided');

    const data = (await getFile(projectName, fileName)).data;
    const encodedData = encodeURIComponent(data);
    const a = document.createElement("a");
    // Creating a download link and triggering a click event
    const fileType = fileName.split('.').pop();

    a.href = 'data:application/' + fileType + ';' + encoding + ',' + encodedData;
    a.download = fileName;
    a.click();
}

export async function uploadFile(encoding='UTF-8') {

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
                    resolve({name : file.name, data : fileContents});
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

export async function uploadFileToProject(projectName, encoding='UTF-8') {
    const {name, data} = await uploadFile(encoding);
    await setFile(projectName, name, data)
    return name;
}