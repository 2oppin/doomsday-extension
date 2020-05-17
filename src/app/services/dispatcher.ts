import {DoomPluginEvent} from "@app/common/chromeEvents";
import {IDDMessage} from "@app/globals";

class DispatcherSvc {
  private onceListeners: {[event: string]: Array<(args: any) => Promise<any>>} = {};
  private listeners: {[event: string]: Array<(args: any) => Promise<any>>} = {};

  constructor() {
    this.onceListeners = {};
    chrome.runtime.onMessage.addListener((data: IDDMessage = {} as IDDMessage, sender, sendResponse) => {
      if (!data) return;
      const {action} = data;
      if (this.listeners[action]) {
        delete data.action;
        this.listeners[action].forEach((cb) => {
          const res = cb(data);
          return res.then(sendResponse);
        });
      }
      return true;
    });
  }

  public dispatch(event: DoomPluginEvent, data?: any) {
    if (this.listeners[event]) {
      this.listeners[event].forEach((cb) => cb(data));
    }
  }

  public subscribe(event: DoomPluginEvent, cb: (args: any) => Promise<any>) {
    this.listeners[event] = [
        ...(this.listeners[event] || []),
        cb,
    ];
  }

  public unsubscribe(event: DoomPluginEvent, cbToRemove: (args: any) => Promise<any>) {
    this.listeners[event] = (this.listeners[event] || []).filter((cb) => cbToRemove !== cb);
    this.onceListeners[event] = (this.onceListeners[event] || []).filter((cb) => cbToRemove !== cb);
  }

  public once(action: DoomPluginEvent, cb: (args: any) => any) {

    this.onceListeners[action] = this.onceListeners[action] || [];
    this.onceListeners[action].push(cb);
  }

  public activeTabCall(action: DoomPluginEvent, data = {}, cb: (res: any) => any = () => null) {
    chrome.tabs.query({active: true}, ([tab]) =>
        chrome.tabs.sendMessage(tab.id, {
        action,
        ...data,
      }, (res) => cb(res)),
    );
  }

  public call(action: DoomPluginEvent, data = {}, cb: (res: any) => any = () => null) {
      chrome.runtime.sendMessage({
        action,
        ...data,
      }, (res) => cb(res));
  }
}

export const Dispatcher = new DispatcherSvc();
