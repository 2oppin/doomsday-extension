export enum HelpInfo {
    FormCaption = "help-form-caption",
    FormClose = "help-form-close",
    TaskList = "help-task-list",
    ExportBtn = "help-export-btn",
    ImportBtn = "help-import-btn",
}
export interface HelpTooltip {
    text: string;
}
export const HelpDict: {[key in HelpInfo]: HelpTooltip} = {
    [HelpInfo.FormCaption]: {text: "Here is the form caption, usually it's meaningful"},
    [HelpInfo.FormClose]: {text: "Here is the most straight-forward way to close a form (other: Click on Face, Click outside the form)"},
    [HelpInfo.TaskList]: {text: "That's the main form. Here you can see and manage tasks"},
    [HelpInfo.ExportBtn]: {text: "You can Save all current tasks (with all Doom-Taskmanager state) on the disk in a JSON format, so you easly can port it"},
    [HelpInfo.ImportBtn]: {text: "With this action you can replace your current state with ine previously exported"},
};
