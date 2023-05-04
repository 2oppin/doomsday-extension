import {JIRA} from "@app/common/images";
import React, {Component} from "react";

import {DoomPluginEvent} from "@app/common/chromeEvents";

import {Help, HelpInfo} from "@app/components/help/Help";

import {Task} from "@app/models/task";
import {Dispatcher} from "@app/services/dispatcher";

import {Form} from "./Form";
import {TaskItem} from "./parts/TaskItem";



interface ITaskListProps {
    tasks: Task[];
    active?: string;
    hasArchive?: boolean;
    readonly?: boolean;
    previousForm?: string;
    jira?: boolean;
}

interface ITaskListSate {
    tasks: Task[];
    caption: string;
    active: string;
}

export class TaskListForm extends Component<ITaskListProps, ITaskListSate> {
    public static getDerivedStateFromProps(props: ITaskListProps) {
        return {
            tasks: (props.tasks || []).sort(Task.sort),
            active: props.active,
        };
    }

    constructor(props: ITaskListProps) {
        super(props);
        this.state = {
            ...this.state,
            caption: "List of Missions:",
            ...TaskListForm.getDerivedStateFromProps(props),
        };
    }

    public render() {
        const {readonly, previousForm, jira, hasArchive} = this.props;
        const {tasks, active} = this.state;

        return (
            <Form caption="List of Tasks:">
                <div>
                    <div className="dd-popup-form-list" data-help={HelpInfo.TaskList}>
                        <div className="list">
                            {tasks.map((t) => <TaskItem {...{readonly, previousForm}} key={t.id}
                                                        active={t.id === active} task={t}/>)}
                        </div>
                    </div>
                    {!readonly && (
                        <span
                            className="dd-popup-form-task-btn dd-brd dd-big-btn"
                            onClick={() => this.addTask()}
                        >&#10133; <b>New Task</b></span>
                    )}
                    {hasArchive && (
                        <span
                            className="dd-popup-form-task-btn dd-brd dd-big-btn yellow-btn"
                            onClick={() => this.showArchives()}
                        >&#x1F381; <b>Show Archives</b></span>
                    )}
                    {!readonly && <>
                        {jira && (
                            <span
                                className="dd-popup-form-task-btn dd-brd r-btn jira-btn"
                                onClick={() => this.showJiraTasks()}
                                data-help={HelpInfo.JiraBtn}
                              ><img alt="import-from-jira" title={"Import tasks from JIRA"} src={JIRA}/></span>
                        )}
                        <span
                            className="dd-popup-form-task-btn dd-brd r-btn"
                            onClick={() => this.exportConfig()}
                            style={{transform: `rotate(180deg)`, border: "inset"}}
                            data-help={HelpInfo.ExportBtn}
                        >&#8687;</span>
                        <span
                            className="dd-popup-form-task-btn dd-brd r-btn"
                            onClick={() => this.importConfig()}
                            data-help={HelpInfo.ImportBtn}
                        >&#8687;</span>
                    </>}
                </div>
                <Help />
            </Form>
        );
    }

    private showArchives() {
        Dispatcher.dispatch(DoomPluginEvent.showForm, {name: "ArchiveList"});
    }

    private showJiraTasks() {
        Dispatcher.dispatch(DoomPluginEvent.showForm, {name: "JiraTasks"});
    }

    private addTask() {
        Dispatcher.dispatch(DoomPluginEvent.showForm, {name: "TaskEdit"});
    }

    private importConfig() {
        Dispatcher.dispatch(DoomPluginEvent.showForm, {name: "ImportForm"});
    }

    private exportConfig() {
        const {tasks} = this.state;
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(tasks.map((t) => t.toObject())));
        const aEl = document.createElement("a");
        aEl.setAttribute("href", dataStr);
        aEl.setAttribute("download", "DOOMed-Tasks.json");
        aEl.click();
    }
}
