import {DoomPluginEvent} from "@app/common/chromeEvents";
import React from "react";
import ReactDOM from "react-dom";
import {DoomPanelContainer} from "./components/container/DoomPanelContainer";
import {DOOM_OWERFLOW_APP_ID} from "./globals";
import {Dispatcher} from "./services/dispatcher";

(() => {
    const el = document.getElementById(DOOM_OWERFLOW_APP_ID) || (() => {
        const appContainer = document.createElement("div");
        appContainer.setAttribute("id", DOOM_OWERFLOW_APP_ID);
        appContainer.setAttribute("data-id", DOOM_OWERFLOW_APP_ID);
        document.body.appendChild(appContainer);
        return appContainer;
    })();

    ReactDOM.render(<DoomPanelContainer />, el);

    el.addEventListener("doom", (e: any) => {
        const {action, data} = e.detail;

        Dispatcher.dispatch(action, data);
    });
    Dispatcher.call(DoomPluginEvent.refresh);
})();
