import {DoomPluginEvent} from "@app/common/chromeEvents";

import {UUID} from "@app/common/routines";
import {Help} from "@app/components/help/Help";
import {DateTimeField} from "@app/components/view/Form/fields/DateTimeField";
import {WorklogField} from "@app/components/view/Form/fields/WorklogField";

import {Form} from "@app/components/view/Form/Form";
import _prrt from "@app/components/view/Form/forms/parts/priority";
import {ITask, Task} from "@app/models/task";
import {Worklog} from "@app/models/worklog";
import {Dispatcher} from "@app/services/dispatcher";
import React, {Component, SyntheticEvent} from "react";

import "./TaskEditForm.css";

const DEFAULT_TASK: ITask = {
    complete: null,
    created: null,
    id: null,
    name: "New Mission",
    estimate: 2 * 3600 * 1000,
    priority: 0,
    deadline: new Date(new Date().getTime() + 24 * 3600 * 1000),
    description: "Go down through the hell and back alive!",
    worklog: [],
};
const time = (d = new Date()) =>
    (d = new Date(d)) && `${d.getUTCHours() || "00"}:${d.getUTCMinutes() || "00"}:${d.getUTCSeconds() || "00"}`;
const date = (d = new Date()) =>
    `${d.getUTCFullYear()}-${`${d.getUTCMonth() + 1}`.padStart(2, "0")}-${`${d.getDate()}`.padStart(2, "0")}`;
const dateTime = (d: Date) => (t: Date): Date => {
  t = new Date(t);
  d = (new Date(d));
  d.setHours(t.getHours(), t.getMinutes(), t.getSeconds());
  return d;
};

interface ITaskEditProps {
    task: Task;
}

interface ITaskEditState {
    task: Task;
    caption: string;
}

export class TaskEditForm extends Component<ITaskEditProps, ITaskEditState> {
    constructor(props: any) {
        super(props);
        const {task = new Task(DEFAULT_TASK)} = props;
        this.state = {
            ...this.props,
            task,
            caption: (task.id ? "Update" : "Add") + " Mission:",
        };
    }

    public render() {
        const {task, caption} = this.state;

        return (<Form caption={caption}>
            <div className="dd-popup-form-task">
                <div className="dd-popup-form-inputfield" data-help={"task-name"}>
                    <label>Code Name</label>
                    <input type="text" value={task.name} onChange={(e: SyntheticEvent) => this.updateTaskProp(e, "name")} />
                </div>
                <div className="dd-popup-form-inputfield">
                    <label>Estimate (hours)</label>
                    <input
                        type="number"
                        value={(task.estimate / 3600000) | 0}
                        onChange={(e: SyntheticEvent) => this.updateTaskProp(e, "estimate", (v: any) => "" + ((v * 3600000) | 0))}
                    />
                </div>
                <div className="dd-popup-form-column">
                    <DateTimeField caption="Deadline" value={new Date(task.deadline)} onChange={(d) => {
                        this.updateTaskProp({nativeEvent: {target: {value: d}}} as any, "deadline", (v: any) => v);
                    }}/>
                </div>
                <div className="dd-popup-form-inputfield">
                    <label>Priority</label>
                    <div className="dd-popup-form-row">
                        <input
                            type="number" max={12} min={0}
                            title="Priority"
                            value={task.priority}
                            onChange={(e) => {
                                task.priority = parseInt((e.nativeEvent.target as HTMLInputElement).value, 10);
                                this.setState({});
                            }} />
                        <div className={"priority-container"}><_prrt lvl={task.priority} /></div>
                    </div>
                </div>
                {((task.worklog && task.worklog.length) || null) && (
                    <div className="dd-popup-form-inputfield">
                        <WorklogField worklog={task.worklog} onChange={(w) =>
                            this.updateTaskProp({nativeEvent: {target: {value: w}}} as any, "worklog", (v: any) => v)
                        } />
                    </div>
                )}
                <div className="dd-popup-form-inputfield">
                    <label>Brief</label>
                    <textarea value={task.description} onChange={(e: SyntheticEvent) => this.updateTaskProp(e, "description")} />
                </div>
                <div className="dd-form-buttonset">
                    <button onClick={this.backToList}>Cancel</button>
                    <button onClick={() => this.saveTask()}>{task.id ? "Update" : "Add"} Mission</button>
                </div>
            </div>
        </Form>);
    }

    private updateWorklogByStartDate(startDate: Date, newW: Partial<Worklog>): void {
        this.setState((prevState: ITaskEditState) => {
            return {
                task: new Task({
                    ...prevState.task,
                    priority: prevState.task.priority,
                    worklog: prevState.task.worklog.map((w) =>
                        w.started.getTime() === startDate.getTime()
                            ? {...w, ...newW}
                            : w,
                    ),
                }),
            };
        });
    }

    private updateTaskProp(e: SyntheticEvent, key: string, cast: (val: any) => Date|number|string|Worklog[] = (v: any) => "" + v) {
        const event: any = e.nativeEvent;
        if (!event.target) return;
        this.setState((prevState: ITaskEditState) => {
            return {
                task: new Task({
                    ...prevState.task,
                    priority: prevState.task.priority,
                    [key]: cast(event.target.tag === "textarea" ? event.target.text : event.target.value),
                }),
            };
        });
    }

    private saveTask() {
        const {task} = this.state;
        if (!task.id)
            Dispatcher.call(DoomPluginEvent.addTask, {task: {...task, id: UUID(), priority: task.priority}});
        else {
            Dispatcher.call(DoomPluginEvent.updateTask, {task: {...task, priority: task.priority}});
        }

        this.backToList();
    }

    private backToList() {
        Dispatcher.dispatch(DoomPluginEvent.showForm, {name: "TaskList"});
    }
}
