import {Task} from "@app/models/task";

export const DOOM_OWERFLOW_APP_ID = "dd-doom-extention-app";

export interface IConfig {
    tasks: any[];
    showFace: boolean;
}

export interface IDDMessage {
 task?: Task;
 tasks?: Task[];
 showFace?: boolean;
 action: string;
 tabId?: number;
 id: any;
 started: number;
 finished: number;
 done: number;
}
