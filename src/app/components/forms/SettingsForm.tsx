import React, {Component} from "react";

import {HelpInfo, Help} from "@app/components/help/Help";

import {Form} from "./Form";

import { IConfigOptions } from "@app/globals";
import { i18n } from "../i18n/i18n";

import "./settings-form.css"

interface ISettingsFormProps {
    config: IConfigOptions;
}

interface ISettingsFormSate {
    config: IConfigOptions;
}

export class SettingsForm extends Component<ISettingsFormProps, ISettingsFormSate> {
public static getDerivedStateFromProps(props: ISettingsFormProps) {
        return { config: props.config };
    }

    private helpRef = React.createRef<Help>();

    constructor(props: ISettingsFormProps) {
        super(props);
        this.state = {
            ...this.state,
            ...SettingsForm.getDerivedStateFromProps(props),
        };
    }

    public render() {
        const {facePosition} = this.props.config;

        return (
            <Form caption={i18n("settings-title")}>
              <div className="dd-popup-form-list" data-help={HelpInfo.Settings}>
                <div className="list">
                  <div className="setting item">
                    <div className="dd-control">
                      <label htmlFor="dd-online">{i18n("settings-online-cb")}</label>
                      <input name="dd-online" type="checkbox" />
                    </div>
                    <span className="delimiter-top">{i18n("settings-online-desc")}</span>
                  </div>
                  <div className="setting item">
                    <div className="dd-control">
                      <label htmlFor="dd-show-personal">{i18n("settings-show-personal-info-cb")}</label>
                      <input name="dd-show-personal" type="checkbox" />
                    </div>
                    <span className="delimiter-top">{i18n("settings-show-personal-info-desc")}</span>
                  </div>
                  <div className="setting item">
                    <div className="dd-control">
                      <label htmlFor="dd-show-help">{i18n("settings-show-help-cb")}</label>
                      <input name="dd-show-help" type="checkbox" />
                    </div>
                    <span className="delimiter-top">{i18n("settings-show-help-desc")}</span>
                  </div>
                </div>
              </div>
              <Help ref={this.helpRef}/>
            </Form>
        );
    }
}
