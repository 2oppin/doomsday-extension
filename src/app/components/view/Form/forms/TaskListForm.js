import React from 'react';
import BasicForm from './BasicForm';
import { Dispatcher } from '@app/services/dispatcher';
import Task from '@app/models/task';
import TaskItem from './parts/TaskItem';

export default class TaskListForm extends BasicForm {
  constructor(props) {
    super(props);
    this.state = {
      ...this.state,
      caption: 'List of Missions:',
      ...TaskListForm.getDerivedStateFromProps(props)
    };
  }

  static getDerivedStateFromProps(props) {
    return {
      tasks: (props.tasks || []).map(t => new Task(t)),
      active: props.active,
    };
  }

  addTask() {
    Dispatcher.dispatch('showForm', {name: 'TaskEdit', data: { task: {}}})
  }

  renderForm() {
    const {tasks, active} = this.state;

    return (
      <div>
        <div className="dd-popup-form-tasklist">
          <div className="tasklist">
            {tasks.map(t => <TaskItem key={t.id} active={t.id === active} task={t} />)}
          </div>
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