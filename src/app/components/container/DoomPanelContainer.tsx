import "@app/app.css";
import {DoomPluginEvent, PONG} from "@app/common/chromeEvents";
import {FaceDraggable} from "@app/components/face/FaceDraggable";
import {ArchiveListForm} from "@app/components/forms/ArchiveListForm";
import ImportForm from "@app/components/forms/ImportForm";
import {JiraIssuesForm} from "@app/components/forms/JiraIssuesForm";
import {TaskEditForm} from "@app/components/forms/TaskEditForm";
import {TaskListForm} from "@app/components/forms/TaskListForm";
import {TaskViewForm} from "@app/components/forms/TaskViewForm";
import {IConfig} from "@app/globals";
import {Archive} from "@app/models/archive";
import {FaceMood, faceMoodOnTasks, Task} from "@app/models/task";
import {Panel} from "./Panel";

import {Dispatcher} from "@app/services/dispatcher";
import {Jira} from "@app/services/jira";
import React, {Component} from "react";

interface IDoomPanelProps {
    tasks?: Task[];
}

interface IDoomPanelState {
    overflow: boolean;
    form: any;
    face: { mood: FaceMood } | null;
    activeTask: string;
    config: IConfig;
    isJira: boolean;
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
            config: {
                tasks: [],
                archives: [],
                options: {showFace: false, readHelp: [], facePosition: {r: 15, y: 5, x: 0}},
            },
            isJira: false,
        };
    }

    public componentDidMount() {
        this.listen();
        Dispatcher.call(DoomPluginEvent.refresh, null, (conf) => this.onConfig(conf));
        this.hellthchekInterval = setInterval(() => this.hellthchekOnFace(), 3000);
        Jira.isJiraSite()
            .then((itIs) => this.setState({isJira: itIs}));
    }

    public componentWillUnmount() {
        clearInterval(this.hellthchekInterval);
    }

    public render() {
        const {face, form} = this.state;
        return (
            <div className="doom-manager">
                <Panel overflow={!!form} onClose={() => this.onCloseForm()}>
                    {this.renderForm()}
                    {face && <FaceDraggable {...face} onDoubleClick={() => this.toggleFormDisplaying()}/>}
                </Panel>
            </div>
        );
    }

    private hellthchekOnFace() {
        const {face, config} = this.state;
        if (!face || !config || !config.tasks) return;

        this.setState({face: {mood: faceMoodOnTasks(config.tasks)}});
    }

    private listen() {
        Dispatcher.subscribe(DoomPluginEvent.closeForm, () => this.onCloseForm());
        Dispatcher.subscribe(DoomPluginEvent.ping, () => Promise.resolve(PONG));
        Dispatcher.subscribe(DoomPluginEvent.showForm, (args: any) => this.onShowForm(args));
        Dispatcher.subscribe(DoomPluginEvent.taskActivation, (args: any) => this.onTaskActivation(args));
        Dispatcher.subscribe(DoomPluginEvent.configUpdated, (args: any) => this.onConfig(args));
    }

    private onCloseForm(): Promise<any> {
        return new Promise((r) =>
            this.setState({
                form: null,
                overflow: false,
            }, () => r(true)),
        );
    }

    private onShowForm({name, data}: { name: string, data: any }): Promise<boolean> {
        const {config} = this.state;
        const showFace = config && config.options && config.options.showFace;
        const facePosition = (config && config.options && config.options.facePosition) || {};
        return new Promise((r) =>
            this.setState({
                form: {name, data},
                overflow: true,
                face: showFace ? {mood: FaceMood.BAD, ...facePosition} : null,
            }, () => r(true)),
        );
    }

    private onTaskActivation({guid}: { guid: string }): Promise<boolean> {
        return new Promise<boolean>((r) =>

            this.setState((prev) => ({
                config: {
                    ...prev.config,
                    active: guid,
                },
            }), () => r(true)),
        );
    }

    private onConfig(config: Partial<IConfig> = {}): Promise<boolean> {
        return new Promise<boolean>((r) =>
            this.setState((prev) => {
                if (config.tasks) config.tasks = (config.tasks || []).map((t) => new Task(t));
                if (config.archives) config.archives = (config.archives || []).map((a) => new Archive(a));
                const newConfig = {...prev.config, ...config};
                const showFace = newConfig.options && newConfig.options.showFace;
                const facePosition = (config && config.options && config.options.facePosition) || {};
                return {
                    config: newConfig,
                    face: showFace ? {mood: faceMoodOnTasks(newConfig.tasks), ...facePosition} : null,
                };
            }, () => r(true)),
        );
    }

    private toggleFormDisplaying() {
        this.setState(({form}) => ({form: form ? null : {name: "TaskList"}}));
    }

    private renderForm() {
        if (!this.state.form) return null;
        const {name, data = {}} = this.state.form;
        const {config, isJira} = this.state;
        const {archives = []} = config;

        if (name === "TaskEdit") {
            return <TaskEditForm {...data} />;
        } else if (name === "JiraTasks") {
            return <JiraIssuesForm {...data} tasks={config.tasks || []}/>;
        } else if (name === "TaskView") {
            return <TaskViewForm {...data} />;
        } else if (name === "ArchiveList") {
            return <ArchiveListForm archives={archives}/>;
        } else if (name === "ImportForm")
            return <ImportForm {...data} />;
        else {
            return <TaskListForm {...{tasks: config.tasks, ...data, jira: isJira, hasArchive: archives.length > 0}} />;
        }
    }
}
