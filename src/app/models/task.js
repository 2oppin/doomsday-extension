import U from '@app/common/routines';

export default class Task {
    constructor({guid, name, estimate, deadline, description, started, finished, done}) {
        this.guid = guid || U.UUID();
        this.name = name || 'New Mission';
        this.estimate = estimate || 2*3600*1000;
        this.deadline = new Date(deadline || 3600*1000*24  + (new Date()).getTime());
        this.description = description || 'Go through the hell and back alive!';
        this.done = done || 0;
        this.started = started || null;
        this.finished = finished || null;
    };

    get did() {
        const now = (new Date()).getTime();
        return (this.done || 0) + now - (new Date(this.started || now)).getTime();
    }
  
    get progress() {
        const done = this.did;
        let progress = 0;
        if (this.done > this.estimate) {
            progress = - (100 * (1 - this.estimate / done))|0;
        } else {
            progress = (100*(done||0) / (this.estimate || 1))|0;
        }
        return progress;
    }
}