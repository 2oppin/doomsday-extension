import {DoomPluginEvent, postAllTabs, postSingleTab} from "@app/common/chromeEvents";
import {IConfig, IDDMessage} from "@app/globals";
import {ITask} from "@app/models/task";
import {DoomStorage} from "@app/services/storage";

const setupPopups = (config: IConfig, tabId: number) => postSingleTab(tabId)(DoomPluginEvent.configUpdated, config);

const getCurrentTasks = (): Promise<ITask[]> => DoomStorage.get("tasks");

const updateTasks = async (cb: (tasks: any[]) => any = (t) => t): Promise<any> => {
    let storedTasks: any[] = await getCurrentTasks() || [];
    storedTasks = cb(storedTasks);
    DoomStorage.set("tasks", storedTasks)
        .then(() => postAllTabs(DoomPluginEvent.tasksUpdated, storedTasks));
    return storedTasks;
};

const updateConfig = async ({showFace}: any): Promise<any> => {
    const tasks: any[] = await getCurrentTasks();
    DoomStorage.set("showFace", showFace)
        .then(() => postAllTabs(DoomPluginEvent.configUpdated, {tasks, showFace}));
};

const dispatchMessage = (msg: IDDMessage, sender: any, resp: any) => {
    const {task, tasks, showFace, action, id, done} = msg;
    switch (action) {
        case "configUpdated":
            updateConfig({showFace});
            break;
        case "addTask":
            updateTasks((prevTasks) => [...prevTasks, task]);
            break;
        case "startTask":
            updateTasks((prevTasks) => prevTasks.map((t: ITask) => {
                if (t.id === id && !t.worklog.find((w) => w.finished === null)) {
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
        case "refresh":
            updateTasks((storeTasks) => storeTasks);
            break;
    }
};

chrome.runtime.onInstalled.addListener((inst) => {
    alert("DOOM - " + JSON.stringify(inst));

    chrome.tabs.onUpdated.addListener(() => {
        updateTasks((tasks) => tasks);
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
            updateTasks(() => tasks);
        });
});
