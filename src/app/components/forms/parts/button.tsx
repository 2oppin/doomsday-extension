import {IHelpable} from "@app/components/help/Help";
import React, {MouseEventHandler} from "react";

import "./button.css";

interface IButtonProps extends IHelpable {
    u?: string;
    cb: MouseEventHandler;
    title?: string;
    yellow?: boolean;
    readonly?: boolean;
}

export default function Button({u, cb, title, yellow, readonly, dataHelp}: IButtonProps) {

    return (
        <span
            role="button"
            className={`dd-popup-form-task-btn dd-brd${yellow ? " yellow-btn" : ""}${readonly ? " readonly" : ""}`}
            onClick={readonly ? null : cb}
            title={title}
            {...(dataHelp ? {"data-help": dataHelp} : {})}
        >
      {u}
    </span>
    );
}
