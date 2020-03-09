import React, {Component, ReactNode} from "react";

import { Dispatcher } from "@app/services/dispatcher";

import "./Form.css";

interface IFormProps {
  children: ReactNode;
  caption: string;
}

export class Form extends Component<IFormProps, {}> {
  private url = chrome.extension.getURL("images/bgt2xo.png");

  public render() {
    const {children, caption} = this.props;
    const {url} = this;

    return (
      <div className="dd-popup-form" style={{
        borderImage: `url(${url}) 33 round`,
      }}>
        <h3 className="dd-form-caption" style={{backgroundImage: `url(${url})`}}>{caption}</h3>
        <div className="dd-popup-close" onClick={this.closeForm}>&times;</div>
        <div className="dd-popup-form-contents">
            {children}
        </div>
      </div>
    );
  }

  private closeForm() {
    Dispatcher.dispatch("closeForm");
  }
}
