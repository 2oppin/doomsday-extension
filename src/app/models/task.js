import { UUID } from '@app/common/routines';

export default class Task {
    constructor({id, name, estimate, deadline, description, started, finished, done}) {
        this.id = id || UUID();
        this.name = name || 'New Mission';
        this.estimate = estimate || 2*3600*1000;
        this.deadline = new Date(deadline || (3600*1000*24  + (new Date()).getTime()));
        this.description = description || 'Go through the hell and back alive!';
        this.done = done || 0;
        this.created = started || (new Date()).getTime();
        this.started = started || null;
        this.finished = finished || null;
    };

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
            progress = - (100 * (1 - this.estimate / done))|0;
        } else {
            progress = (100*(done||0) / (this.estimate || 1))|0;
        }
        return progress;
    }
}
