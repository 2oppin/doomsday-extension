import React, {Component, MouseEventHandler} from "react";

import {HelpInfo, Help} from "@app/components/help/Help";
import {Dispatcher} from "@app/services/dispatcher";

import {Form} from "./Form";

import { IConfigOptions } from "@app/globals";
import { i18n } from "../i18n/i18n";

import "./settings-form.css"
import { WebRTC } from "@app/services/web-rtc-io";
import { DoomPluginEvent } from "@app/common/chromeEvents";

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

  async createOffer(e: any) {
    console.log('ok - run');
    const offerStr = await WebRTC().createOffer();
    Dispatcher.dispatch(DoomPluginEvent.showModal, {caption: "Oook", contents: (<>
      <span style={{maxWidth: '500px', overflowWrap: 'break-word'}}>
        <p>{offerStr}</p>
        <button onClick={() => navigator.clipboard.writeText(offerStr)}>📋</button>
      </span>
      <span style={{maxWidth: '500px', overflowWrap: 'break-word'}}>
      {i18n('settings-webrtc-p2p-accept-answer')}:
      <textarea id="dd-webrtc-answer-accept"></textarea>
      <button onClick={() => WebRTC().acceptAnswer(
        (document.getElementById('dd-webrtc-answer-accept') as HTMLTextAreaElement).value
      )}>🚀</button>
    </span>
    </>)});
  }

  acceptOffer(e: any) {
    Dispatcher.dispatch(DoomPluginEvent.showModal, {
      caption: "Oook", 
      contents: (<div>
        <textarea id="dd-webrtc-offer-accept" name="offer"></textarea>
        <button onClick={async () => {
          const answer = await WebRTC().acceptOffer(
            (document.getElementById('dd-webrtc-offer-accept') as HTMLTextAreaElement).value
          );
          const el = document.getElementById('dd-settings-webrtc-created-answer');
          el.innerHTML = answer;
          el.parentElement.style.display='inline';
        }}>Ok</button>
        <span style={{maxWidth: '500px', overflowWrap: 'break-word', display: 'none'}}>
          <p id="dd-settings-webrtc-created-answer"></p>
          <button onClick={() => navigator.clipboard.writeText(document.getElementById('dd-settings-webrtc-created-answer').innerHTML)}>📋</button>
        </span>
      </div>)});
  }

  sendMessage() {
    WebRTC().sendMessage('Have you read it at last? :`(');
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
                    <button onClick={this.createOffer} data-help={HelpInfo.SettingsCreateOffer}>{i18n("settings-create-offer")}</button>
                    <button onClick={this.acceptOffer} data-help={HelpInfo.SettingsAcceptOffer}>{i18n("settings-accept-offer")}</button>
                    <button onClick={this.sendMessage} >SEND</button>
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
