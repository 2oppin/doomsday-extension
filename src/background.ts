import {
    DoomPluginEvent,
    postActiveTabs,
    postAllTabs,
    postSingleRecipient,
    postSingleTab,
} from "@app/common/chromeEvents";
import {formatDate} from "@app/common/routines";
import {IConfigOptions, IDDMessage} from "@app/globals";
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

const broadcastConfig = (recvId?: string, tabId: number = null) => {
    return Promise.all([
        DoomStorage.get("tasks"),
        DoomStorage.get("archives"),
        DoomStorage.get("options"),
    ])
        .then(([tasks = [], archives = [], options = {showFace: false}]) => {
            if (tabId) {
                postSingleTab(tabId)(DoomPluginEvent.configUpdated, {tasks, archives, options});
            } else if (recvId) {
                postSingleRecipient(recvId)(DoomPluginEvent.configUpdated, {tasks, archives, options});
            } else
                postAllTabs(DoomPluginEvent.configUpdated, {tasks, archives, options});
        });
};

const dispatchMessage = (msg: IDDMessage, sender: any, resp: any) => {
    const {task, tasks, options, action, id, done} = msg;
    switch (action) {
        case DoomPluginEvent.setOptions:
            updateOptions((prev) => ({...prev, ...msg}));
            break;
        case DoomPluginEvent.configUpdated:
            updateOptions((prev) => ({...prev, ...msg}));
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
            broadcastConfig(sender.id, sender.tab && sender.tab.id);
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
