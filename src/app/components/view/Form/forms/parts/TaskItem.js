import React, { Component } from 'react';
import { Dispatcher } from '@app/services/dispatcher';
import Task from '@app/models/task';
import _bt from './button';
import _progressBar from './progressbar';

import './task-item.css';
import Face from '@app/components/view/Face';

const hrs = (msec) => Math.floor(msec/36000)/100;

export default class TaskItem extends Component {
  static getDerivedStateFromProps(props) {
    return {task: new Task(props.task), selected: props.active};
  }

  renderActive(task) {
    return (
      <div className='task-item item'>
        <_bt u="⏸" title="Suspend ..." cb={() => this.pauseTask(task)} />
        <_progressBar task={task} />
        {this.renderTaskFace(task)}
        <_bt u="✔" title="Mark Completed" cb={() => this.finishTask(task)} />
      </div>
    )
  }

  renderPaused(task) {
    return (
      <div className="task-item item">
        <_bt u="▶" title="Start Working... NOW!" cb={() => this.startTask(task)} />
        {this.renderNonActiveTask(task)}
        {this.renderTaskFace(task)}
        <_bt u="✎" title="Edit" cb={() => this.editTask(task)} />
      </div>
    )
  }

  renderFinished(task) {
    return (
      <div className="task-item item">
        <_bt u="♻" title="Remove Task from history" cb={() => this.deleteTask(task)} />
        {this.renderNonActiveTask(task)}
        {this.renderTaskFace(task)}
        <div style={{width: 30}}/>
      </div>
    );
  }

  renderNonActiveTask(task) {
    let cls = 'warn';
    if (task.done > 0.9 * task.estimate) cls = 'bad';
    else if (task.done < 0.5 * task.estimate) cls = 'good';

    const tilldd = hrs(new Date(task.deadline).getTime() - (new Date()).getTime());
    let clsdd = '';
    if (tilldd < 0) clsdd = 'bad';
    else if (tilldd < 24) clsdd = 'warn';
    else if (tilldd > 24*7) clsdd = 'good';
    return (
      <span className="info hinted">
        <span className="hint">
          <span>Spent: <span className={cls}>{hrs(task.done)}h</span> of {hrs(task.estimate)}h</span>
          <span>Deadline: <span className={clsdd}>{tilldd}h</span></span>
        </span>
        <span className="content">{task.name}</span>
      </span>
    );
  }

  renderTaskFace(task) {
    return <Face health={100*((task.estimate - task.done) / task.estimate)} width={35} noAnimate={true}/>;
  }

  render() {
    const {task} = this.props;
    if (task.finished)
      return this.renderFinished(task);
    return task.active
      ? this.renderActive(task)
      : this.renderPaused(task)
  }

  startTask(task){
    return Dispatcher.call('startTask', {id: task.id, started: (new Date()).getTime()});
  }
  editTask(task) {
      return Dispatcher.dispatch('showForm', {name: 'TaskEdit', data: {task}});
  }

  finishTask(task){
    return Dispatcher.call('finishTask', {id: task.id, finished: (new Date()).getTime()});
  }

  pauseTask(task) {
    let done = (task.done || 0) + ((new Date()).getTime() - new Date(task.started).getTime());
    return Dispatcher.call('pauseTask', {id: task.id, started: null, done});
  }

  deleteTask(task) {
    return Dispatcher.call('deleteTask', {id: task.id});
  }
}
