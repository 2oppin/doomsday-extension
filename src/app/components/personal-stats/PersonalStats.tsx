import React from "react";

import "./PersonalStats.css";

export const PersonalStats = ({i, e, p, onClick}: {i: number, e: number, p: number, onClick: (e: any) => void}) => {
  const cPrc = (c: string, prc: number) => (parseInt(c, 16) * prc / 100 | 0).toString(16);
  const bg = (c: 'r'|'y'|'b', v: number) => (
    ([r, clr]) => `radial-gradient(circle ${r}px, ${clr}, transparent)`)(
      {
        r: [15, `#${cPrc('ff', v)}${cPrc('55', v)}00`],
        b: [70, `#00${cPrc('55', v)}${cPrc('ff', v)}`],
        y: [40, `#${cPrc('ff', v)}${cPrc('bb', v)}00`],
      }[c]
    );

  return (
    <div className="personal-stats" onClick={onClick}>
      <div className="numbers">
        <div><label>int:</label><span>{i}%</span></div>
        <div><label>emo:</label><span>{e}%</span></div>
        <div><label>phy:</label><span>{p}%</span></div>
      </div>
      <div className="diagram">
        <div className="int"><div className="bg" style={{background: bg('b', i),}}></div></div>
        <div className="emo"><div className="bg" style={{background: bg('y', e),}}></div></div>
        <div className="phy"><div className="bg" style={{background: bg('r', p),}}></div></div>
      </div>
    </div>
  )
}