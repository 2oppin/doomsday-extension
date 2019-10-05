import React from 'react';
import BasicForm from './BasicForm';
import { Dispatcher } from '@app/services/dispatcher';
import routines from '@app/common/routines';

import './TaskEditForm.css';
const DEFAULT_TASK = {
  name: 'New Mission',
  estimate: 2,
  deadline: new Date(new Date().getTime() + 24*3600000),
  description: 'Need to go through the HELL!!!'
};
export default class TaskEditForm extends BasicForm {
  constructor(props) {
    super(props);
    const {task} = props;
    this.state = {
      ...this.state,
      task: {...DEFAULT_TASK, ...task},
      caption: (task.id ? 'Rewise' : 'New') + ' Mission:'
    };
  }

  saveTask() {
    const {task} = this.state;
    if (!task.id)
      Dispatcher.call('addTask', {task: {...task, id: routines.UUID()}});
    this.backToList();
  }

  backToList() {
    Dispatcher.dispatch('showForm', {name: 'TaskList'});
  }

  renderForm() {
    const {task} = this.state;

    return (
      <div className="dd-popup-form-task">
        <div className="dd-popup-form-inputfield">
          <label>Code Name</label>
          <input type="text" value={task.name} onChange={(e) => this.setState({task: {...task, name: e.target.value}})} />
        </div>
        <div className="dd-popup-form-inputfield">
          <label>Estimate (hours)</label>
          <input type="number" value={task.estimate} onChange={(e) => this.setState({task: {...task, estimate: e.target.value}})} />
        </div>
        <div className="dd-popup-form-column">
          <h5>Deadline</h5>
          <div className="dd-popup-form-row">
            <div className="dd-popup-form-inputfield dd-popup-form-column">
              <label>Date</label>
              <input type="date" value={task.deadline} onChange={(e) => this.setState({task: {...task, deadline: e.target.value}})} />
            </div>
            <div className="dd-popup-form-inputfield dd-popup-form-column">
              <label>Time</label>
              <input type="time" value={task.deadline} onChange={(e) => this.setState({task: {...task, deadline: e.target.value}})} />
            </div>
          </div>
        </div>
        <div className="dd-popup-form-inputfield">
          <label>Brief</label>
          <textarea type="text" value={task.description} onChange={(e) => this.setState({task: {...task, description: e.target.text}})} />
        </div>
        <div className="dd-form-buttonset">
          <button onClick={this.backToList}>Cancel</button>
          <button onClick={() => this.saveTask()}>{task.id ? 'Update' : 'Add'} Mission</button>
        </div>
      </div>
    )
  }
}