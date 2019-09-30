import React from 'react';
import BasicForm from './BasicForm';
import { Dispatcher } from '../../../../services/dispatcher';
import TaskItem from './parts/TaskItem';

export default class TaskListForm extends BasicForm {
  constructor(props) {
    super(props);
    this.state = {...this.state, caption: 'List of Missions:'};
  }

  addTask() {
    Dispatcher.dispatch('showForm', {name: 'TaskEdit', data: { task: {}}})
  }

  renderForm() {
    const {tasks, active} = this.props
    console.log('TTTTTTTTAAAAAAAAASKS', tasks);
    return (
      <div>
        <div className="dd-popup-form-tasklist">
          {tasks.map(t => <TaskItem key={t.id} active={t.id === active} task={t} />)}
        </div>
        <span
          className="dd-popup-form-task-btn dd-brd dd-add-task"
          onClick={this.addTask}
        >
          &#10133; <b>New Task</b>
        </span>
      </div>
    )
  }
}