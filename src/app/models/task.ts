import { UUID } from "@app/common/routines";

export interface ITask {
    id: string;
    name: string;
    estimate: number;
    created: number;
    deadline: Date;
    description: string;
    started: number;
    finished: number;
    done: number;
}

export class Task implements ITask {
    public static compare(a: Task, b: Task) {
        a = new Task(a);
        b = new Task(b);

        if (a.finished && !b.finished) return 1;
        if (b.finished && !a.finished) return -1;

        if (a.started && !b.started) return -1;
        if (b.started && !a.started) return 1;
        if (b.started && a.started) {
            if (a.started === b.started) return 0;
            return a.started < b.started ? 1 : -1;
        }

        if (a.created === b.created) return 0;
        return a.created < b.created ? 1 : -1;
    }

    public id: string;
    public name: string;
    public estimate: number;
    public deadline: Date;
    public created: number;
    public description: string;
    public started: number;
    public finished: number;

    public done: number;

    constructor({id, name, estimate, deadline, description, started, finished, done}: ITask) {
        this.id = id;
        this.name = name;
        this.estimate = estimate;
        this.deadline = new Date(deadline);
        this.description = description;
        this.done = done || 0;
        this.created = started || (new Date()).getTime();
        this.started = started || null;
        this.finished = finished || null;
    }

    get active() {
        return !!this.started && !this.finished;
    }

    get failed() {
        return this.did > this.estimate || this.deadline.getTime() < (new Date()).getTime();
    }

    /**
     * Did, including in this iteration, if we are in working mode
     */
    get did() {
        if (this.finished) return this.done;

        const now = (new Date()).getTime();
        return (this.done || 0) + now - (new Date(this.started || now)).getTime();
    }

    get progress() {
        const done = this.did;
        let progress = 0;
        if (done > this.estimate) {
            // tslint:disable-next-line:no-bitwise
            progress = - (100 * (1 - this.estimate / done)) | 0;
        } else {
            // tslint:disable-next-line:no-bitwise
            progress = (100 * (done || 0) / (this.estimate || 1)) | 0;
        }
        return progress;
    }
}
