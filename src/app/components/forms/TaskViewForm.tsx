import React, {Component} from "react";

import {DoomPluginEvent} from "@app/common/chromeEvents";
import {Task} from "@app/models/task";
import {Dispatcher} from "@app/services/dispatcher";

import {WorklogField} from "./fields/WorklogField";
import {Form} from "./Form";

import "./TaskEditForm.css";

interface ITaskViewProps {
    task: Task;
    previousForm?: string;
}

export class TaskViewForm extends Component<ITaskViewProps, {}> {

    public render() {
        const {task} = this.props;

        return (<Form caption={"View Task"}>
            <div className="dd-popup-form-task view">
                <div className="dd-popup-form-inputfield">
                    <label>Code name</label>
                    <h5>{task.name}</h5>
                </div>
                <div className="dd-popup-form-inputfield">
                    <label>Estimate (hours)</label>
                    <h5>{`${(task.estimate / 3600000) | 0} h`}</h5>
                </div>
                <div className="dd-popup-form-inputfield">
                    <label>Deadline</label>
                    <h5>{(new Date(task.deadline)).toDateString()}</h5>
                </div>
                <div className="dd-popup-form-inputfield">
                    <WorklogField worklog={task.worklog} readonly={true} />
                </div>
                <div className="dd-popup-form-inputfield">
                    <label>Brief</label>
                    <p>{task.description.split(/\n/).map((sentence, i) => <span key={i}>{sentence}<br/></span>)}</p>
                </div>
                <div className="dd-form-buttonset">
                    <span
                        className="dd-popup-form-task-btn dd-brd dd-add-task dd-big-btn r-bt"
                        onClick={() => this.backToList()}
                    >
                        Back
                    </span>
                </div>
            </div>
        </Form>);
    }

    private backToList() {
        Dispatcher.dispatch(DoomPluginEvent.showForm, {name: this.props.previousForm || "TaskList"});
    }
}
