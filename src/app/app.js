// import { Panel } from './components/Panel.js';
import { Dispatcher } from './services/dispatcher.js';
import React from "react";
import ReactDOM from "react-dom";
import { DoomPanelContainer } from './components/container/DoomPanelContainer.js';
import { DOOM_OWERFLOW_APP_ID } from './globals'

(() => {
    const el = document.getElementById(DOOM_OWERFLOW_APP_ID) || (() => {
        let app = document.createElement('div');
        app.setAttribute('id', DOOM_OWERFLOW_APP_ID);
        app.setAttribute('data-id', DOOM_OWERFLOW_APP_ID);
        document.body.appendChild(app);
        console.log('indyeed DOOM i nstalled...');
        return app;
    })();

    ReactDOM.render(<DoomPanelContainer />, el);

    // chrome.storage.sync.get(['tasks'], ({tasks}) => console.log(tasks));//this.AppPanel = new Panel({tasks}));
    el.addEventListener('doom', (e) => {
        const {action, data} = e.detail;

        console.log('DOOM2', {action, data}, e);
        Dispatcher.dispatch(action, data);
    });
    Dispatcher.call('refresh');
})();
console.log('APPP RUNNED');
