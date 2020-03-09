import React, {Component, ReactElement} from "react";
import "./Face.css";

export enum FaceMood {
  DEAD = "dead",
  WORST = "worst",
  WORSE = "worse",
  BAD = "bad",
  NORM = "norm",
  OK = "ok",
  GOD = "god",
}

interface IFaceProps {
  width?: number;
  health?: number;
  mood?: FaceMood;
  noAnimate?: boolean;
}

export class Face extends Component<IFaceProps, {}> {
  private url = chrome.extension.getURL("images/faceo_.png");

  public render() {
    let {mood = null} = this.props;
    const {health, noAnimate = false, width = 73} = this.props;
    const {url} = this;

    if (!mood) {
      mood = FaceMood.OK;
      if (health >= 100) mood = FaceMood.GOD;
      else if (health === 0) mood = FaceMood.DEAD;
      else if (health <= 10) mood = FaceMood.WORST;
      else if (health <= 30) mood = FaceMood.WORSE;
      else if (health <= 50) mood = FaceMood.BAD;
      else if (health <= 80) mood = FaceMood.NORM;
    }

    const style: any = {
      backgroundImage: `url(${url})`,
    };
    if (width !== 73) style.transform = `scale(${width / 73})`;

    return (
      <div
          style={style}
          className={`dd-face ${mood || FaceMood.BAD} ${noAnimate ? "static" : ""}`}
      >
      </div>
    );
  }
}
export default Face;
