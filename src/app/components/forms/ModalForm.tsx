import React, {Component, ReactElement} from "react";

import {Form} from "./Form";
import { i18n } from "../i18n/i18n";

interface ITaskListFormState {
}

export default class ModalForm extends Component<{contents: ReactElement, caption: string}, ITaskListFormState> {
    public render() {
      const {contents, caption} = this.props;
        return (
            <Form caption={caption || "List of Tasks:"} regular={false} >
                <div>
                    <div className="dd-popup-form-list">
                        <div className="list">
                            {contents || (<span>{i18n("easter-egg-month-of-lazy-butts")}</span>)}
                        </div>
                    </div>
                </div>
            </Form>
        );
    }
}
