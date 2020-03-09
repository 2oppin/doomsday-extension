import Task from "@app/models/task";
import {DOOM_OWERFLOW_APP_ID, IConfig, IDDMessage} from "./app/globals";

const setupPopups = (config: IConfig, tabId: number) => chrome.tabs.executeScript(tabId, {
    code: `document.getElementById('${DOOM_OWERFLOW_APP_ID}').dispatchEvent(new CustomEvent('doom', {detail:{action: 'configUpdated', data: ${JSON.stringify(config)}}}));`,
});
const updateTasks = (cb: (tasks: any[]) => any) => {
    return (new Promise((r) => chrome.storage.sync.get(["tasks"], ({tasks}) => r(tasks || []))))
        .then((tasks: any[]) => cb(tasks))
        .then((tasks) => {
            chrome.storage.sync.set(
                {tasks},
                () => chrome.tabs.query(
                    {url: ["https://*/*", "http://*/*"]},
                    (tabs) =>
                        tabs.map((tab) =>
                            chrome.tabs.executeScript(
                                tab.id,
                                {code: `document.getElementById('${DOOM_OWERFLOW_APP_ID}').dispatchEvent(new CustomEvent('doom', {detail:{action: 'tasksUpdated', data: ${JSON.stringify(tasks)}}}));`},
                            ),
                        ),
                ),
            );
        });
};

chrome.runtime.onInstalled.addListener(
    (inst) => {
        alert(JSON.stringify(inst));
        chrome.storage.sync.get(["tasks"], (storage) => {
            storage.tasks = (storage.tasks || []).filter((t: Task) => !!t && !!t.id) || [];

            chrome.declarativeContent.onPageChanged.removeRules(undefined, () => {
                chrome.declarativeContent.onPageChanged.addRules([{
                    conditions: [new chrome.declarativeContent.PageStateMatcher({
                        pageUrl: {schemes: ["http", "https"]/*, hostEquals: 'developer.chrome.com'*/},
                    }),
                    ],
                    actions: [new chrome.declarativeContent.ShowPageAction()],
                }]);
            });
            updateTasks(() => storage.tasks);
        });
        chrome.runtime.onMessage.addListener((msg: IDDMessage, sender, resp) => {
            const {task, tasks, action, tabId, id, started, finished, done} = msg;
            switch (action) {
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
        });
    });
