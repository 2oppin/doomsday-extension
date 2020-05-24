import React, {Component} from "react";

import "./priority.css";

export enum PriorityLevel {None = "None", Low = "Low", AboveAverage = "Above Average", High = "High", Highest = "Highest!"}

interface IPriorityProps {
    lvl: number;
}

interface IPriorityState {
    lvl: PriorityLevel;
}

export default class Priority extends Component<IPriorityProps, IPriorityState> {
    public static lvlFromNumber = (lvl: number) => {
        if (!lvl) return PriorityLevel.None;
        else if (lvl >= 10) return PriorityLevel.Highest;
        else if (lvl >= 8) return PriorityLevel.High;
        else if (lvl >= 6) return PriorityLevel.AboveAverage;
        return PriorityLevel.Low;
    }

    public static getDerivedStateFromProps({lvl}: IPriorityProps) {
        return {
            lvl: Priority.lvlFromNumber(lvl),
        };
    }

    private url = chrome.extension.getURL("images/priority.png");

    constructor(props: IPriorityProps) {
        super(props);
        this.state = Priority.getDerivedStateFromProps(props);
    }

    public render() {
        const {lvl} = this.state;

        let priorityClass = " none";
        if (lvl === PriorityLevel.Highest) priorityClass = " highest";
        else if (lvl === PriorityLevel.High) priorityClass = " high";
        else if (lvl === PriorityLevel.AboveAverage) priorityClass = " aaverage";
        else if (lvl === PriorityLevel.Low) priorityClass = " low";

        return (
            <div className={`dd-popup-form-task-priority${priorityClass}`}>
                {lvl === PriorityLevel.Low && <span className={"number"}>{this.props.lvl}</span>}
                <span
                    role="button"
                    className="picture"
                    title={lvl}
                    style={{backgroundImage: `url(${this.url})`}}
                />
            </div>
        );
    }
}
