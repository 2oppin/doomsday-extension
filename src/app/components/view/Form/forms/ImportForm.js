import React, {Component} from 'react';
import { Dispatcher } from '@app/services/dispatcher';
import Form from '@app/components/view/Form';

export default class TaskListForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      preloadedTasks: null,
      caption: 'Import saved tasks:',
    };
  }
  doImport() {
    const {preloadedTasks} = this.state;
    if (!preloadedTasks) {
      alert('No file selected');
      return;
    }
    if (!confirm('Are you sure? All your current tasks will be replaced')) return;
    Dispatcher.call('resetTasks', {tasks: preloadedTasks});
    Dispatcher.dispatch('showForm', {name: 'TaskList'});
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
    const {tasks, active, preloadedTasks} = this.state;

    return (
      <Form caption="List of Tasks:">
        <div>
          <div className="dd-popup-form-tasklist">
            <div className="tasklist">
              <input type="file" accept="application/json" onChange={(e) => {
                const file = e.target.files && e.target.files[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onload = (e) => this.setState({preloadedTasks: JSON.parse(e.target.result)});
                  reader.readAsText(file);
                }
              }}/>
              {preloadedTasks && <span>Total tasks: {preloadedTasks.length}</span>}
            </div>
          </div>
          <span
            className="dd-popup-form-task-btn dd-brd dd-add-task r-btn"
            onClick={() => this.doImport()}
          >
            &#10133; <b>Import</b>
          </span>
        </div>
      </Form>
    )
  }
}
