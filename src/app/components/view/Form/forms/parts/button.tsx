import React, {MouseEventHandler} from "react";

interface IButtonProps {
    u?: string;
    cb: MouseEventHandler;
    title?: string;
}
export default function Button({u, cb, title}: IButtonProps) {

  return (
    <span
      role="button"
      className="dd-popup-form-task-btn dd-brd"
      onClick={cb}
      title={title}
    >
      {u}
    </span>
  );
}
