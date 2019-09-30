import React from "react";
import ReactDOM from "react-dom";
import Face from './app/components/view/Face';
import {DOOM_OWERFLOW_APP_ID} from './app/globals';
import './popup.css';

class Popup extends React.Component {
  constructor(params) {
    super(params);

    this.state = {config: {tasks:[]}};
    chrome.storage.sync.get(['tasks'], ({tasks}) => {
      this.setState({config:{tasks}});
      this.runDoomCmd('configUpdated', {tasks});
    });
  }
  runDoomCmd(cmd, data) {
    console.log('DOOM called...', cmd, data);
    chrome.tabs.query(
      {
        active: true,
        lastFocusedWindow: true
      },
      (tabs) =>
        tabs.map(tab =>
          chrome.tabs.executeScript(
            tab.id,
            {code: `document.getElementById('${DOOM_OWERFLOW_APP_ID}').dispatchEvent(new CustomEvent('doom', {detail:{action: '${cmd}', data: ${JSON.stringify(data)}}}));`}
          )
        )
    )
  }
  render() {
    const {config} = this.state;

    return (
      <div className='dd-popup'>
        <div onClick={() => this.runDoomCmd('showForm', {name: 'TasksList', data: {tasks: config.tasks}})}>
          <Face />
        </div>
      </div>
    );
  };
}

const wrapper = document.getElementById("app");
wrapper ? ReactDOM.render(<Popup />, wrapper) : false;
