import React, { Component } from "react";
import {Dispatcher} from '../../services/dispatcher';
import Panel from "../view/Panel/Panel";

export class DoomPanelContainer extends Component {
    constructor(params) {
        super(params);
        console.log('Your DOOM begins 22 now...');
        this.listen();
        this.state = {
            overflow: false,
            form: null,
            face: {mode: 'bad'},
            tasks: [],
            activeTask: null
        }
    }

    listen() {
        this.listenAction('closeForm', (...args) => this.onCloseForm(...args));
        this.listenAction('showForm', (...args) => this.onShowForm(...args));
        this.listenAction('tasksUpdated', (...args) => this.onTaskList(...args));
        this.listenAction('taskActivation', (...args) => this.onTaskActivation(...args));
        this.listenAction('configUpdated', (...args) => this.onConfig(...args));
    }
    listenAction(action, cb) {
        Dispatcher.once(action, (...data) => {
            cb.bind(this)(...data);
            this.listenAction(action, cb);
        });
    }
    onTaskList(tasks) {
        console.log('DoomContainer tassk:', tasks);
        this.setState({tasks});
    }
    onCloseForm() {
        this.setState({
            form: null,
            overflow: false
        });
    }
    onShowForm({name, data}) {
        console.log('DDDATATA', {...this.config, ...data});
        this.setState({
            form: {name, data: {...this.config, ...data}},
            overflow: true
        });
    }
    onTaskActivation({guid}) {
        this.config.active = guid;
    }
    onConfig(config) {
        console.log("READY TO UPDATE: ", config);
        this.config = config;
    }

    render() {
        const {overflow, face, form, tasks} = this.state;
        return (
            <div className="doom-manager">
                <Panel overflow={overflow}  face={face}  form={form} tasks={tasks} />
            </div>
        );
    }
}
