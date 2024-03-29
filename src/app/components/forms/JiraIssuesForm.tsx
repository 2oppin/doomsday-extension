import React, {Component} from "react";

import {DoomPluginEvent} from "@app/common/chromeEvents";
import {siteBase, UUID} from "@app/common/routines";
import {Archive} from "@app/models/archive";
import {Task} from "@app/models/task";
import {Dispatcher} from "@app/services/dispatcher";
import {Jira} from "@app/services/jira";

import {Form} from "./Form";
import _bt from "./parts/button";

import "./archive-list.css";

interface IJiraIssue {
    key: string;
    fields: {
        summary: string;
        created: string;
        aggregatetimeoriginalestimate: number;
    };
}

interface IJiraIssuesProps {
    tasks: Task[];
}

interface IJiraIssuesSate {
    issues: IJiraIssue[];
    tasks: Task[];
    caption: string;
}

export class JiraIssuesForm extends Component<IJiraIssuesProps, IJiraIssuesSate> {
    constructor(props: IJiraIssuesProps) {
        super(props);
        const jiraBase = siteBase();
        this.state = {
            caption: "List of JIRA Issues:",
            issues: [],
            tasks: props.tasks.filter(({source}) => source && source.src === jiraBase),
        };
    }

    public componentDidMount() {
        const {tasks} = this.state;
        const jiraBase = siteBase();
        Jira.getActiveIssues()
            .then(({issues}: { issues: IJiraIssue[] }) => {
                this.setState({
                    issues: this.filterImportedIssues(issues),
                });
            });
    }

    public render() {
        const {issues, caption} = this.state;

        return (
            <Form caption={caption}>
                <div>
                    <div className="dd-popup-form-list">
                        <div className="list">
                            {issues.map((issue, i) => (
                                <div key={i} className={"task-item item archive-item"}>
                                    <span>{issue.key}: {issue.fields.summary}</span>
                                    <_bt u={`\uD83D\uDC7E`} cb={() => this.createTaskFromJira(issue)}/>
                                </div>
                            ))}
                        </div>
                    </div>
                    <span
                        className="dd-popup-form-task-btn dd-brd dd-add-task dd-big-btn r-bt"
                        onClick={() => this.showTaskList()}
                    >
                        Back
                    </span>
                </div>
            </Form>
        );
    }

    private filterImportedIssues(issues: IJiraIssue[]): IJiraIssue[] {
        const {tasks} = this.state;
        return issues.filter((iss) =>
            !tasks.find(({source}) => source.id === iss.key));
    }

    private showTaskList() {
        Dispatcher.dispatch(DoomPluginEvent.showForm, {name: "TaskList"});
    }

    private showArchive(arch: Archive) {
        Dispatcher.dispatch(DoomPluginEvent.showForm, {
            name: "TaskList",
            data: {tasks: arch.tasks, previousForm: "ArchiveList", readonly: true},
        });
    }

    private createTaskFromJira(issue: IJiraIssue) {
        const task = new Task({
            id: UUID(),
            name: `${issue.key}: ${issue.fields.summary}`,
            source: {src: siteBase(), id: issue.key},
            description: issue.fields.summary,
            estimate: issue.fields.aggregatetimeoriginalestimate * 1000,
            created: new Date(issue.fields.created),
        });
        Dispatcher.call(DoomPluginEvent.addTask, {task});
        this.setState(({tasks, issues}) => ({
            tasks: [...tasks, task],
            issues: issues.filter((iss) => iss.key !== issue.key),
        }));
    }
}
