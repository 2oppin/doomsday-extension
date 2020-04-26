export interface IWorklog {
    started: number|Date;
    finished: number|Date|null;
}
const diffDate = (a: Date, b: Date): number => (a.getTime() - b.getTime()) / 1000;
export class Worklog implements IWorklog {
    public started: Date;
    public finished: Date|null;

    constructor({started, finished = null}: IWorklog) {
        this.started = new Date(started);
        this.finished = finished ? new Date(finished) : null;
        if (this.finished && this.finished.getTime() < this.started.getTime()) {
            throw new Error("Start can't be later than end");
        }
    }

    get done(): number {
        return ((this.finished || new Date()).getTime() - this.started.getTime());
    }

    public includes(w: Worklog) {
        if (!w.finished || !this.finished) {
            return false;
        }
        return diffDate(this.finished, w.started) > 0
            && diffDate(this.finished, w.finished) > 0
            && diffDate(this.started, w.started) < 0;
    }

    public isTooCloseTo(w: Worklog) {
        const min5 = 300;
        return (Math.abs(diffDate(this.finished, w.started)) < min5)
          || (Math.abs(diffDate(this.started, w.finished)) < min5)
          || w.includes(this)
          || this.includes(w);
    }

    public merge(w: Worklog): Worklog {
        return new Worklog({
            started: w.started.getTime() < this.started.getTime() ? w.started : this.started,
            finished: w.finished.getTime() > this.finished.getTime() ? w.finished : this.finished,
        });
    }

    public toString() {
        return `${this.started} --- ${this.finished}`;
    }
}
