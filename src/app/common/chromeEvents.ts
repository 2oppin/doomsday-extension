import {DOOM_OWERFLOW_APP_ID} from "@app/globals";
import QueryInfo = chrome.tabs.QueryInfo;

export enum DoomPluginEvent {
    refresh = "refresh",

    requestConfig = "requestConfig",
    configUpdated = "configUpdated",
    taskActivation = "taskActivation",
    addTask = "addTask",
    updateTask = "updateTask",
    startTask = "startTask",
    finishTask = "finishTask",
    pauseTask = "pauseTask",

    deleteTask = "deleteTask",
    archiveTask = "archiveTask",
    unpackArchive = "unpackArchive",
    deleteArchive = "deleteArchive",

    showForm = "showForm",
    closeForm = "closeForm",
    resetTasks = "resetTasks",
}

export const dispatchEventTextCmd = (eventType: DoomPluginEvent, data: any): string => {
    return `document.getElementById('${DOOM_OWERFLOW_APP_ID}')`
        + `.dispatchEvent(new CustomEvent('doom', {detail:{action: '${eventType}', data: ${JSON.stringify(data)}}}));`;
};

const withTabs = (query: QueryInfo) => (cb: (tabs: chrome.tabs.Tab[]) => Promise<any>) =>
    new Promise((r) => chrome.tabs.query(query, (tabs) => cb(tabs).then(r)));

export const postAllTabs = (event: DoomPluginEvent, data: any): Promise<any> =>
    withTabs({url: ["https://*/*", "http://*/*"]})(
        (tabs) =>
            Promise.all(tabs.map(({id}) => postSingleTab(id)(event, data))),
    );

export const postActiveTabs = (event: DoomPluginEvent, data: any): Promise<any> =>
    withTabs({
        active: true,
        lastFocusedWindow: true,
    })(
    (tabs) => Promise.all(tabs.map(({id}) => postSingleTab(id)(event, data))),
    );

export const postSingleTab = (tabId: number) => (event: DoomPluginEvent, data: any): Promise<any> => {
    return new Promise((r) => chrome.tabs.executeScript(
        tabId,
        {code: dispatchEventTextCmd(event, data)},
        r,
    ));
};
