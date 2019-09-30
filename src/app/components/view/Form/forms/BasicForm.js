import React, {Component} from 'react';

const bgUrl = chrome.extension.getURL("images/bgt2xo.png");

export default class BasicForm extends Component {

  renderForm() {
    throw new Error('Man, u forgot to implement "renderForm"');
  }
  render() {
    return (
      <div>
          <h3 className="dd-form-caption" style={{backgroundImage: `url(${bgUrl})`}}>{this.state.caption}</h3>
          <div className="dd-popup-form-contents">
            {this.renderForm()}
          </div>
      </div>
    )
  }
}