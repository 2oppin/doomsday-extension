import React, { Component } from "react";
import { Dispatcher } from "../../../services/dispatcher";

import './Form.css';

class Form extends Component {
  constructor(props) {
    super(props);
    const url = chrome.extension.getURL("images/bgt2xo.png");
    this.state = {url};
  }

  closeForm() {

    Dispatcher.dispatch('closeForm');
  }

  render() {
    const {children, caption} = this.props;
    const {url} = this.state;

    return (
      <div className="dd-popup-form" style={{
        borderImage: `url(${url}) 33 round`
      }}>
        <h3 className="dd-form-caption" style={{backgroundImage: `url(${url})`}}>{caption}</h3>
        <div className="dd-popup-close" onClick={this.closeForm}>&times;</div>
        <div className="dd-popup-form-contents">
            {children}
        </div>
      </div>
    );
  }
}

export default Form;
