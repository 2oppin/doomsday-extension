import Task from "@app/models/task";
import React, {ChangeEvent, Component, SyntheticEvent} from "react";

import {UUID} from "@app/common/routines";
import {Dispatcher} from "@app/services/dispatcher";

import {Form} from "@app/components/view/Form/Form";

import "./TaskEditForm.css";

const DEFAULT_TASK = {
    name: "New Mission",
    estimate: 2 * 3600 * 1000,
    done:  0,
    deadline: new Date(new Date().getTime() + 24 * 3600 * 1000),
    description: "Go down through the hell and back alive!",
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
        const {task} = props;
        this.state = {
            ...this.props,
            task: {...DEFAULT_TASK, ...task},
            caption: (task.id ? "Revise" : "New") + " Mission:",
        };
    }

    public render() {
        const {task, caption} = this.state;

        return (<Form caption={caption}>
            <div className="dd-popup-form-task">
                <div className="dd-popup-form-inputfield">
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
                    <h5>Deadline</h5>
                    <div className="dd-popup-form-row">
                        <div className="dd-popup-form-inputfield dd-popup-form-column">
                            <label>Date</label>
                            <input
                                type="date"
                                value={date(new Date(task.deadline))}
                                onChange={(e: SyntheticEvent) => this.updateTaskProp(e, "deadline", (v: any) => dateTime(new Date(v))(new Date(task.deadline)))}
                            />
                        </div>
                        <div className="dd-popup-form-inputfield dd-popup-form-column">
                            <label>Time</label>
                            <input
                                type="time"
                                value={time(task.deadline)}
                                onChange={(e: SyntheticEvent) => this.updateTaskProp(e, "deadline", (v: any) => {
                                    const timeValue = new Date();
                                    // @ts-ignore
                                    timeValue.setHours(...v.split(":"));
                                    return dateTime(task.deadline)(timeValue);
                                })}
                            />
                        </div>
                    </div>
                </div>
                <div className="dd-popup-form-inputfield">
                    <label>Worklog</label>
                    <input type="number" value={(task.done / 3600000)}
                           onChange={(e: SyntheticEvent) => this.updateTaskProp(e, "done", (v: any) => "" + v * 3600000)}
                    />
                </div>
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

    private updateTaskProp(e: SyntheticEvent, key: string, cast: (val: any) => Date|string = (v: any) => "" + v) {
        const event: any = e.nativeEvent;
        if (!event.target) return;
        this.setState((prevState: ITaskEditState) => {
            return {
                task: new Task({
                    ...prevState.task,
                    [key]: cast(event.target.tag === "textarea" ? event.target.text : event.target.value),
                }),
            };
        });
    }

    private saveTask() {
        const {task} = this.state;
        if (!task.id)
            Dispatcher.call("addTask", {task: {...task, id: UUID()}});
        else {
            Dispatcher.call("updateTask", {task});
        }

        this.backToList();
    }

    private backToList() {
        Dispatcher.dispatch("showForm", {name: "TaskList"});
    }
}