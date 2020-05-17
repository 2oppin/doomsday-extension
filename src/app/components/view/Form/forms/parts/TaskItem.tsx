import {DoomPluginEvent} from "@app/common/chromeEvents";
import {HelpInfo} from "@app/components/help/dictionary";

import {Face} from "@app/components/view/Face";
import _prrt from "@app/components/view/Form/forms/parts/priority";

import {Task} from "@app/models/task";
import {Dispatcher} from "@app/services/dispatcher";
import React, {Component} from "react";
import _bt from "./button";
import _progressBar from "./progressbar";

import "./task-item.css";

const hrs = (msec: number) => ((msec / 36000) / 100) | 0;

interface ITaskItemProps {
  active: boolean;
  readonly?: boolean;
  previousForm?: string;
  task: Task;
}
export class TaskItem extends Component<ITaskItemProps, {}> {
  public static getDerivedStateFromProps(props: ITaskItemProps) {
    return {task: props.task, selected: props.active};
  }
  constructor(props: ITaskItemProps) {
    super(props);
    this.state = TaskItem.getDerivedStateFromProps(props);
  }

  public renderActive(task: Task) {
    const {readonly} = this.props;
    return (
      <>
        <_bt u="⏸" {...{readonly}} title="Suspend ..." cb={() => this.pauseTask(task)} dataHelp={HelpInfo.TaskItemPause} />
        <_progressBar task={task} caption={
          <span className="cpt caption-link" onClick={() => this.showTask(task)}>{task.name}</span>
        } dataHelp={HelpInfo.TaskItemProgressbar}/>
        {this.renderTaskFace(task)}
        <_bt u="✔" {...{readonly}} title="Mark Completed" cb={() => this.finishTask(task)}  dataHelp={HelpInfo.TaskItemMarkDone} />
      </>
    );
  }

  public renderPaused(task: Task) {
    const {readonly} = this.props;
    return (
      <>
        <_bt u="▶" {...{readonly}} title="Start Working... NOW!" cb={() => this.startTask(task)} dataHelp={HelpInfo.TaskItemStart} />
        {this.renderNonActiveTask(task)}
        {this.renderTaskFace(task)}
        <_bt u="✎" {...{readonly}} title="Edit" cb={() => this.editTask(task)} dataHelp={HelpInfo.TaskItemEdit} />
      </>
    );
  }

  public renderFinished(task: Task) {
    const {readonly} = this.props;
    return (
      <>
        <_bt u={`\ud83c\udf81`} {...{readonly}} title="Add Task to Archive" yellow={true} cb={() => this.archiveTask(task)} dataHelp={HelpInfo.TaskItemArchive} />
        {this.renderNonActiveTask(task)}
        {this.renderTaskFace(task)}
        <_bt u="♻" {...{readonly}} title="Remove Task from history" cb={() => this.deleteTask(task)} dataHelp={HelpInfo.TaskItemDelete} />
      </>
    );
  }

  public renderNonActiveTask(task: Task) {
    enum StatusClass {NONE = "", WARN = "warn", BAD = "bad", GOOD = "GOOD"}

    let cls: StatusClass = StatusClass.WARN;
    if (task.done > 0.9 * task.estimate) cls = StatusClass.BAD;
    else if (task.done < 0.5 * task.estimate) cls = StatusClass.GOOD;

    const fin = (task.complete ? task.complete : new Date()).getTime();
    const tilldd = hrs( (new Date(task.deadline).getTime()) - fin);
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
        <span className="dd-content caption-link" onClick={() => this.showTask(task)} data-help={HelpInfo.TaskItemView}>{task.name}</span>
      </span>
    );
  }

  public renderTaskFace(task: Task) {
    return <span data-help={HelpInfo.TaskItemFace}>
      <Face health={100 * ((task.estimate - task.done) / task.estimate)} width={35} noAnimate={true} />
    </span>;
  }

  public render() {
    const {task} = this.props;
    if (task.complete)
      return (<div className="task-item item" data-help={HelpInfo.TaskItemComplete}>{this.renderFinished(task)}</div>);

    return (
        <div className="task-item item">
          {!task.priority ? null : <div className={"priority-container"} data-help={HelpInfo.TaskItemPriority}><_prrt lvl={task.priority} /></div>}
          {task.active
              ? this.renderActive(task)
              : this.renderPaused(task)
          }
        </div>
    );
  }

  private showTask(task: Task) {
    const {previousForm} = this.props;
    Dispatcher.dispatch(DoomPluginEvent.showForm, {name: "TaskView", data: {task, previousForm}});
  }

  private startTask({id, name, worklog}: Task) {
    return Dispatcher.call(DoomPluginEvent.startTask, {id});
  }

  private editTask(task: Task) {
      return Dispatcher.dispatch(DoomPluginEvent.showForm, {name: "TaskEdit", data: {task}});
  }

  private finishTask({id}: Task) {
    return Dispatcher.call(DoomPluginEvent.finishTask, {id});
  }

  private async pauseTask({id, name, worklog}: Task) {
    return Dispatcher.call(DoomPluginEvent.pauseTask, {id});
  }

  private deleteTask({id}: Task) {
    return Dispatcher.call(DoomPluginEvent.deleteTask, {id});
  }

  private archiveTask({id}: Task) {
    return Dispatcher.call(DoomPluginEvent.archiveTask, {id});
  }
}
