import {IWorklog, Worklog} from "@app/models/worklog";

export interface ITask {
    id: string;
    name: string;
    estimate: number;
    created: Date|number;
    deadline: Date|number;
    description: string;
    complete: Date|number|null;
    worklog: IWorklog[];
}

export class Task implements ITask {
    public static sort(a: Task, b: Task) {
        a = new Task(a);
        b = new Task(b);

        if (a.complete && !b.complete) return 1;
        if (b.complete && !a.complete) return -1;

        const startedCmp = Task.sortByStarted(a, b);
        if (startedCmp) return startedCmp;

        if (a.created.getTime() !== b.created.getTime()) {
            return a.created.getTime() < b.created.getTime() ? 1 : -1;
        }
        return b.name.localeCompare(a.name);
    }

    public static sortByStarted(a: {started: Date|null}, b: {started: Date|null}) {
        if (a.started && !b.started) return -1;
        if (b.started && !a.started) return 1;
        if (b.started && a.started) {
            if (a.started === b.started) return 0;
            return a.started < b.started ? -1 : 1;
        }
    }

    public id: string;
    public name: string;
    public estimate: number;
    public deadline: Date;
    public created: Date;
    public description: string;
    public complete: Date|null;
    public worklog: Worklog[];

    constructor({id, name, created, estimate, deadline, description, complete = null, worklog = []}: ITask) {
        this.id = id;
        this.name = name;
        this.estimate = estimate;
        this.deadline = new Date(deadline);
        this.description = description;
        this.created = created ? new Date(created) : new Date();
        this.worklog = worklog.map((w) => new Worklog(w)).sort(Task.sortByStarted);
    }

    get started(): Date|null {
        return this.worklog[0] ? this.worklog[0].started : null;
    }

    get done(): number {
        return this.worklog.reduce((a, b) => a + b.done, 0);
    }

    get active(): boolean {
        return !!this.started && !this.complete && !this.worklog.slice(-1)[0].finished;
    }

    get failed() {
        return this.done > this.estimate || this.deadline.getTime() < (new Date()).getTime();
    }

    get progress() {
        let progress = 0;
        if (this.done > this.estimate) {
            // tslint:disable-next-line:no-bitwise
            progress = - (100 * (1 - this.estimate / this.done)) | 0;
        } else {
            // tslint:disable-next-line:no-bitwise
            progress = (100 * (this.done || 0) / (this.estimate || 1)) | 0;
        }
        return progress;
    }
}
