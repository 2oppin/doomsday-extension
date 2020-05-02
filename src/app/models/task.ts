import {FaceMood} from "@app/components/view/Face/Face";
import {IWorklog, Worklog} from "@app/models/worklog";

export interface ITask {
    id: string;
    name: string;
    estimate: number;
    priority: number;
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

        if (a.complete && !b.complete) {
            return 1;
        } else if (b.complete && !a.complete) {
            return -1;
        }

        if (a.active && !b.active) {
            return -1;
        } else if (b.active && !a.active) {
            return 1;
        }

        if (a.priority !== b.priority) {
            return  a.priority > b.priority ? -1 : 1;
        }

        const logA = a.started && a.lastLogTime && a.lastLogTime.getTime();
        const logB = b.started && b.lastLogTime && b.lastLogTime.getTime();
        if (logA && !logB) {
            return -1;
        } else if (logB && !logA) {
            return 1;
        } else if (logA !== logB) {
            return logA > logB ? -1 : 1;
        }

        const startedCmp = Task.sortByStarted(a, b);
        if (startedCmp) return startedCmp;

        if (a.created.getTime() !== b.created.getTime()) {
            return a.created.getTime() > b.created.getTime() ? -1 : 1;
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
    private priorityValue: number = 0;

    constructor({id, name, priority = 0, created, estimate, deadline, description, complete = null, worklog = []}: ITask) {
        this.id = id;
        this.name = name;
        this.complete = complete ? new Date(complete) : null;
        this.estimate = estimate;
        this.priority = priority;
        this.deadline = new Date(deadline);
        this.description = description;
        this.created = created ? new Date(created) : new Date();
        this.worklog = worklog.map((w, i) => {
            return new Worklog(w);
        }).sort(Task.sortByStarted);
    }

    get priority(): number {
        return this.priorityValue;
    }

    set priority(val: number) {
        this.priorityValue = val > 12 ? 12 : (val < 0 ? 0 : val);
    }

    get isHighestPriority(): boolean {
        return this.priorityValue >= 10;
    }

    get isHighPriority(): boolean {
        return this.priorityValue >= 8;
    }

    get isAboveAveragePriority(): boolean {
        return this.priorityValue >= 6;
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

    get lastLogTime(): Date|null {
        return (this.started && this.worklog.slice(-1)[0].finished) || null;
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

    public toObject() {
        const data = {...this, priority: this.priority};
        delete data.priorityValue;
        return data;
    }
}

export function faceMoodOnTasks(tasks: Task[]): FaceMood {
    const failed = tasks.filter((t) => t.active && t.failed);
    const progress = tasks.filter((t) => t.active && !t.failed).reduce((a, t, i) => i ? (t.progress + a * (i - 1)) / i : t.progress, 0);

    let mood = FaceMood.OK;
    if (progress === 0 && !failed.length) mood = FaceMood.GOD;
    else if (progress > 90 || failed.length) mood = FaceMood.WORST;
    else if (progress > 70) mood = FaceMood.WORSE;
    else if (progress > 50) mood = FaceMood.BAD;
    else if (progress > 20) mood = FaceMood.NORM;
    return mood;
}
