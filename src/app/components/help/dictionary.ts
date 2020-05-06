export enum HelpInfo {
    FormCaption = "help-form-caption",
    FormClose = "help-form-close",
    TaskList = "help-task-list",
    ExportBtn = "help-export-btn",
    ImportBtn = "help-import-btn",
    JiraBtn = "help-import-jira",

    TaskItemComplete = "help-task-item-complete",
    TaskItemPriority = "help-task-item-priority",
    TaskItemPause = "help-task-item-pause",
    TaskItemMarkDone = "help-task-item-done",
    TaskItemStart = "help-task-item-start",
    TaskItemEdit = "help-task-item-edit",
    TaskItemArchive = "help-task-item-arch",
    TaskItemDelete = "help-task-item-del",
    TaskItemFace = "help-task-item-face",
    TaskItemView = "help-task-item-view",
    TaskItemProgressbar = "help-task-item-progressbar",
    TaskItemInfo = "help-task-info",
}
export interface HelpTooltip {
    text: string;
}
export const HelpDict: {[key in HelpInfo]: HelpTooltip} = {
    [HelpInfo.FormCaption]: {text: "Here is the form caption, usually it's meaningful"},
    [HelpInfo.FormClose]: {text: "Here is the most straight-forward way to close a form (other: Click on Face, Click outside the form)"},
    [HelpInfo.TaskList]: {text: "That's the main form. Here you can see and manage tasks"},
    [HelpInfo.ExportBtn]: {text: "You can Save all current tasks (with all Doom-Taskmanager state) on the disk in a JSON format."},
    [HelpInfo.ImportBtn]: {text: "With this action you can replace your current state with one of previously exported."},
    [HelpInfo.JiraBtn]: {text: "While being on the JIRA page, you can import all your opened tasks into Doom Manager."},
    [HelpInfo.TaskItemComplete]: {text: "This is how completed task looks like"},
    [HelpInfo.TaskItemPriority]: {text: "Here is priority box. 0-level not displayed, 1-5 ordinary priority levels, then goes blue/yellow/red \"Skull\" levels; It's supposed that those tasks will be really special."},
    [HelpInfo.TaskItemPause]: {text: "Click such button when you need to suspend your current work on the task"},
    [HelpInfo.TaskItemMarkDone]: {text: "Click such button when task is finished (available only if you are currently working on this task)"},
    [HelpInfo.TaskItemStart]: {text: "Click such button when you ready to work on the task, so time you spent on it will be tracked"},
    [HelpInfo.TaskItemEdit]: {text: "Click such button if you want to change something in the task"},
    [HelpInfo.TaskItemArchive]: {text: "Click such button if you want to save info about this completed task, but don't want it to be shown in the list of the current tasks"},
    [HelpInfo.TaskItemDelete]: {text: "Click such button if you want to DELETE completed task for good, without a trace"},
    [HelpInfo.TaskItemFace]: {text: "This is the indicator of how good are you on this task, the closer spent time to the estimated, the worse condition is. Also it's worst if you are passed deadline. You also should to know if you are completed your task without a swet, with a face without a bruises, it means you are bad with estimations"},
    [HelpInfo.TaskItemView]: {text: "Click on a task name to open it in a view(readonly) mode."},
    [HelpInfo.TaskItemProgressbar]: {text: "This is how your progress looks like."},
    [HelpInfo.TaskItemInfo]: {text: "This is the basic info on the task. Estimation, time spent, deadline."},
};
