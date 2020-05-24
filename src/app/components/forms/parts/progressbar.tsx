import {IHelpable} from "@app/components/help/Help";
import {Task} from "@app/models/task";
import React, {ReactNode, useEffect, useState} from "react";
import "./progressbar.css";

interface IProgressBar extends IHelpable {
    task: Task;
    caption: ReactNode;
}

export default function ProgressBar({task, caption, dataHelp}: IProgressBar) {
    const progress = task.progress;
    const failed = task.estimate < task.done;
    const formatInterval = (left: number) => {
        const alert = Math.abs(left);
        const h = (left / 3600000) | 0;
        const ah = Math.abs(h);
        const m = ((alert - ah * 3600000) / 60000) | 0;
        const s = ((alert - ah * 3600000 - m * 60000) / 1000) | 0;

        const f = (v: any) => ("" + v).padStart(2, "0");
        return `${f(h)}:${f(m)}:${f(s)}`;
    };
    const [counter, setCounter] = useState(formatInterval(task.estimate - task.done));

    useEffect(() => {
        const interval = setInterval(() =>
                setCounter(formatInterval(task.estimate - task.done)),
            1000,
        );

        return () => clearInterval(interval);
    });

    return (
        <span
            className="prg"
            title={task.name}
            {...(dataHelp ? {"data-help": dataHelp} : {})}
        >
      <span className="countdown">
        <span className={`countdown-clock${failed ? " failed" : ""}`}>{counter}</span>
          {failed ? (<span className="deadline-clock">{((task.estimate / 3600000) | 0)}h - failed</span>) : null}
      </span>
            {caption}
            <div className={`prg-bar${progress < 0 ? " inv" : ""}`}>
        <div className="prg-val" style={{width: `${Math.abs(progress)}%`}}/>
      </div>
    </span>
    );
}
