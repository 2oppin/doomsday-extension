import {DoomPluginEvent} from "@app/common/chromeEvents";
import {FaceMood} from "@app/components/view/Face/Face";

import {FaceDraggable} from "@app/components/view/Face/FaceDraggable";
import {ArchiveListForm} from "@app/components/view/Form/forms/ArchiveListForm";
import ImportForm from "@app/components/view/Form/forms/ImportForm";
import {TaskEditForm} from "@app/components/view/Form/forms/TaskEditForm";
import {TaskListForm} from "@app/components/view/Form/forms/TaskListForm";
import {TaskViewForm} from "@app/components/view/Form/forms/TaskViewForm";
import {Panel} from "@app/components/view/Panel/Panel";
import {IConfig} from "@app/globals";
import {Archive} from "@app/models/archive";
import {Task} from "@app/models/task";

import {Dispatcher} from "@app/services/dispatcher";
import React, {Component} from "react";

import "@app/app.css";

interface IDoomPanelProps {
    tasks?: Task[];
}

interface IDoomPanelState {
    overflow: boolean;
    form: any;
    face: { mood: FaceMood } | null;
    activeTask: string;
    config: IConfig;
}

export class DoomPanelContainer extends Component<IDoomPanelProps, IDoomPanelState> {
    private hellthchekInterval: any = null;

    constructor(params: any) {
        super(params);
        this.state = {
            overflow: false,
            form: null,
            face: {mood: FaceMood.BAD},
            activeTask: null,
            config: null,
        };
    }

    public componentDidMount() {
        const {config} = this.state;
        this.listen();
        this.hellthchekInterval = setInterval(() => this.hellthchekOnFace(), 3000);
    }

    public componentWillUnmount() {
        clearInterval(this.hellthchekInterval);
    }

    public render() {
        const {face, form} = this.state;
        return (
            <div className="doom-manager">
                <Panel overflow={!!form} onEscClick={() => this.onCloseForm()}>
                    {face && <FaceDraggable {...face} onDoubleClick={() => this.toggleFormDisplaying()}/>}
                    {this.renderForm()}
                </Panel>
            </div>
        );
    }

    private hellthchekOnFace() {
        const {face, config} = this.state;
        if (!face) return;

        const failed = config.tasks.filter((t) => t.active && t.failed);
        const progress = config.tasks.filter((t) => t.active && !t.failed).reduce((a, t, i) => i ? (t.progress + a * (i - 1)) / i : t.progress, 0);

        let mood = FaceMood.OK;
        if (progress === 0 && !failed.length) mood = FaceMood.GOD;
        else if (progress > 90 || failed.length) mood = FaceMood.WORST;
        else if (progress > 70) mood = FaceMood.WORSE;
        else if (progress > 50) mood = FaceMood.BAD;
        else if (progress > 20) mood = FaceMood.NORM;
        this.setState({face: {mood}});
    }

    private listen() {
        Dispatcher.subscribe(DoomPluginEvent.closeForm, () => this.onCloseForm());
        Dispatcher.subscribe(DoomPluginEvent.showForm, (args: any) => this.onShowForm(args));
        Dispatcher.subscribe(DoomPluginEvent.taskActivation, (args: any) => this.onTaskActivation(args));
        Dispatcher.subscribe(DoomPluginEvent.configUpdated, (args: any) => {
            this.onConfig(args);
        });
    }

    private onCloseForm() {
        this.setState({
            form: null,
            overflow: false,
        });
    }

    private onShowForm({name, data}: { name: string, data: any }) {
        const {config} = this.state;
        this.setState({
            form: {name, data},
            overflow: true,
            face: config && config.showFace ? {mood: FaceMood.BAD} : null,
        });
    }

    private onTaskActivation({guid}: { guid: string }) {
        this.setState((prev) => ({
            config: {
                ...prev.config,
                active: guid,
            },
        }));
    }

    private onConfig(config: Partial<IConfig>) {
        this.setState((prev) => {
            if (config.tasks) config.tasks = (config.tasks || []).map((t) => new Task(t));
            if (config.archives) config.archives = (config.archives || []).map((a) => new Archive(a));
            return {
                config: {...prev.config, ...config},
                face: config.showFace ? {mood: FaceMood.BAD} : null,
            };
        });
    }

    private toggleFormDisplaying() {
        this.setState((prev) => {
            return {
                form: prev.form ? null : {name: "TaskList"},
            };
        });
    }

    private renderForm() {
        if (!this.state.form) return null;
        const {name, data = {}} = this.state.form;
        const {config} = this.state;
        const {archives = []} = config;

        if (name === "TaskEdit") {
            return <TaskEditForm {...data} />;
        } else if (name === "TaskView") {
            return <TaskViewForm {...data} />;
        } else if (name === "ArchiveList") {
            return <ArchiveListForm archives={archives} />;
        } else if (name === "ImportForm")
            return <ImportForm {...data} />;
        else {
            return <TaskListForm {...{tasks: config.tasks, ...data}} />;
        }
    }
}
