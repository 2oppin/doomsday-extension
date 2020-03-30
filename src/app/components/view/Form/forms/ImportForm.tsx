import {DoomPluginEvent} from "@app/common/chromeEvents";

import {Form} from "@app/components/view/Form/Form";
import {Task} from "@app/models/task";
import {Dispatcher} from "@app/services/dispatcher";
import React, {Component} from "react";

interface ITaskListFormState {
  preloadedTasks?: Task[];
  tasks?: Task[];
  caption: string;
}

export default class TaskListForm extends Component<{}, ITaskListFormState> {
  constructor(props: any) {
    super(props);
    this.state = {
      preloadedTasks: null,
      caption: "Import saved tasks:",
    };
  }
  public render() {
    const {preloadedTasks} = this.state;

    return (
      <Form caption="List of Tasks:">
        <div>
          <div className="dd-popup-form-tasklist">
            <div className="tasklist">
              <input type="file" accept="application/json" onChange={(e) => {
                const file = e.target.files && e.target.files[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onload = (loadE: any) => this.setState({preloadedTasks: JSON.parse(loadE.target.result)});
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
    );
  }

  private doImport() {
    const {preloadedTasks} = this.state;
    if (!preloadedTasks) {
      alert("No file selected");
      return;
    }
    if (!confirm("Are you sure? All your current tasks will be replaced")) return;
    Dispatcher.call(DoomPluginEvent.resetTasks, {tasks: preloadedTasks});
    Dispatcher.dispatch(DoomPluginEvent.showForm, {name: "TaskList"});
  }

  private exportConfig() {
    const {tasks} = this.state;
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(tasks));
    const aEl = document.createElement("a");
    aEl.setAttribute("href", dataStr);
    aEl.setAttribute("download", "DOOMed-Tasks.json");
    aEl.click();
  }
}
