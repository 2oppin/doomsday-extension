import {DoomPluginEvent} from "@app/common/chromeEvents";
import {FaceMood} from "@app/components/view/Face/Face";

import {IConfig} from "@app/globals";
import {faceMoodOnTasks, Task} from "@app/models/task";
import {Dispatcher} from "@app/services/dispatcher";
import {ReactNode} from "react";
import * as React from "react";
import * as ReactDOM from "react-dom";
import {Face} from "./app/components/view/Face";
import "./popup.css";

interface IPopupStatus extends IConfig {
    ready: boolean;
    mood: FaceMood;
}

class Popup extends React.Component<{}, IPopupStatus> {
    constructor(params: any) {
        super(params);
        this.state = {
            archives: [],
            tasks: [],
            options: {showFace: false},
            mood: FaceMood.OK,
            ready: false,
        };
    }

    public componentDidMount(): void {
        Dispatcher.subscribe(DoomPluginEvent.configUpdated, (data) => this.onConfigUpdate(data));
        Dispatcher.call(DoomPluginEvent.refresh);
    }

    public render() {
        const {options, ready, tasks, mood} = this.state;
        const showFace = (options && options.showFace) || false;
        if (!ready) return null;
        return (
            <div className="dd-popup">
                <Face {...{mood}} />
              <div>{this.taskStats(tasks)}</div>
              <button
                  onClick={() => Dispatcher.call(DoomPluginEvent.showForm, {name: "TasksList"})}
              >
                Show Tasks
              </button>
              <div className={"control"}>
                <label htmlFor="face-checker">Show face on all pages: </label>
                <input id="face-checker" type="checkbox"
                       checked={showFace}
                       onChange={(e: React.SyntheticEvent<HTMLInputElement>) => {
                           const checked = (e.nativeEvent.target as HTMLInputElement).checked;
                           this.setState(
                               (prev) => ({options: {...prev.options, showFace: checked}}),
                               () => this.updateConfig(),
                           );
                       }}
                />
              </div>
            </div>
        );
    }

    private taskStats(tasks: Task[]): ReactNode {
      const counters = tasks.reduce((a, t) => ({
        active: a.active + (t.active ? 1 : 0),
        nonComplete: a.nonComplete + (t.complete ? 0 : 1),
        hours: a.hours + (t.complete ? 0 : t.estimate / 3600000.0),
      }), {active: 0, nonComplete: 0, hours: 0});
      return (
          <span>
            {counters.nonComplete}(<b>{counters.active}</b> active) tasks ~ {counters.hours.toFixed(2)}h
          </span>);
    }

    private onConfigUpdate(partConfig: Partial<IConfig>) {
        this.setState((prev) => {
          const tasks = partConfig.tasks ? partConfig.tasks.map((t) => new Task(t)) : prev.tasks;
          return {
            ...prev,
            ...partConfig,
            tasks,
            mood: faceMoodOnTasks(tasks),
            ready: true,
          };
        });
    }

    private updateConfig() {
        const {options} = this.state;
        Dispatcher.call(DoomPluginEvent.configUpdated, {options});
    }
}

const wrapper = document.getElementById("app");
if (wrapper) ReactDOM.render(<Popup/>, wrapper);
