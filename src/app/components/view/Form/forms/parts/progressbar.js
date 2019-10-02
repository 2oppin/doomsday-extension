import React, { useState, useEffect } from 'react';
import './progressbar.css';

export default function ProgressBar({task}) {
  const progress = task.progress;
  const failed = task.estimate < task.did;
  const formatInterval = (left) => {
    const aleft = Math.abs(left);
    const h = (left/3600000)|0, ah = Math.abs(h);
    const m = ((aleft - ah*3600000)/60000)|0;
    const s = ((aleft - ah*3600000 - m*60000)/1000)|0;

    const f = (v) => (v+'').padStart(2, '0');
    return `${f(h)}:${f(m)}:${f(s)}`;
  };
  const [counter, setCounter] = useState(formatInterval(task.estimate - task.did));

  useEffect(() => {
    const interval = setInterval(() => 
      setCounter(formatInterval(task.estimate - task.did)),
      1000
    );

    return () => clearInterval(interval);
  })



  
  return (
    <span
      className="prg"
      title={task.name}
    >
      <span className="countdown">
        <span className={`countdown-clock${failed ? ' failed' : ''}`}>{counter}</span>
        {failed ? (<span className='deadline-clock'>{((this.estimate / 3600000) | 0)}h - failed</span>) : null}
      </span>
       <span className="cpt">{task.name}</span>
      <div className={`prg-bar${progress < 0 ? ' inv' : ''}`}>
        <div className="prg-val" style={{width: `${Math.abs(progress)}%`}}></div>
      </div>
    </span>
  );
}