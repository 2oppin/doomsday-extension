import React, { Component } from "react";
import './Face.css';

class Face extends Component {
  constructor(props) {
    super(props);
    const url = chrome.extension.getURL("images/faceo_.png");
    this.state = {url};
  }

  render() {
    let {mood} = this.props;
    const {health, noAnimate = false, width = 73} = this.props;
    const {url} = this.state;

    if (!mood) {
      mood = 'ok';
      if (health >= 100) mood = 'god';
      else if (health === 0) mood = 'dead';
      else if (health <= 10) mood = 'worst';
      else if (health <= 30) mood = 'worse';
      else if (health <= 50) mood = 'bad';
      else if (health <= 80) mood = 'norm';
    }

    const style = {
      backgroundImage: `url(${url})`,
    };
    if (width !== 73) style.transform = `scale(${width / 73})`;

    return (
      <div style={style} className={`dd-face ${mood || 'bad'} ${noAnimate ? 'static' : ''}`}>
      </div>
    );
  }
}
export default Face;
