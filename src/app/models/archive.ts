import {formatDate} from "@app/common/routines";
import {ITask, Task} from "@app/models/task";

export interface IArchive {
    tasks: ITask[];
    createdDay: string;
}

export class Archive implements IArchive {
    public tasks: Task[];
    public createdDay: string;

    constructor({tasks, createdDay}: IArchive) {
        this.tasks = tasks.map((t) => new Task(t));
        this.createdDay = createdDay || formatDate(new Date());
    }
}
