import {Task} from "@app/models/task";

export const DOOM_OWERFLOW_APP_ID = "dd-doom-extention-app";

export interface IConfigOptions {
    showFace: boolean;
}
export interface IConfig {
    tasks: any[];
    archives: any[];
    options: IConfigOptions;
}

export interface IDDMessage {
 task?: Task;
 tasks?: Task[];
 options?: IConfigOptions;
 action: string;
 tabId?: number;
 id: any;
 started: number;
 finished: number;
 done: number;
}
