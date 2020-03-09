import * as taskActions from "./task.actions";
import * as ui from "./ui.actions";

class DispatcherSvc {
  private actions: {[key: string]: any};
  private onceListeners: {[action: string]: Array<(args: any) => any>};
  constructor() {
    this.actions = {
      ...ui,
      ...taskActions,
    };
    this.onceListeners = {};
  }

  public dispatch(action: string, data?: any) {
    if (this.actions[action])
      this.actions[action](data);
    if (this.onceListeners[action]) {
      const cbs = this.onceListeners[action].slice();
      this.onceListeners[action] = [];
      for (const cb of cbs)
        cb(data);
    }
  }

  public once(action: string, cb: (args: any) => any) {
    this.onceListeners[action] = this.onceListeners[action] || [];
    this.onceListeners[action].push(cb);
  }
  public call(action: string, data = {}) {
      chrome.runtime.sendMessage({
        action,
        ...data,
      });
  }
}

export const Dispatcher = new DispatcherSvc();
