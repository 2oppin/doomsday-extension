import {DoomPluginEvent} from "@app/common/chromeEvents";

import {Form} from "@app/components/view/Form/Form";
import {Task} from "@app/models/task";
import {Dispatcher} from "@app/services/dispatcher";
import React, {Component} from "react";
import {TaskItem} from "./parts/TaskItem";

interface ITaskListProps {
  tasks: Task[];
  active?: string;
}

interface ITaskListSate {
  tasks: Task[];
  caption: string;
  active: string;
}

export class TaskListForm extends Component<ITaskListProps, ITaskListSate> {
  public static getDerivedStateFromProps(props: ITaskListProps) {
    return {
      tasks: (props.tasks || []).sort(Task.compare),
      active: props.active,
    };
  }

  constructor(props: ITaskListProps) {
    super(props);
    this.state = {
      ...this.state,
      caption: "List of Missions:",
      ...TaskListForm.getDerivedStateFromProps(props),
    };
  }

  public render() {
    const {tasks, active} = this.state;

    return (
        <Form caption="List of Tasks:">
          <div>
            <div className="dd-popup-form-tasklist">
              <div className="tasklist">
                {tasks.map((t) => <TaskItem key={t.id} active={t.id === active} task={t} />)}
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
                style={{transform: `rotate(180deg)`, border: "inset"}}
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
    );
  }

  private addTask() {
    Dispatcher.dispatch(DoomPluginEvent.showForm, {name: "TaskEdit", data: { task: {}}});
  }

  private importConfig() {
    Dispatcher.dispatch(DoomPluginEvent.showForm, {name: "ImportForm", data: { task: {}}});
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
