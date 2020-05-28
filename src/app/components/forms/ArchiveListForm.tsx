import {DoomPluginEvent} from "@app/common/chromeEvents";

import {Form} from "@app/components/forms/Form";
import _bt from "@app/components/forms/parts/button";
import {Archive} from "@app/models/archive";
import {Dispatcher} from "@app/services/dispatcher";
import React, {Component} from "react";

import "./archive-list.css";

interface IArchiveListProps {
    archives: Archive[];
}

interface IArchiveListSate {
    archives: Archive[];
    caption: string;
}

export class ArchiveListForm extends Component<IArchiveListProps, IArchiveListSate> {
    public static getDerivedStateFromProps({archives}: IArchiveListProps) {
        return {archives};
    }

    constructor(props: IArchiveListProps) {
        super(props);
        this.state = {
            caption: "List of Archives:",
            archives: this.props.archives || [],
        };
    }

    public render() {
        const {archives, caption} = this.state;

        return (
            <Form caption={caption}>
                <div>
                    <div className="dd-popup-form-tasklist">
                        <div className="tasklist">
                            {archives.map((arch, i) => (
                                <div key={i} className={"task-item item archive-item"}>
                                    <span
                                        className="dd-popup-form-task-btn dd-brd r-btn"
                                        onClick={() => this.showArchive(arch)}
                                    >{`\ud83d\udc41`}</span>
                                    <span>{arch.createdDay}</span>
                                    <span> - {arch.tasks.length} Tasks</span>
                                    <span
                                        className="dd-popup-form-task-btn dd-brd r-btn"
                                        onClick={() => this.unpackArchive(arch.createdDay)}
                                    >
                                        {`\ud83d\udce4`}
                                    </span>
                                    <_bt u="♻" title="Remove Archive for good"
                                         cb={() => this.deleteArchive(arch.createdDay)}/>
                                </div>
                            ))}
                        </div>
                    </div>
                    <span
                        className="dd-popup-form-task-btn dd-brd dd-add-task dd-big-btn r-bt"
                        onClick={() => this.showTaskList()}
                    >
                        Back
                    </span>
                </div>
            </Form>
        );
    }

    private showTaskList() {
        Dispatcher.dispatch(DoomPluginEvent.showForm, {name: "TaskList"});
    }

    private showArchive(arch: Archive) {
        Dispatcher.dispatch(DoomPluginEvent.showForm, {
            name: "TaskList",
            data: {tasks: arch.tasks, previousForm: "ArchiveList", readonly: true},
        });
    }

    private deleteArchive(id: string) {
        Dispatcher.call(DoomPluginEvent.deleteArchive, {id});
    }

    private unpackArchive(id: string) {
        Dispatcher.call(DoomPluginEvent.unpackArchive, {id});
    }
}
