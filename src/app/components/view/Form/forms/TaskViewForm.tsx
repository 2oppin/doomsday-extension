import {Worklog} from "@app/models/worklog";
import React, {Component} from "react";

import {DoomPluginEvent} from "@app/common/chromeEvents";

import {WorklogField} from "@app/components/view/Form/fields/WorklogField";
import {Form} from "@app/components/view/Form/Form";
import {Task} from "@app/models/task";
import {Dispatcher} from "@app/services/dispatcher";

import "./TaskEditForm.css";

interface ITaskViewProps {
    task: Task;
}

export class TaskViewForm extends Component<ITaskViewProps, {}> {

    public render() {
        const {task} = this.props;

        return (<Form caption={"View Task"}>
            <div className="dd-popup-form-task">
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
                    <p>{task.description.split(/\n/).map((sentence) => <>{sentence}<br/></>)}</p>
                </div>
                <div className="dd-form-buttonset">
                    <button onClick={this.backToList}>Cancel</button>
                </div>
            </div>
        </Form>);
    }

    private backToList() {
        Dispatcher.dispatch(DoomPluginEvent.showForm, {name: "TaskList"});
    }
}
