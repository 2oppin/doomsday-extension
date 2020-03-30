import {DoomPluginEvent, postAllTabs, postSingleTab} from "@app/common/chromeEvents";
import {IConfig, IDDMessage} from "@app/globals";
import {ITask} from "@app/models/task";

const setupPopups = (config: IConfig, tabId: number) => postSingleTab(tabId)(DoomPluginEvent.configUpdated, config);

const getCurrentTasks = (): Promise<ITask[]> => (new Promise((r) =>
        chrome.storage.sync.get(["tasks"], ({tasks = []}: any) => r(tasks)))
);
const updateTasks = async (cb: (tasks: any[]) => any = (t) => t): Promise<any> => {
    let storedTasks: any[] = await getCurrentTasks();
    storedTasks = cb(storedTasks);
    chrome.storage.sync.set(
        {tasks: storedTasks},
        () => postAllTabs(DoomPluginEvent.tasksUpdated, storedTasks),
    );
    return storedTasks;
};

const updateConfig = async ({showFace}: any): Promise<any> => {
    const tasks: any[] = await getCurrentTasks();
    chrome.storage.sync.set(
        {tasks, showFace},
        () => postAllTabs(DoomPluginEvent.configUpdated, {tasks, showFace}),
    );
};

const dispatchMessage = (msg: IDDMessage, sender: any, resp: any) => {
    const {task, tasks, showFace, action, id, started, finished, done} = msg;
    switch (action) {
        case "configUpdated":
            updateConfig({showFace});
            break;
        case "addTask":
            updateTasks((prevTasks) => [...prevTasks, task]);
            break;
        case "startTask":
            updateTasks((prevTasks) => prevTasks.map((t) => {
                if (t.id === id) t.started = started;
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
            updateTasks((storeTasks) => storeTasks.map((t) => {
                if (t.id === id) t.finished = finished;
                return t;
            }));
            break;
        case "pauseTask":
            updateTasks((storeTasks) => storeTasks.map((t) => {
                if (t.id === id) {
                    t.done = done;
                    t.started = null;
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
    chrome.storage.sync.get(["tasks"], ({tasks = []}) => {
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
    chrome.runtime.onMessage.addListener(dispatchMessage);
});
