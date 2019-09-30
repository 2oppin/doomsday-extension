import * as ui from './ui.actions.js';
import * as taskActions from './task.actions.js';

class DispatcherSvc {
  constructor() {
    this.actions = {
      ...ui,
      ...taskActions
    };
    this.onceListeners = {};
  }

  dispatch(action, data) {
    console.log('Dispatch...', action, data);

    if (this.actions[action])
      this.actions[action](data);
    if (this.onceListeners[action]) {
      let cbs = this.onceListeners[action].slice();
      this.onceListeners[action] = [];
      for (const cb of cbs) 
        cb(data);
    }
  }

  once(action, cb) {
    this.onceListeners[action] = this.onceListeners[action] || [];
    this.onceListeners[action].push(cb);
  }
  call(action, data = {}) {
      // if (!this.tabId) throw new Error('Dispatcher not registered; unknown TabId')
      console.log("Dispatcher call:", action, data);
      chrome.runtime.sendMessage({
        action,
        ...data
      });
  }
}

export const Dispatcher = new DispatcherSvc();