import React, {Component} from 'react';
import { Dispatcher } from '@app/services/dispatcher';
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
  importConfig() {
    Dispatcher.dispatch('showForm', {name: 'ImportForm', data: { task: {}}})
  }
  exportConfig() {
    const {tasks} = this.state;
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(tasks));
    const aEl = document.createElement('a');
    aEl.setAttribute("href", dataStr);
    aEl.setAttribute("download", "DOOMed-Tasks.json");
    aEl.click();
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
            onClick={() => this.addTask()}
          >
            &#10133; <b>New Task</b>
          </span>
          <span
            className="dd-popup-form-task-btn dd-brd r-btn"
            onClick={() => this.exportConfig()}
            style={{transform: `rotate(180deg)`, border: 'inset'}}
          >
            &#8687;
          </span>
          <span
            className="dd-popup-form-task-btn dd-brd r-btn"
            onClick={() => this.importConfig()}
          >
            &#8687;
          </span>
        </div>
      </Form>
    )
  }
}
