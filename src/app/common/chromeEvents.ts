import QueryInfo = chrome.tabs.QueryInfo;

export const PONG = "pong";

export enum DoomPluginEvent {
    refresh = "refresh",
    ping = "ping",

    configUpdated = "configUpdated",
    setOptions = "setOptions",
    taskActivation = "taskActivation",
    addTask = "addTask",
    updateTask = "updateTask",
    startTask = "startTask",
    finishTask = "finishTask",
    discardTask = "discardTask",
    pauseTask = "pauseTask",

    deleteTask = "deleteTask",
    reopenTask = "reopenTask",
    archiveTask = "archiveTask",
    unpackArchive = "unpackArchive",
    deleteArchive = "deleteArchive",

    showForm = "showForm",
    closeForm = "closeForm",
    resetTasks = "resetTasks",

    showPersonalForm = "showPersonalForm",
}

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
    return new Promise((r) =>
        chrome.tabs.sendMessage(tabId, {action: event, ...data}),
    );
};

export const postSingleRecipient = (recvId: string) => (event: DoomPluginEvent, data: any): void => {
    chrome.runtime.sendMessage(recvId, {action: event, ...data});
};
