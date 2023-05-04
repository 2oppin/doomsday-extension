import React, {Component} from "react";

import {DoomPluginEvent} from "@app/common/chromeEvents";
import {Help} from "@app/components/help/Help";
import {Task} from "@app/models/task";
import {Dispatcher} from "@app/services/dispatcher";

import {Form} from "./Form";

interface IPersonalFormProps {
    tasks: Task[];
    active?: string;
    hasArchive?: boolean;
    readonly?: boolean;
    previousForm?: string;
    jira?: boolean;
}

interface IPersonalFormSate {
    tasks: Task[];
    caption: string;
    active: string;
}

export class PersonalForm extends Component<IPersonalFormProps, IPersonalFormSate> {
    public static getDerivedStateFromProps(props: IPersonalFormProps) {
        return {
            tasks: (props.tasks || []).sort(Task.sort),
            active: props.active,
        };
    }

    private helpRef = React.createRef<Help>();

    constructor(props: IPersonalFormProps) {
        super(props);
        this.state = {
            ...this.state,
            caption: "List of Missions:",
            ...PersonalForm.getDerivedStateFromProps(props),
        };
    }

    public render() {
        const {readonly, previousForm, jira, hasArchive} = this.props;
        const {tasks, active} = this.state;

        return (
            <Form caption="About u, personally:">
                <div>
                    :P
                </div>
                <Help ref={this.helpRef}/>
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
