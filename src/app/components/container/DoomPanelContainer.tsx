import {DoomPluginEvent} from "@app/common/chromeEvents";
import {FaceMood} from "@app/components/view/Face/Face";

import {FaceDraggable} from "@app/components/view/Face/FaceDraggable";
import ImportForm from "@app/components/view/Form/forms/ImportForm";
import {TaskEditForm} from "@app/components/view/Form/forms/TaskEditForm";
import {TaskListForm} from "@app/components/view/Form/forms/TaskListForm";
import {Panel} from "@app/components/view/Panel/Panel";
import {IConfig} from "@app/globals";
import {Task} from "@app/models/task";

import {Dispatcher} from "@app/services/dispatcher";
import React, {Component} from "react";

import "@app/app.css";

interface IDoomPanelProps {
    tasks?: Task[];
}

interface IDoomPanelState {
    tasks: Task[];
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
            tasks: [],
            activeTask: null,
            config: null,
        };
    }

    public componentDidMount() {
        const {tasks} = this.state;
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
        const {face, tasks} = this.state;
        if (!face) return;

        const failed = tasks.filter((t) => t.active && t.failed);
        const progress = tasks.filter((t) => t.active && !t.failed).reduce((a, t, i) => i ? (t.progress + a * (i - 1)) / i : t.progress, 0);

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
        Dispatcher.subscribe(DoomPluginEvent.tasksUpdated, (tasks: any[]) => {
            const preparedTasks = tasks.map((t) => new Task(t));
            this.setState({
                tasks: preparedTasks,
            });
        });
        Dispatcher.subscribe(DoomPluginEvent.taskActivation, (args: any) => this.onTaskActivation(args));
        Dispatcher.subscribe(DoomPluginEvent.configUpdated, (args: any) => this.onConfig(args));
    }

    private onCloseForm() {
        this.setState({
            form: null,
            overflow: false,
        });
    }

    private onShowForm({name, data}: { name: string, data: any }) {
        const {config, tasks} = this.state;
        this.setState({
            form: {name, data: {...config, ...data, tasks}},
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

    private onConfig(config: IConfig) {
        this.setState({
            config,
            face: config.showFace ? {mood: FaceMood.BAD} : null,
        });
    }

    private toggleFormDisplaying() {
        this.setState((prev) => ({
            form: prev.form
                ? null
                : {name: "TaskList", data: {...prev.config, tasks: prev.tasks}},
        }));
    }

    private renderForm() {
        if (!this.state.form) return null;

        const {name, data} = this.state.form;
        const {tasks, config} = this.state;

        if (name === "TaskEdit") {
            return <TaskEditForm {...data} />;
        } else if (name === "ImportForm")
            return <ImportForm {...data} />;
        else
            return <TaskListForm {...{tasks}} />;
    }
}
