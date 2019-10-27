import React from "react";
import ReactDOM from "react-dom";
import Face from './app/components/view/Face';
import {DOOM_OWERFLOW_APP_ID} from './app/globals';
import './popup.css';

const defaultConfig = {
  tasks:[],
  showFace: false,
};
class Popup extends React.Component {
  constructor(params) {
    super(params);
    this.state = { config: defaultConfig };
    this.loadTasks();
  }

  loadTasks() {
    chrome.storage.sync.get(['tasks'], ({tasks}) => {
      this.setState(prev => ({
        config: {
          ...prev.config,
          tasks
        }}), () => this.runDoomCmd('configUpdated', { tasks, showFace: this.state.config.showFace }));
    });
  }

  checkFace() {
    this.setState(prev => ({
      config: {
        ...prev.config,
        showFace: !prev.config.showFace
      }}), () => this.runDoomCmd('configUpdated', this.state.config));
  }

  runDoomCmd(cmd, data) {
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
          <span>
            <label for="face-checker">Show face on all pages: </label>
            <input id="face-checker" type="checkbox"
               value={config.showFace}
               onClick={() => this.checkFace()}
            />
          </span>
        </div>
      </div>
    );
  };
}

const wrapper = document.getElementById("app");
wrapper ? ReactDOM.render(<Popup />, wrapper) : false;
