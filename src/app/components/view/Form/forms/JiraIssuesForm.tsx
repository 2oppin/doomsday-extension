import {DoomPluginEvent} from "@app/common/chromeEvents";

import {Form} from "@app/components/view/Form/Form";
import _bt from "@app/components/view/Form/forms/parts/button";
import {Archive} from "@app/models/archive";
import {Dispatcher} from "@app/services/dispatcher";
import React, {Component} from "react";

import {Jira} from "../../../../services/jira";

import "./archive-list.css";


interface IJiraIssue {
    key: string;
    fields: {
        summary: string;
    };
}

interface IJiraIssuesSate {
    issues: IJiraIssue[];
    caption: string;
}

export class JiraIssuesForm extends Component<{}, IJiraIssuesSate> {
    constructor(props: any) {
        super(props);
        this.state = {
            caption: "List of JIRA Issues:",
            issues: [],
        };
    }

    public componentDidMount() {
        Jira.getActiveIssues()
            .then(({issues}: {issues: IJiraIssue[]}) => this.setState({issues}));
    }

    public render() {
        const {issues, caption} = this.state;

        return (
            <Form caption={caption}>
                <div>
                    <div className="dd-popup-form-tasklist">
                        <div className="tasklist">
                            {issues.map((issue, i) => (
                                <div key={i} className={"task-item item archive-item"}>
                                    <span>{issue.key}: {issue.fields.summary}</span>
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

    private showTaskList() {
        Dispatcher.dispatch(DoomPluginEvent.showForm, {name: "TaskList"});
    }

    private showArchive(arch: Archive) {
        Dispatcher.dispatch(DoomPluginEvent.showForm, {
            name: "TaskList",
            data: { tasks: arch.tasks, previousForm: "ArchiveList", readonly: true},
        });
    }
}
