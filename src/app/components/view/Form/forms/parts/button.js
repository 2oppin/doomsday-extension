import React from 'react';

export default function Button({u, cb, title}) {

  return (
    <span
      className="dd-popup-form-task-btn dd-brd"
      onClick={cb}
      title={title}
    >
      {`&#${u};`}
    </span>
  );
}