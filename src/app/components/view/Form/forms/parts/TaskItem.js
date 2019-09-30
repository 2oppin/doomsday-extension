import React, { Component } from 'react';

export default class TaskItem extends Component {
  static getDerivedStateFromProps(props) {
    return {task: props.task, selected: props.active};
  }

  isActive() {
    return !!task.started;
  }

  renderActive(task) {
    /*
    let li = document.createElement('div');
    li.setAttribute('class', 'item');

    li.appendChild(this._bt(9208, () => this.pauseTask(this), 'Suspend ...'));
    li.appendChild(this._progressBar());
    li.appendChild(this._bt(10004, () => this.finishTask(this), 'Complete'));        
    return li;
*/
    return (
      <div className='item'>{task.id}: {task.name}</div>
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

  _pausedElement = () => {
    let li = document.createElement('div');
    li.setAttribute('class', 'item');

    li.appendChild(this._bt(9654, () => this.startTask(this), 'Start Working!'));
    li.appendChild(this._stdTxt());
    li.appendChild(this._bt(9998, () => this.editTask(this), 'Edit'));
    return li;
  };

  _activeElement = () => {

  }

  _historyElement = () => {
      let li = document.createElement('div');
      li.setAttribute('class', 'item');

      li.appendChild(this._bt(9851, () => this.deleteTask(this), 'Remove Task from history'));
      li.appendChild(this._stdTxt());
      return li;
  }

  _bt = (unc, cb, title) => {
      const bt = document.createElement('span');
      bt.setAttribute('class', 'dd-popup-form-task-btn dd-brd');
      bt.innerHTML = `&#${unc};`;
      if (title)
          bt.setAttribute('title', title);
      bt.addEventListener('click', cb);
      return bt;
  };

  _stdTxt = () => {
      const txt = document.createElement('span');
      txt.setAttribute('class', 'info');
      txt.innerHTML = `${this.name}`;
      return txt;
  }

  _countDown = () => {
      const el = document.createElement('span');
      el.setAttribute('class', 'countdown');
      const cnt = document.createElement('span');
      cnt.setAttribute('class', 'countdown-clock');
      el.appendChild(cnt);

      const left = this.estimate - this.did;
      if (left < 0) {
          const cnte = document.createElement('span');
          cnte.setAttribute('class', 'deadline-clock');
          cnte.innerHTML = ((this.estimate / 3600000) | 0) + 'h - failed';
          el.appendChild(cnte);
          cnt.classList.add('failed');
      }
      const interval = setInterval(() => {
          if (!el.isConnected) clearInterval(interval);
          const left = this.estimate - this.did, aleft = Math.abs(left);
          const h = (left/3600000)|0, ah = Math.abs(h);
          const m = ((aleft - ah*3600000)/60000)|0;
          const s = ((aleft - ah*3600000 - m*60000)/1000)|0;

          const f = (v) => (v+'').padStart(2, '0');
          let time = `${f(h)}:${f(m)}:${f(s)}`;

          cnt.innerHTML = time;
      }, 1000);

      return el;
  }

  _progressBar = () => {
      const el = document.createElement('span');
      el.setAttribute('class', 'prg');
      el.appendChild(this._countDown());
      const cpt = document.createElement('span');
      cpt.setAttribute('class', 'cpt');
      cpt.innerHTML = `${this.name}`;
      el.appendChild(cpt);

      const bar = document.createElement('div');
      bar.setAttribute('class', 'prg-bar');
      const barv = document.createElement('div');
      barv.setAttribute('class', 'prg-val');
      
      let progress = this.progress;
      if (progress < 0) {
          bar.classList.add('inv');
          progress *=-1;
      }
      barv.setAttribute('style', `width:${progress}%`);
      bar.appendChild(barv);

      el.appendChild(bar);
      return el;
  }

  get did() {
      const now = (new Date()).getTime();
      return (this.done || 0) + now - (new Date(this.started || now)).getTime();
  }

  get progress() {
      const done = this.did;
      let progress = 0;
      if (this.done > this.estimate) {
          progress = - (100 * (1 - this.estimate / done))|0;
      } else {
          progress = (100*(done||0) / (this.estimate || 1))|0;
      }
      return progress;
  }

  get el() {
    if(this.finished) return this._historyElement();
    return this.started
      ? this._activeElement()
      : this._pausedElement();
  }

  startTask = (task) => this._dispatcher('startTask', {guid: task.guid, started: (new Date()).getTime()});
  editTask = (task) => {
      console.log('edit click');
      return Dispatcher.dispatch('showForm', {name: 'TaskEdit', data: {task}});
  }

  finishTask = (task) => this._dispatcher('finishTask', {guid: task.guid, finished: (new Date()).getTime()});

  pauseTask = (task) => {
    let done = (task.done || 0) + ((new Date()).getTime() - new Date(task.started).getTime());
    this._dispatcher('pauseTask', {guid: task.guid, started: null, done});
  }

  deleteTask = (task) => this._dispatcher('deleteTask', {guid: task.guid});
}