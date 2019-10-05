import React, { Component } from "react";
import { Dispatcher } from "../../../services/dispatcher";
import TaskListForm from "./forms/TaskListForm";

import './Form.css';
import TaskEditForm from "./forms/TaskEditForm";

class Form extends Component {
  constructor(props) {
    super(props);
    const url = chrome.extension.getURL("images/bgt2xo.png");
    this.state = {url};
  }
 
  closeForm() {
    Dispatcher.dispatch('closeForm');
  }

  renderForm() {
    const {name, data} = this.props;
    console.log('FORM', data);
    if(name === 'TaskEdit') {
        return <TaskEditForm {...data} />;
    } else
        return <TaskListForm {...data} />;
  }

  render() {
    const {url} = this.state;

    return (
      <div className="dd-popup-form" style={{
        borderImage: `url(${url}) 33 round`
      }}>
        <div className="dd-popup-close" onClick={this.closeForm}>&times;</div>
        {this.renderForm()}
      </div>
    );
  }
}

export default