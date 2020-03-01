import React, { Component } from "react";
import {Dispatcher} from '../../services/dispatcher';
import Panel from "../view/Panel/Panel";
import FaceDraggable from '@app/components/view/Face/FaceDraggable';
import TaskEditForm from '@app/components/view/Form/forms/TaskEditForm';
import TaskListForm from '@app/components/view/Form/forms/TaskListForm';
import Task from '@app/models/task';
import ImportForm from '@app/components/view/Form/forms/ImportForm';

export class DoomPanelContainer extends Component {
    // hellthchekInterval = null;
    constructor(params) {
        super(params);
        console.log('Your DOOM begins now...');
        this.state = {
            overflow: false,
            form: null,
            face: {mode: 'bad'},
            tasks: [],
            activeTask: null,
            config: {},
        };
    }

    componentDidMount() {
        const {tasks} = this.state;
        this.listen();
        this.hellthchekInterval = setInterval(this.hellthchekOnFace.bind(this), 10000);
    }

    componentWillUnmount() {
        clearInterval(this.hellthchekInterval);
    }

    listen() {
        this.listenAction('closeForm', (...args) => this.onCloseForm(...args));
        this.listenAction('showForm', (...args) => this.onShowForm(...args));
        this.listenAction('tasksUpdated', (tasks) => this.setState({
            tasks: tasks.map(t => new Task(t)),
        }));
        this.listenAction('taskActivation', (...args) => this.onTaskActivation(...args));
        this.listenAction('configUpdated', (...args) => this.onConfig(...args));
    }

    listenAction(action, cb) {
        Dispatcher.once(action, (...data) => {
            cb.bind(this)(...data);
            this.listenAction(action, cb);
        });
    }

    hellthchekOnFace() {
        const {config, tasks, face} = this.state;
   //     if (!config.showFace) return;

        const failed = tasks.filter(t => t.active && t.failed);
        const progress = tasks.filter(t => t.active && !t.failed).reduce((a, t, i) => i ? (t.progress + a * (i - 1)) / i : t.progress, 0);

        let mood = 'ok';
        if (progress === 0 && !failed.length) mood = 'god';
        else if (progress > 90 || failed.length) mood = 'worst';
        else if (progress > 70) mood = 'worse';
        else if (progress > 50) mood = 'bad';
        else if (progress > 20) mood = 'norm';
        this.setState({face: {mood}});
    }

    onCloseForm() {
        this.setState({
            form: null,
            overflow: false
        });
    }

    onShowForm({name, data}) {
        const {config, tasks} = this.state;
        console.log('DDDATATA', {...config, ...data, tasks});
        this.setState({
            form: {name, data: {...config, ...data, tasks}},
            overflow: true,
            face: config.showFace ? {mood: 'bad'} : null
        });
    }
    onTaskActivation({guid}) {
        this.setState(prev => ({
            config: {
                ...prev.config,
                active: guid,
            }
        }));
    }
    onConfig(config) {
        this.setState({
            config,
            face: config.showFace ? {mood: 'bad'} : null
        });
    }

    toggleFormDisplaying() {
        this.setState(prev =>({form: prev.form
            ? null
            : { name: 'TaskList', data: { ...prev.config, tasks: prev.tasks } }
          }));
    }

    renderForm() {
        if (!this.state.form) return null;

        const {name, data} = this.state.form;
        const {tasks, config} = this.state;

        console.log('FORM', data.tasks[data.tasks.length-1].name);
        if (name === 'TaskEdit') {
            return <TaskEditForm {...data} />;
        } else if (name === 'ImportForm')
            return <ImportForm {...data} />;
        else
            return <TaskListForm {...{tasks}} />;
    }

    render() {
        const {face, form, tasks} = this.state;
        return (
            <div className="doom-manager">
                <Panel overflow={!!form}  face={face} tasks={tasks} onEscClick={() => this.onCloseForm()}>
                    {face && <FaceDraggable {...face} onDoubleClick={() => this.toggleFormDisplaying()}/>}
                    {this.renderForm()}
                </Panel>
            </div>
        );
    }
}
