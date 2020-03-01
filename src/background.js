"use strict";
import { DOOM_OWERFLOW_APP_ID } from './app/globals';

const setupPopups = (config, tabId) => chrome.tabs.executeScript(tabId, {
  code: `document.getElementById('${DOOM_OWERFLOW_APP_ID}').dispatchEvent(new CustomEvent('doom', {detail:{action: 'configUpdated', data: ${JSON.stringify(config)}}}));`
});
const updateTasks = (cb) => {
  console.log('UPDATE TASKS ');

  return (new Promise(r => chrome.storage.sync.get(['tasks'], ({tasks}) => r(tasks || []))))
    .then(tasks => {
      console.log('BG get:', tasks);
      return cb(tasks);
    })
    .then(tasks => {
      console.log('BG set', tasks);
      chrome.storage.sync.set(
      {tasks},
      () => chrome.tabs.query(
        {url: ["https://*/*", "http://*/*"]},
        (tabs) =>
          tabs.map(tab =>
            chrome.tabs.executeScript(
              tab.id,
              {code: `document.getElementById('${DOOM_OWERFLOW_APP_ID}').dispatchEvent(new CustomEvent('doom', {detail:{action: 'tasksUpdated', data: ${JSON.stringify(tasks)}}}));`}
            )
          )
      )
    )
  });
};

chrome.runtime.onInstalled.addListener(
  (inst) => {
    alert(JSON.stringify(inst));
    chrome.storage.sync.get(['tasks'], (storage) => {
      storage.tasks = (storage.tasks||[]).filter(t => !!t && !!t.id) || [];

      chrome.declarativeContent.onPageChanged.removeRules(undefined, () => {
        chrome.declarativeContent.onPageChanged.addRules([{
          conditions: [new chrome.declarativeContent.PageStateMatcher({
              pageUrl: {schemes: [ 'http', 'https']/*, hostEquals: 'developer.chrome.com'*/},
            })
          ],
          actions: [new chrome.declarativeContent.ShowPageAction()]
        }]);
      });
      updateTasks(() => storage.tasks);
    });
    chrome.runtime.onMessage.addListener((msg, sender, resp) => {
      const {task, tasks, action, tabId, id, started, finished, done} = msg;
console.log('Act IO', msg);
      switch(action) {
      	case 'addTask':
          updateTasks((tasks) => tasks.push(task) && tasks);
          break;
        case 'startTask':
          updateTasks((tasks) => tasks.map(t => {
            if (t.id === id) t.started = started;
            console.log('STARTING:', t);
            return t;
          }));
          break;
        case 'updateTask':
          updateTasks((storeTasks) => storeTasks.map(t => t.id === task.id ? task : t));
          break;
        case 'resetTasks':
          console.log('READY TO RESET !!! ~ ', tasks);
          updateTasks(() => tasks);
          break;
        case 'finishTask':
          updateTasks((storeTasks) => storeTasks.map(t => {
            if (t.id === id) t.finished = finished;
            return t;
          }));
          break;
        case 'pauseTask':
          updateTasks((storeTasks) => storeTasks.map(t => {
            if (t.id === id) {
              t.done = done;
              t.started = null;
            }
            return t;
          }));
          break;
        case 'deleteTask':
          updateTasks((storeTasks) => storeTasks.filter(t => t.id !== id));
          break;
        case 'refresh':
          updateTasks(storeTasks => storeTasks);
          break
      }
    });
});
