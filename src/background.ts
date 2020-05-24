import {DoomPluginEvent, postActiveTabs, postAllTabs} from "@app/common/chromeEvents";
import {formatDate} from "@app/common/routines";
import {IConfig, IConfigOptions, IDDMessage} from "@app/globals";
import {IArchive} from "@app/models/archive";
import {ITask} from "@app/models/task";
import {DoomStorage} from "@app/services/storage";

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

const updateOptions = async (cb: (arg: IConfigOptions) => any): Promise<any> => {
    const options = cb(await DoomStorage.get("options"));
    return DoomStorage.set("options", options)
        .then(() => postAllTabs(DoomPluginEvent.configUpdated, {options}));
};

const updateArchives = async (cb: (tasks: IArchive[]) => any = (t) => t): Promise<any> => {
    const archives: any[] = cb(await DoomStorage.get("archives") || []);
    DoomStorage.set("archives", archives)
        .then(() => postAllTabs(DoomPluginEvent.configUpdated, {archives}));
};

const getConfig = (): Promise<IConfig> => {
    return Promise.all([
        DoomStorage.get("tasks"),
        DoomStorage.get("archives"),
        DoomStorage.get("options"),
    ])
        .then(([tasks, archives, options]) =>
            ({
                tasks: tasks || [],
                archives: archives || [],
                options: options || {showFace: false, readHelp: []},
            }));
};

const broadcastConfig = () => {
    return getConfig()
        .then((config) => postAllTabs(DoomPluginEvent.configUpdated, config));
};

const dispatchMessage = (msg: IDDMessage, sender: any, sendResponse: (msg: any) => any) => {
    const {task, tasks, action, id} = msg;
    switch (action) {
        case DoomPluginEvent.setOptions:
            updateOptions((prev) => {
                const options = msg;
                delete options.action;
                return {...prev, ...options};
            });
            break;
        case DoomPluginEvent.addTask:
            updateTasks((prevTasks) => [...prevTasks, task]);
            break;
        case DoomPluginEvent.startTask:
            updateTasks((prevTasks) => prevTasks.map((t: ITask) => {
                if (t.id === id && !t.worklog.find((w) => !w.finished)) {
                    t.worklog.push({started: (new Date()).getTime(), finished: null});
                }
                return t;
            }));
            break;
        case DoomPluginEvent.updateTask:
            updateTasks((storeTasks) => storeTasks.map((t) => t.id === task.id ? task : t));
            break;
        case DoomPluginEvent.resetTasks:
            updateTasks(() => tasks);
            break;
        case DoomPluginEvent.finishTask:
            updateTasks((storeTasks) => storeTasks.map((t: ITask) => {
                if (t.id === id) {
                    const ongoing = t.worklog.find((w) => !w.finished);
                    if (ongoing) {
                        ongoing.finished = (new Date()).getTime();
                    }
                    t.complete = (new Date()).getTime();
                }
                return t;
            }));
            break;
        case DoomPluginEvent.discardTask:
            updateTasks((storeTasks) => storeTasks.map((t: ITask) => {
                if (t.id === id) {
                    const ongoing = t.worklog.find((w) => !w.finished);
                    if (ongoing) {
                        ongoing.finished = (new Date()).getTime();
                    }
                    t.discarded = true;
                    t.complete = (new Date()).getTime();
                }
                return t;
            }));
            break;
        case DoomPluginEvent.reopenTask:
            updateTasks((storeTasks) => storeTasks.map((t: ITask) => {
                if (t.id === id) {
                    t.discarded = false;
                    t.complete = null;
                }
                return t;
            }));
            break;
        case DoomPluginEvent.pauseTask:
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
        case DoomPluginEvent.deleteTask:
            updateTasks((storeTasks) => storeTasks.filter((t) => t.id !== id));
            break;
        case DoomPluginEvent.archiveTask:
            updateTasks((storeTasks) => {
                const archT = storeTasks.find((t) => t.id === id);
                putTaskIntoArchive(archT);
                return storeTasks.filter((t) => t.id !== id);
            });
            break;
        case DoomPluginEvent.unpackArchive:
            updateArchives((storeArchs) => storeArchs.filter((a) => {
                if (a.createdDay === id) {
                    updateTasks((storeTasks) => storeTasks.concat(a.tasks));
                    return false;
                }
                return true;
            }));
            break;
        case DoomPluginEvent.deleteArchive:
            updateArchives((storeArchs) => storeArchs.filter((a) => a.createdDay !== id));
            break;
        case DoomPluginEvent.showForm:
            postActiveTabs(DoomPluginEvent.showForm, msg);
            break;
        case DoomPluginEvent.refresh:
            getConfig().then(sendResponse);
            return true;
    }
    sendResponse(true);
    return true;
};

chrome.runtime.onInstalled.addListener((inst) => {
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
    chrome.tabs.onUpdated.addListener(() => {
        broadcastConfig();
    });
    chrome.runtime.onMessage.addListener(dispatchMessage);
    broadcastConfig();
});
