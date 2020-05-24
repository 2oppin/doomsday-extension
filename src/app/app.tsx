import React from "react";
import ReactDOM from "react-dom";
import {DoomPanelContainer} from "./components/container/DoomPanelContainer";
import {DOOM_OWERFLOW_APP_ID} from "./globals";

(() => {
    const oldEl = document.getElementById(DOOM_OWERFLOW_APP_ID);
    if (oldEl) oldEl.remove();

    const el = document.createElement("div");
    el.setAttribute("id", DOOM_OWERFLOW_APP_ID);
    el.setAttribute("data-id", DOOM_OWERFLOW_APP_ID);
    document.body.appendChild(el);

    ReactDOM.render(<DoomPanelContainer/>, el);
})();
