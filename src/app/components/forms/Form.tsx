import {DoomPluginEvent} from "@app/common/chromeEvents";

import {Dispatcher} from "@app/services/dispatcher";
import React, {Component, ReactNode} from "react";

import "./Form.css";

interface IFormProps {
    children: ReactNode;
    caption: string;
    regular?: boolean;
}

export class Form extends Component<IFormProps, {}> {
    private url = chrome.extension.getURL("images/bgt2xo.png");

    public render() {
        const {children, caption, regular = true} = this.props;
        const {url} = this;

        return (
            <div className={`dd-popup-form${regular ? '' : ' dd-form-modal'}`} style={{
                borderImage: `url(${url}) 33 round`,
            }}
                 onClick={(e) => {
                     e.stopPropagation();
                     return false;
                 }}
            >
                <h3 className="dd-form-caption" style={{backgroundImage: `url(${url})`}}
                    data-help={"help-form-caption"}>{caption}</h3>
                <div className="dd-popup-close" onClick={() => this.closeForm()} data-help={"help-form-close"}>&times;</div>
                <div className="dd-popup-form-contents">
                    {children}
                </div>
            </div>
        );
    }

    private closeForm() {
      const {regular} = this.props;
      Dispatcher.dispatch(
        regular
          ? DoomPluginEvent.closeForm
          : DoomPluginEvent.closeModal
      );
    }
}
