import React, {Component} from 'react';
import { Dispatcher } from '@app/services/dispatcher';
import { UUID } from '@app/common/routines';

import './TaskEditForm.css';
import Form from '@app/components/view/Form';
const DEFAULT_TASK = {
  name: 'New Mission',
  estimate: 2,
  deadline: new Date(new Date().getTime() + 24*3600*1000),
  description: 'Need to go through the HELL!!!'
};
const time = (d = new Date()) => (d = new Date(d)) && `${d.getUTCHours() || '00'}:${d.getUTCMinutes() || '00'}:${d.getUTCSeconds() || '00'}`;
const date = (d = new Date()) => `${d.getUTCFullYear()}-${`${d.getUTCMonth()+1}`.padStart(2, '0')}-${`${d.getDate()}`.padStart(2, '0')}`;
const dateTime = (d) => (t) => {
  return (t = new Date(t)) && new Date(d).setHours( t.getHours(), t.getMinutes(), t.getSeconds());
};

export default class TaskEditForm extends Component {
  constructor(props) {
    super(props);
    const {task} = props;
    this.state = {
      ...this.state,
      task: {...DEFAULT_TASK, ...task},
      caption: (task.id ? 'Revise' : 'New') + ' Mission:'
    };
  }

  saveTask() {
    const {task} = this.state;
    if (!task.id)
      Dispatcher.call('addTask', {task: {...task, id: UUID()}});
    else {
      Dispatcher.call('updateTask', {task});
    }

    this.backToList();
  }

  backToList() {
    Dispatcher.dispatch('showForm', {name: 'TaskList'});
  }

  render() {
    const {task} = this.state;

    return (<Form caption={`Edit "${task.name}":`}>
      <div className="dd-popup-form-task">
        <div className="dd-popup-form-inputfield">
          <label>Code Name</label>
          <input type="text" value={task.name} onChange={(e) => this.setState({task: {...task, name: e.target.value}})} />
        </div>
        <div className="dd-popup-form-inputfield">
          <label>Estimate (hours)</label>
          <input type="number" value={(task.estimate / 3600000) | 0} onChange={(e) => this.setState({task: {...task, estimate: (e.target.value * 3600000) | 0}})} />
        </div>
        <div className="dd-popup-form-column">
          <h5>Deadline</h5>
          <div className="dd-popup-form-row">
            <div className="dd-popup-form-inputfield dd-popup-form-column">
              <label>Date</label>
              <input
                type="date"
                value={date(new Date(task.deadline))}
                onChange={(e) => {
                  console.log('newD=', e.target.value);
                  this.setState({task: {...task, deadline: dateTime(new Date(e.target.value))(new Date(task.deadline))}})
                }} />
            </div>
            <div className="dd-popup-form-inputfield dd-popup-form-column">
              <label>Time</label>
              <input
                type="time"
                value={time(task.deadline)}
                onChange={(e) => this.setState({task: {
                  ...task,
                    deadline: dateTime(task.deadline)
                      ((new Date()).setHours(...e.target.value.split(':')))
                }})} />
            </div>
          </div>
        </div>
        <div className="dd-popup-form-inputfield">
          <label>Worklog</label>
          <input type="number" value={(task.done / 3600000)} onChange={(e) => this.setState({task: {...task, done: (e.target.value * 3600000)}})} />
        </div>
        <div className="dd-popup-form-inputfield">
          <label>Brief</label>
          <textarea value={task.description} onChange={(e) => this.setState({task: {...task, description: e.target.text}})} />
        </div>
        <div className="dd-form-buttonset">
          <button onClick={this.backToList}>Cancel</button>
          <button onClick={() => this.saveTask()}>{task.id ? 'Update' : 'Add'} Mission</button>
        </div>
      </div>
    </Form>)
  }
}
