import {DoomPluginEvent} from "@app/common/chromeEvents";

import {Dispatcher} from "@app/services/dispatcher";
import React, {Component, ReactNode} from "react";

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
      }}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          return false;
        }}
      >
        <h3 className="dd-form-caption" style={{backgroundImage: `url(${url})`}} data-help={"help-form-caption"}>{caption}</h3>
        <div className="dd-popup-close" onClick={this.closeForm} data-help={"help-form-close"}>&times;</div>
        <div className="dd-popup-form-contents">
            {children}
        </div>
      </div>
    );
  }

  private closeForm() {
    Dispatcher.dispatch(DoomPluginEvent.closeForm);
  }
}
