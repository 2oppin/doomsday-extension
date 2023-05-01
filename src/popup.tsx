import * as React from "react";
import {ReactNode} from "react";
import * as ReactDOM from "react-dom";

import {DoomPluginEvent, PONG} from "@app/common/chromeEvents";
import {Face} from "@app/components/face/Face";
import {IConfig, IConfigOptions} from "@app/globals";
import {FaceMood, faceMoodOnTasks, Task} from "@app/models/task";
import {Dispatcher} from "@app/services/dispatcher";

import "./popup.css";
import { PersonalStats } from "@app/components/personal-stats/PersonalStats";

interface IPopupStatus {
    ready: boolean;
    contentReady: boolean;
    mood: FaceMood;
    tasks: Task[];
    options: Partial<IConfigOptions>;
}

class Popup extends React.Component<{}, IPopupStatus> {
    constructor(params: any) {
        super(params);
        this.state = {
            tasks: [],
            options: {showFace: false},
            mood: FaceMood.OK,
            ready: false,
            contentReady: false,
        };
    }

    public componentDidMount(): void {
        this.getConfig();
        this.ensureContentScript();
    }

    public render() {
        const {ready, contentReady, tasks, mood} = this.state;
        if (!ready) return this.renderReload();
        return (
            <div className="dd-popup">
                <Face {...{mood}} />
                <div className={"stats"}>{this.taskStats(tasks)}</div>
                {!contentReady && this.renderContentNotReady()}
                {this.renderActions()}
            </div>
        );
    }

    private renderReload(): ReactNode {
        return (<div className="waiting-pan">
            <p>Seems like you out of sync with the extension storage.<br/>Click the button below to retry.</p>
            <button onClick={() => this.getConfig()}>Sync/Retry</button>
        </div>);
    }

    private renderContentNotReady(): ReactNode {
        return (<div className="waiting-pan">
            <p>This page was opened prior to extension installation.<br/> Full functionality will be available after
                page refresh.</p>
        </div>);
    }

    private renderActions() {
        const {options, contentReady} = this.state;
        const showFace = (options && options.showFace) || false;
        return (<>
            {contentReady && (<>
            <PersonalStats
              i={60} e={20} p={90}
              onClick={() => this.showPersonalForm()}
            />
            
              <button
                onClick={() => this.showTasksForm()}
              >
                Show Tasks
              </button>
            </>)}
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
            {contentReady && (
                <div>
                    <button className={"secondary"} onClick={() => this.resetTutorial()}>{`\ud83d\udcd6`} Reset
                        Tutorial
                    </button>
                </div>
            )}
        </>);
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

    private onConfigUpdate(partConfig: Partial<IConfig> = {}): Promise<any> {
        return new Promise<any>((r) =>
            this.setState((prev) => {
                const tasks = partConfig.tasks ? partConfig.tasks.map((t) => new Task(t)) : prev.tasks;
                return {
                    ...prev,
                    ...partConfig,
                    tasks,
                    mood: faceMoodOnTasks(tasks),
                    ready: true,
                };
            }, () => r(true)),
        );
    }

    private ensureContentScript() {
        Dispatcher.activeTabCall(DoomPluginEvent.ping, {}, (res: string) => {
            this.setState({contentReady: res === PONG});
        });
    }

    private showTasksForm() {
        Dispatcher.activeTabCall(DoomPluginEvent.showForm, {name: "TasksList"});
    }

    private showPersonalForm() {
      Dispatcher.activeTabCall(DoomPluginEvent.showPersonalForm, {name: "PersonalForm"});
    }

    private getConfig() {
        Dispatcher.call(DoomPluginEvent.refresh, {}, (conf: IConfig) => this.onConfigUpdate(conf));
    }

    private resetTutorial() {
        Dispatcher.call(DoomPluginEvent.setOptions, {readHelp: []});
    }

    private updateConfig() {
        const {showFace} = this.state.options;
        Dispatcher.call(DoomPluginEvent.setOptions, {showFace});
    }
}

const wrapper = document.getElementById("app");
if (wrapper) ReactDOM.render(<Popup/>, wrapper);
