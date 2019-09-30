"use strict";
import { DOOM_OWERFLOW_APP_ID } from './app/globals';

const setupPopups = (config, tabId) => chrome.tabs.executeScript(tabId, {
  code: `document.getElementById('${DOOM_OWERFLOW_APP_ID}').dispatchEvent(new CustomEvent('doom', {detail:{action: 'configUpdated', data: ${JSON.stringify(config)}}}));`
});
const udpateTasks = (cb) => {
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
      udpateTasks(() => storage.tasks);
    });
    chrome.runtime.onMessage.addListener((msg, sender, resp) => {
      const {task, action, tabId, guid, started, finished, done} = msg;
console.log('Act', msg);
      switch(action) {
      	case 'addTask':
          udpateTasks((tasks) => tasks.push(task) && tasks);
          break;
        case 'startTask':
          udpateTasks((tasks) => tasks.map(t => {
            if (t.guid == guid) t.started = started;
            return t;
          }));
          break;
        case 'updateTask':
          udpateTasks((tasks) => tasks.map(t => t.guid == task.guid ? task : t));
          break;          
        case 'finishTask':
          udpateTasks((tasks) => tasks.map(t => {
            if (t.guid == guid) t.finished = finished;
            return t;
          }));
          break;
        case 'pauseTask':
          udpateTasks((tasks) => tasks.map(t => {
            if (t.guid == guid) {
              t.done = done;
              t.started = null;
            }
            return t;
          }));
          break;
        case 'deleteTask':
          udpateTasks((tasks) => tasks.filter(t => t.guid != guid));
          break;
      } 
    });
});
