import React, { Component } from 'react';
import { Dispatcher } from '@app/services/dispatcher';
import Task from '@app/models/task';
import _bt from './button';
import _progressBar from './progressbar';

import './task-item.css';

const hrs = (msec) => `${Math.floor(msec/36000)/100}h`;

export default class TaskItem extends Component {
  static getDerivedStateFromProps(props) {
    return {task: new Task(props.task), selected: props.active};
  }

  renderActive(task) {
    return (
      <div className='task-item item'>
        <_bt u="⏸" title="Suspend ..." cb={() => this.pauseTask(task)} />
        <_progressBar task={task} />
        <_bt u="✔" title="Mark Completed" cb={() => this.finishTask(task)} />
      </div>
    )
  }

  renderPaused(task) {
    return (
      <div className="task-item item">
        <_bt u="▶" title="Start Working... NOW!" cb={() => this.startTask(task)} />
        {this.renderNonActiveTask(task)}
        <_bt u="✎" title="Edit" cb={() => this.editTask(task)} />
      </div>
    )
  }

  renderFinished(task) {
    return (
      <div className="task-item item">
        <_bt u="♻" title="Remove Task from history" cb={() => this.deleteTask(task)} />
        {this.renderNonActiveTask(task)}
      </div>
    );
  }

  renderNonActiveTask(task) {
    let cls = 'warn';
    if (task.done > 0.9 * task.estimate) cls = 'bad';
    else if (task.done < 0.5 * task.estimate) cls = 'good';
    return (
      <span className="info hinted">
        <span className="hint">Spent: <span className={cls}>{hrs(task.done)}</span> of {hrs(task.estimate)}</span>
          <span className="content">{task.name}</span>
        </span>
    );
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
      console.log('edit click');
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
