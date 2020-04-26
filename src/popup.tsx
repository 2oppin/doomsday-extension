import {DoomPluginEvent, postActiveTabs} from "@app/common/chromeEvents";

import {IConfig} from "@app/globals";
import {Dispatcher} from "@app/services/dispatcher";
import * as React from "react";
import * as ReactDOM from "react-dom";
import {Face} from "./app/components/view/Face";
import "./popup.css";

interface IPopupStatus extends IConfig {
  ready: boolean;
}
class Popup extends React.Component<{}, IPopupStatus> {
  constructor(params: any) {
    super(params);
    this.state = {
      tasks: [],
      showFace: false,
      ready: false,
    };
  }

  public componentDidMount(): void {
    this.loadConfig()
        .then(() => this.setState({ready: true}));
  }

  public render() {
    const {showFace, tasks, ready} = this.state;

    if (!ready) return null;

    return (
        <div className="dd-popup">
          <div>
            <Face />
            <span>
              <label htmlFor="face-checker">Show face on all pages: </label>
              <input id="face-checker" type="checkbox"
                     checked={showFace}
                     onChange={(e) =>
                         this.setState({showFace: e.target.checked}, () => this.updateConfig())
                     }
              />
              <button
                  onClick={() =>
                      Dispatcher.call(DoomPluginEvent.showForm, {name: "TasksList", data: {tasks}})
                  }
              >
                Show Tasks
              </button>
              </span>
          </div>
        </div>
    );
  }

  private loadConfig(): Promise<any> {
    return new Promise((r) =>
      chrome.storage.sync.get(["tasks", "showFace"], ({tasks = [], showFace = false}) => {
        this.setState({tasks, showFace}, r);
      }),
    );
  }

  private updateConfig() {
    const {tasks, showFace} = this.state;
    Dispatcher.call(
        DoomPluginEvent.configUpdated,
        { tasks, showFace },
    );
  }
}

const wrapper = document.getElementById("app");
if (wrapper) ReactDOM.render(<Popup />, wrapper);
