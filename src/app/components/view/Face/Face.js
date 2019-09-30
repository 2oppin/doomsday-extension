import React, { Component } from "react";
import './Face.css';

class Face extends Component {
  constructor(props) {
    super(props);
    const url = chrome.extension.getURL("images/faceo_.png");
    this.state = {url};
  }
 
  render() {
    const {mood} = this.props;
    const {url} = this.state;

    return (
      <div style={{
        backgroundImage: `url(${url})`
      }} className={`dd-face ${mood || 'god'}`}>
      </div>
    );
  }
}
export default Face;
