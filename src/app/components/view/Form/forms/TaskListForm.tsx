import {DoomPluginEvent} from "@app/common/chromeEvents";

import {Form} from "@app/components/view/Form/Form";
import {Task} from "@app/models/task";
import {Dispatcher} from "@app/services/dispatcher";
import React, {Component} from "react";
import {TaskItem} from "./parts/TaskItem";

interface ITaskListProps {
  tasks: Task[];
  active?: string;
  readonly?: boolean;
  previousForm?: string;
}

interface ITaskListSate {
  tasks: Task[];
  caption: string;
  active: string;
}

export class TaskListForm extends Component<ITaskListProps, ITaskListSate> {
  public static getDerivedStateFromProps(props: ITaskListProps) {
    return {
      tasks: (props.tasks || []).sort(Task.sort),
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
    const {readonly, previousForm} = this.props;
    const {tasks, active} = this.state;

    return (
        <Form caption="List of Tasks:">
          <div>
            <div className="dd-popup-form-tasklist">
              <div className="tasklist">
                {tasks.map((t) => <TaskItem {...{readonly, previousForm}} key={t.id} active={t.id === active} task={t} />)}
              </div>
            </div>
            {!readonly && <span
                className="dd-popup-form-task-btn dd-brd dd-big-btn"
                onClick={() => this.addTask()}
            >
              &#10133; <b>New Task</b>
            </span>}
            <span
                className="dd-popup-form-task-btn dd-brd dd-big-btn yellow-btn"
                onClick={() => this.showArchives()}
            >
              &#x1F381; <b>Show Archives</b>
            </span>
            {!readonly && <>
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
            </>}
          </div>
        </Form>
    );
  }

  private showArchives() {
    Dispatcher.dispatch(DoomPluginEvent.showForm, {name: "ArchiveList", data: { task: {}}});
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
