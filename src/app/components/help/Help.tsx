import {DoomPluginEvent} from "@app/common/chromeEvents";
import {UUID} from "@app/common/routines";
import {HelpDict, HelpInfo} from "@app/components/help/dictionary";
import {IConfig} from "@app/globals";
import {Dispatcher} from "@app/services/dispatcher";
import React, {Component, RefObject} from "react";

import "./help.css";

interface IHelpState {
    showTutorial: boolean;
    helpNames: HelpInfo[];
    readHelp: HelpInfo[];
    activeHelpName: HelpInfo|null;
    right: boolean;
    bottom: boolean;
}

export class Help extends Component<{}, IHelpState> {
    protected virtId = `dd-help-target-copy-${UUID()}`;
    protected tooltipRef: RefObject<HTMLDivElement> = React.createRef<HTMLDivElement>();

    constructor(props: any) {
        super(props);
        this.state = {
            showTutorial: false,
            activeHelpName: null,
            helpNames: [],
            readHelp: [],
            right: false,
            bottom: false,
        };
    }

    public componentDidMount(): void {
        const helpNames = this.scanContentsOnHelpNames();
        Dispatcher.subscribe(DoomPluginEvent.configUpdated, (this.onConfigUpdate.bind(this)));
        this.setState({helpNames, activeHelpName: helpNames[0] || null}, () =>
            Dispatcher.call(DoomPluginEvent.refresh),
        );
    }

    public componentWillUnmount() {
        Dispatcher.unsubscribe(DoomPluginEvent.configUpdated, (this.onConfigUpdate.bind(this)));
    }

    public componentDidUpdate(prevProps: Readonly<{}>, prevState: Readonly<IHelpState>): void {
        if (!this.state.showTutorial) return;

        let {right, bottom} = this.state;
        const el = document.getElementById(this.virtId);
        if (!el) return;
        const elBox = el.getBoundingClientRect();
        const tooltip = this.tooltipRef.current;
        const ttbox = tooltip.getBoundingClientRect();
        const offset: {x: number, y: number} = {
            x: elBox.x - ttbox.width,
            y: elBox.y - ttbox.height,
        };
        if (!right) {
            right = offset.x < 0;
        } else {
            offset.x = elBox.x;
            right = elBox.x < ttbox.width;
        }
        if (!bottom) {
            bottom = offset.y < 0;
        } else {
            offset.y = elBox.y + elBox.height;
            bottom = elBox.y < ttbox.height;
        }
        tooltip.style.left = `${offset.x}px`;
        tooltip.style.top = `${offset.y}px`;
        if (this.state.right !== right || this.state.bottom !== bottom) {
            this.setState({right, bottom});
        }
    }

    public render() {
        const {showTutorial, helpNames, activeHelpName} = this.state;

        return (
            <div className={"help-container"}>
                {helpNames.length > 0 && (
                    <span className={"dd-popup-form-task-btn dd-brd"} onClick={() => this.showTutorial()}>
                        {`\ud83d\udcd6`}<span>Tutorial</span>
                    </span>
                )}
                {showTutorial && (<>
                    <div className={"overflow"} onClick={() => this.closeTutorial()} />
                    <div ref={this.tooltipRef} className={"tooltip"}>
                        {HelpDict[activeHelpName].text}
                        <div className={"buttonset"}>
                            <button onClick={() => this.nextClick()}>Next</button>
                            <button onClick={() => this.closeTutorial()}>Close</button>
                        </div>
                    </div>
                </>)}
            </div>
        );
    }

    protected scanContentsOnHelpNames(): HelpInfo[] {
        const helpItems: HTMLElement[] = Array.prototype.slice.call(document.querySelectorAll("[data-help]"));
        return helpItems.reduce((a, el) => [...a, el.dataset.help as HelpInfo], []);
    }

    protected onConfigUpdate(config: IConfig) {
        const {options} = config;
        if (!options) return;

        const {readHelp = []} = options;
        const helpNames = this.scanContentsOnHelpNames().filter((nm) => !readHelp.includes(nm));
        this.setState({
            readHelp,
            helpNames,
            activeHelpName: helpNames[0],
        });
    }

    protected showTutorial() {
        const {activeHelpName} = this.state;
        const el = document.querySelector(`[data-help="${activeHelpName}"]`);
        const {x, y} = el.getBoundingClientRect();
        const elCopy = el.cloneNode(true) as HTMLElement;
        elCopy.id = this.virtId;
        elCopy.style.left = `${x}px`;
        elCopy.style.top = `${y}px`;
        elCopy.style.zIndex = "10020";
        elCopy.style.position = "fixed";
        el.parentElement.append(elCopy);

        this.setState({showTutorial: true});
    }

    protected nextClick() {
        this.closeTutorial();
        // @todo: Dispatcher.add("Viewed help", activeHelpName) / filter current

        this.setState(({activeHelpName, helpNames, readHelp}) => {
            const newHelpNames = helpNames.filter((nm) => nm !== activeHelpName);
            return {
                helpNames: newHelpNames,
                activeHelpName: newHelpNames[0] || null,
                readHelp: [...readHelp, activeHelpName],
            };
        }, () => {
            const {readHelp} = this.state;
            Dispatcher.call(DoomPluginEvent.setOptions, {readHelp});
            if (this.state.helpNames.length) this.showTutorial();
        });
    }

    protected closeTutorial() {
        document.getElementById(this.virtId).remove();
        this.setState({showTutorial: false});
    }
}
