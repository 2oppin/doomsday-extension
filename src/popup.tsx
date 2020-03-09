import * as React from "react";
import * as ReactDOM from "react-dom";
import {Face} from "./app/components/view/Face";
import {DOOM_OWERFLOW_APP_ID, IConfig} from "./app/globals";
import "./popup.css";

const defaultConfig: IConfig = {
  tasks: [],
  showFace: false,
};

interface IPopupStatus {
  config: IConfig;
}
class Popup extends React.Component<{}, IPopupStatus> {
  constructor(params: any) {
    super(params);
    this.state = { config: defaultConfig };
    this.loadTasks();
  }

  public render() {
    const {config} = this.state;

    return (
        <div className="dd-popup">
          <div onClick={() => this.runDoomCmd("showForm", {name: "TasksList", data: {tasks: config.tasks}})}>
            <Face />
            <span>
            <label htmlFor="face-checker">Show face on all pages: </label>
            <input id="face-checker" type="checkbox"
                   value={config.showFace ? "checked" : ""}
                   onChange={(e) => this.setFaceVisibility(e.target.checked)}
            />
          </span>
          </div>
        </div>
    );
  }

  private loadTasks() {
    chrome.storage.sync.get(["tasks"], ({tasks}) => {
      this.setState((prev) => ({
        config: {
          ...prev.config,
          tasks,
        }}), () => this.runDoomCmd(
            "configUpdated",
          { tasks, showFace: this.state.config.showFace },
        ));
    });
  }

  private setFaceVisibility(val: boolean) {
    this.setState((prev) => ({
      config: {
        ...prev.config,
        showFace: val,
      }}), () => this.runDoomCmd("configUpdated", this.state.config));
  }

  private runDoomCmd(cmd: string, data: any) {
    chrome.tabs.query(
      {
        active: true,
        lastFocusedWindow: true,
      },
      (tabs) =>
        tabs.map((tab) =>
          chrome.tabs.executeScript(
            tab.id,
            {code: `document.getElementById('${DOOM_OWERFLOW_APP_ID}').dispatchEvent(new CustomEvent('doom', {detail:{action: '${cmd}', data: ${JSON.stringify(data)}}}));`},
          ),
        ),
    );
  }
}

const wrapper = document.getElementById("app");
if (wrapper) ReactDOM.render(<Popup />, wrapper);
