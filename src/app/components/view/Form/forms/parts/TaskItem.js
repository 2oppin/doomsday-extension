import React, { Component } from 'react';
import _bt from './button';
import _progressBar from './progressbar';

export default class TaskItem extends Component {
  static getDerivedStateFromProps(props) {
    return {task: props.task, selected: props.active};
  }

  isActive() {
    return !!task.started;
  }

  renderActive(task) {
    return (
      <div className='item'>
        <_bt u="9208" title="Suspend ..." cb={() => this.pauseTask(task)} />
        <__progressBar />
        <_bt u="10004" title="Complete" cb={() => this.finishTask(task)} />
      </div>
    )
  }

  renderPaused(task) {
    return (
      <div>{task.id}: {task.name}</div>
    )
  }

  render() {
    const {task} = this.props;
    return this.isActive
      ? this.renderActive(task)
      : this.renderPaused(task)
  }

  _pausedElement() {
    let li = document.createElement('div');
    li.setAttribute('class', 'item');

    li.appendChild(this._bt(9654, () => this.startTask(this), 'Start Working!'));
    li.appendChild(this._stdTxt());
    li.appendChild(this._bt(9998, () => this.editTask(this), 'Edit'));
    return li;
  }

  _historyElement() {
      let li = document.createElement('div');
      li.setAttribute('class', 'item');

      li.appendChild(this._bt(9851, () => this.deleteTask(this), 'Remove Task from history'));
      li.appendChild(this._stdTxt());
      return li;
  }

  _stdTxt() {
      const txt = document.createElement('span');
      txt.setAttribute('class', 'info');
      txt.innerHTML = `${this.name}`;
      return txt;
  }



  get el() {
    if(this.finished) return this._historyElement();
    return this.started
      ? this._activeElement()
      : this._pausedElement();
  }

  startTask(task){
     this._dispatcher('startTask', {guid: task.guid, started: (new Date()).getTime()});
  }
  editTask(task) {
      console.log('edit click');
      return Dispatcher.dispatch('showForm', {name: 'TaskEdit', data: {task}});
  }

  finishTask(task){
    this._dispatcher('finishTask', {guid: task.guid, finished: (new Date()).getTime()});
  }

  pauseTask(task) {
    let done = (task.done || 0) + ((new Date()).getTime() - new Date(task.started).getTime());
    this._dispatcher('pauseTask', {guid: task.guid, started: null, done});
  }

  deleteTask(task) {
    this._dispatcher('deleteTask', {guid: task.guid});
  }
}