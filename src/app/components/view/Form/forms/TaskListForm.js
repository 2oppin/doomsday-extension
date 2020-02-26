import React, {Component} from 'react';
import { Dispatcher } from '@app/services/dispatcher';
import Task from '@app/models/task';
import TaskItem from './parts/TaskItem';
import Form from '@app/components/view/Form';

export default class TaskListForm extends Component {
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
      tasks: props.tasks || [],
      active: props.active,
    };
  }

  addTask() {
    Dispatcher.dispatch('showForm', {name: 'TaskEdit', data: { task: {}}})
  }

  render() {
    const {tasks, active} = this.state;

    return (
      <Form caption="List of Tasks:">
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
      </Form>
    )
  }
}
