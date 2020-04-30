import React, {MouseEventHandler} from "react";

import "./button.css";

interface IButtonProps {
    u?: string;
    cb: MouseEventHandler;
    title?: string;
    yellow?: boolean;
    readonly?: boolean;
}
export default function Button({u, cb, title, yellow, readonly}: IButtonProps) {

  return (
    <span
      role="button"
      className={`dd-popup-form-task-btn dd-brd${yellow ? " yellow-btn" : ""}${readonly ? " readonly" : ""}`}
      onClick={readonly ? null : cb}
      title={title}
    >
      {u}
    </span>
  );
}
