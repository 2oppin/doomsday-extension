import {DoomPluginEvent} from "@app/common/chromeEvents";

class DispatcherSvc {
  private onceListeners: {[event: string]: Array<(args: any) => any>} = {};
  private listeners: {[event: string]: Array<(args: any) => any>} = {};

  constructor() {
    this.onceListeners = {};
  }

  public dispatch(event: DoomPluginEvent, data?: any) {
    if (this.listeners[event]) {
      this.listeners[event].forEach((cb) => cb(data));
    }
  }

  public subscribe(event: DoomPluginEvent, cb: (args: any) => any) {
    this.listeners[event] = [
        ...(this.listeners[event] || []),
        cb,
    ];
  }

  public unsubscribe(event: DoomPluginEvent, cbToRemove: (args: any) => any) {
    const oldLn = this.listeners[event].length;
    this.listeners[event] = (this.onceListeners[event] || []).filter((cb) => cbToRemove !== cb);
  }

  public once(action: DoomPluginEvent, cb: (args: any) => any) {

    this.onceListeners[action] = this.onceListeners[action] || [];
    this.onceListeners[action].push(cb);
  }

  public call(action: DoomPluginEvent, data = {}) {
      chrome.runtime.sendMessage({
        action,
        ...data,
      });
  }
}

export const Dispatcher = new DispatcherSvc();
