import {DoomPluginEvent, postAllTabs, postSingleTab} from "@app/common/chromeEvents";
import {formatDate} from "@app/common/routines";
import {IConfig, IDDMessage} from "@app/globals";
import {IArchive} from "@app/models/archive";
import {ITask} from "@app/models/task";
import {DoomStorage} from "@app/services/storage";

const setupPopups = (config: IConfig, tabId: number) => postSingleTab(tabId)(DoomPluginEvent.configUpdated, config);

const getCurrentTasks = (): Promise<ITask[]> => DoomStorage.get("tasks");

const putTaskIntoArchive = async (task: ITask): Promise<any> => {
    const archives: IArchive[] = (await DoomStorage.get("archives") as any) || [];
    const day = formatDate(new Date(task.complete));
    const arch: IArchive = archives.find((a) => a.createdDay === day);
    if (arch) {
        arch.tasks.push(task);
    } else {
        archives.push({tasks: [task], createdDay: day});
    }
    return DoomStorage.set("archives", archives)
        .then(() => postAllTabs(DoomPluginEvent.configUpdated, {archives}));
};

const updateTasks = async (cb: (tasks: ITask[]) => any = (t) => t): Promise<any> => {
    let storedTasks: any[] = await getCurrentTasks() || [];
    storedTasks = cb(storedTasks);
    DoomStorage.set("tasks", storedTasks)
        .then(() => postAllTabs(DoomPluginEvent.configUpdated, {tasks: storedTasks}));
    return storedTasks;
};

const updateConfig = async (cb: (arg: {showFace: boolean}) => any): Promise<any> => {
    const showFace = cb(await DoomStorage.get("showFace"));
    DoomStorage.set("showFace", showFace)
        .then(() => postAllTabs(DoomPluginEvent.configUpdated, {showFace}));
};

const updateArchives = async (cb: (tasks: IArchive[]) => any = (t) => t): Promise<any> => {
    const archives: any[] = cb(await DoomStorage.get("archives") || []);
    DoomStorage.set("archives", archives)
        .then(() => postAllTabs(DoomPluginEvent.configUpdated, {archives}));
};

const broadcastConfig = () => {
    return Promise.all([
        DoomStorage.get("tasks"),
        DoomStorage.get("archives"),
        DoomStorage.get("showFace"),
    ])
        .then(([tasks, archives, showFace]) => {
            postAllTabs(DoomPluginEvent.configUpdated, {tasks, archives, showFace});
        });
};

const dispatchMessage = (msg: IDDMessage, sender: any, resp: any) => {
    const {task, tasks, showFace, action, id, done} = msg;
    switch (action) {
        case "configUpdated":
            updateConfig(() => ({showFace}));
            break;
        case "addTask":
            updateTasks((prevTasks) => [...prevTasks, task]);
            break;
        case "startTask":
            updateTasks((prevTasks) => prevTasks.map((t: ITask) => {
                if (t.id === id && !t.worklog.find((w) => !w.finished)) {
                    t.worklog.push({started: (new Date()).getTime(), finished: null});
                }
                return t;
            }));
            break;
        case "updateTask":
            updateTasks((storeTasks) => storeTasks.map((t) => t.id === task.id ? task : t));
            break;
        case "resetTasks":
            updateTasks(() => tasks);
            break;
        case "finishTask":
            updateTasks((storeTasks) => storeTasks.map((t: ITask) => {
                if (t.id === id) t.complete = (new Date()).getTime();
                return t;
            }));
            break;
        case "pauseTask":
            updateTasks((storeTasks) => storeTasks.map((t: ITask) => {
                if (t.id === id) {
                    const ongoing = t.worklog.find((w) => !w.finished);
                    if (ongoing) {
                        ongoing.finished = (new Date()).getTime();
                    }
                }
                return t;
            }));
            break;
        case "deleteTask":
            updateTasks((storeTasks) => storeTasks.filter((t) => t.id !== id));
            break;
        case "requestConfig":
            broadcastConfig();
            break;
        case "archiveTask":
            updateTasks((storeTasks) => {
                const archT = storeTasks.find((t) => t.id === id);
                putTaskIntoArchive(archT);
                return storeTasks.filter((t) => t.id !== id);
            });
            break;
        case "unpackArchive":
            updateArchives((storeArchs) => storeArchs.filter((a) => {
                if (a.createdDay === id) {
                    updateTasks((storeTasks) => storeTasks.concat(a.tasks));
                    return false;
                }
                return true;
            }));
            break;
        case "deleteArchive":
            updateArchives((storeArchs) => storeArchs.filter((a) => a.createdDay !== id));
            break;
        case "refresh":
            updateTasks((storeTasks) => storeTasks);
            break;
    }
};

chrome.runtime.onInstalled.addListener((inst) => {
    alert("DOOM - " + JSON.stringify(inst));

    chrome.tabs.onUpdated.addListener(() => {
        broadcastConfig();
    });
    chrome.runtime.onMessage.addListener(dispatchMessage);
    getCurrentTasks()
        .then((tasks) => {
            chrome.declarativeContent.onPageChanged.removeRules(undefined, () => {
                chrome.declarativeContent.onPageChanged.addRules([{
                    conditions: [
                        new chrome.declarativeContent.PageStateMatcher({
                            pageUrl: {schemes: ["http", "https"]/*, hostEquals: 'developer.chrome.com'*/},
                        }),
                    ],
                    actions: [new chrome.declarativeContent.ShowPageAction()],
                }]);
            });
            broadcastConfig();
        });
});
