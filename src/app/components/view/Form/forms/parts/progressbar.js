import React from 'react';

export default function ProgressBar({u, cb, task}) {
  const progress = task.progress;
  const left = task.estimate - task.did;
  const _countDown = () => {

    el.setAttribute('class', 'countdown');
    const cnt = document.createElement('span');
    cnt.setAttribute('class', 'countdown-clock');
    el.appendChild(cnt);


    if (left < 0) {
        const cnte = document.createElement('span');
        cnte.setAttribute('class', 'deadline-clock');
        cnte.innerHTML = ;
        el.appendChild(cnte);
        cnt.classList.add('failed');
    }
    const interval = setInterval(() => {
        if (!el.isConnected) clearInterval(interval);
        const left = this.estimate - this.did, aleft = Math.abs(left);
        const h = (left/3600000)|0, ah = Math.abs(h);
        const m = ((aleft - ah*3600000)/60000)|0;
        const s = ((aleft - ah*3600000 - m*60000)/1000)|0;

        const f = (v) => (v+'').padStart(2, '0');
        let time = `${f(h)}:${f(m)}:${f(s)}`;

        cnt.innerHTML = time;
    }, 1000);

    return el;
  }  

  const failed = left < 0;
  
  return (
    <span
      className="prg"
      onClick={cb}
      title={title}
    >
      <span className="countdown">
        <span className={`countdown-clock${failed ? ' failed' : ''}`}></span>
        {failed ? (<span className='deadline-clock'>{((this.estimate / 3600000) | 0)}h - failed</span>) : null}
      </span>
      {_countDown()}
      <span className="cpt">{task.name}</span>
      <div className={`prg-bar${progress < 0 ? ' inv' : ''}`}>
        <div className="prg-val" style={{width: `${Math.abs(progress)}%`}}></div>
      </div>
    </span>
  );
}