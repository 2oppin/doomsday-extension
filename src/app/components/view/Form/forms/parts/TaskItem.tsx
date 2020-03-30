import {DoomPluginEvent} from "@app/common/chromeEvents";

import {Face} from "@app/components/view/Face";

import {Task} from "@app/models/task";
import {Dispatcher} from "@app/services/dispatcher";
import React, {Component} from "react";
import _bt from "./button";
import _progressBar from "./progressbar";

import "./task-item.css";

const hrs = (msec: number) => ((msec / 36000) / 100) | 0;

interface ITaskItemProps {
  active: boolean;
  task: Task;
}
export class TaskItem extends Component<ITaskItemProps, {}> {
  public static getDerivedStateFromProps(props: ITaskItemProps) {
    return {task: new Task(props.task), selected: props.active};
  }
  constructor(props: ITaskItemProps) {
    super(props);
    this.state = TaskItem.getDerivedStateFromProps(props);
  }

  public renderActive(task: Task) {
    return (
      <div className="task-item item">
        <_bt u="⏸" title="Suspend ..." cb={() => this.pauseTask(task)} />
        <_progressBar task={task} />
        {this.renderTaskFace(task)}
        <_bt u="✔" title="Mark Completed" cb={() => this.finishTask(task)} />
      </div>
    );
  }

  public renderPaused(task: Task) {
    return (
      <div className="task-item item">
        <_bt u="▶" title="Start Working... NOW!" cb={() => this.startTask(task)} />
        {this.renderNonActiveTask(task)}
        {this.renderTaskFace(task)}
        <_bt u="✎" title="Edit" cb={() => this.editTask(task)} />
      </div>
    );
  }

  public renderFinished(task: Task) {
    return (
      <div className="task-item item">
        <_bt u="♻" title="Remove Task from history" cb={() => this.deleteTask(task)} />
        {this.renderNonActiveTask(task)}
        {this.renderTaskFace(task)}
        <div style={{width: 30}}/>
      </div>
    );
  }

  public renderNonActiveTask(task: Task) {
    enum StatusClass {NONE = "", WARN = "warn", BAD = "bad", GOOD = "GOOD"}

    let cls: StatusClass = StatusClass.WARN;
    if (task.done > 0.9 * task.estimate) cls = StatusClass.BAD;
    else if (task.done < 0.5 * task.estimate) cls = StatusClass.GOOD;

    const tilldd = hrs(new Date(task.deadline).getTime() - (new Date()).getTime());
    let clsdd: StatusClass = StatusClass.NONE;
    if (tilldd < 0) clsdd = StatusClass.BAD;
    else if (tilldd < 24) clsdd = StatusClass.WARN;
    else if (tilldd > 24 * 7) clsdd = StatusClass.GOOD;
    return (
      <span className="info hinted">
        <span className="hint">
          <span>Spent: <span className={cls}>{hrs(task.done)}h</span> of {hrs(task.estimate)}h</span>
          <span>Deadline: <span className={clsdd}>{tilldd}h</span></span>
        </span>
        <span className="content">{task.name}</span>
      </span>
    );
  }

  public renderTaskFace(task: Task) {
    return <Face health={100 * ((task.estimate - task.done) / task.estimate)} width={35} noAnimate={true}/>;
  }

  public render() {
    const {task} = this.props;
    if (task.finished)
      return this.renderFinished(task);
    return task.active
      ? this.renderActive(task)
      : this.renderPaused(task);
  }

  private startTask(task: Task) {
    return Dispatcher.call(DoomPluginEvent.startTask, {id: task.id, started: (new Date()).getTime()});
  }

  private editTask(task: Task) {
      return Dispatcher.dispatch(DoomPluginEvent.showForm, {name: "TaskEdit", data: {task}});
  }

  private finishTask(task: Task) {
    return Dispatcher.call(DoomPluginEvent.finishTask, {id: task.id, finished: (new Date()).getTime()});
  }

  private pauseTask(task: Task) {
    const done = (task.done || 0) + ((new Date()).getTime() - new Date(task.started).getTime());
    return Dispatcher.call(DoomPluginEvent.pauseTask, {id: task.id, started: null, done});
  }

  private deleteTask(task: Task) {
    return Dispatcher.call(DoomPluginEvent.deleteTask, {id: task.id});
  }
}
