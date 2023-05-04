import {Task} from "@app/models/task";

export const DOOM_OWERFLOW_APP_ID = "dd-doom-extention-app";

export interface IConfigOptions {
    showFace: boolean;
    readHelp: string[];
    facePosition: { r: number, x: number, y: number };
}

export interface IConfig {
    tasks: any[];
    archives: any[];
    options: IConfigOptions;
}

export interface IDDMessage extends IConfigOptions {
    task?: Task;
    tasks?: Task[];
    action: string;
    tabId?: number;
    id: any;
    started: number;
    finished: number;
    done: number;
}

(global as any).DD_LANG = "en";