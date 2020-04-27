import React, {Component} from "react";

import "./help.css";

interface IHelpState {
    showTutorial: boolean;
    helpNames: string[];
    activeHelpName: string|null;
}

export class Help extends Component<{}, IHelpState> {
    constructor(props: any) {
        super(props);
        this.state = {
            showTutorial: false,
            activeHelpName: null,
            helpNames: [],
        };
    }

    public componentDidMount(): void {
        const helpItems: HTMLElement[] = Array.prototype.slice.call(document.querySelectorAll("[data-help]"));
        const helpNames = helpItems.map((el) => el.dataset.help);
        this.setState({helpNames, activeHelpName: helpNames[0] || null});
    }

    public render() {
        const {showTutorial, activeHelpName, helpNames} = this.state;

        let left;
        let top;
        let el: HTMLElement;
        let elCopy: HTMLElement;
        document.querySelectorAll(".virt-help-target-copy").forEach((vel) => vel.remove());
        if (showTutorial && activeHelpName) {
            el = document.querySelector(`[data-help="${activeHelpName}"]`);
            const {x, y, width, height} = el.getBoundingClientRect();
            left = `${x}px`;
            top = `${y + height}px`;
            elCopy = el.cloneNode(true) as HTMLElement;
            elCopy.classList.add("virt-help-target-copy");
            elCopy.style.left = `${x}px`;
            elCopy.style.top = `${y}px`;
            elCopy.style.zIndex = "10020";
            elCopy.style.position = "fixed";
            el.parentElement.append(elCopy);
        }
        return (
            <div className={"help-container"}>
                <span className={"dd-popup-form-task-btn dd-brd r-btn"} onClick={() => this.showTutorial()}>{`\ud83d\udcd6`}</span>
                <span className={"dd-popup-form-task-btn dd-brd r-btn"}>?</span>
                {helpNames.map((name, i) => <li>{name}</li>)}
                {showTutorial && (
                    <div className={"overflow"}>
                        <div className={"tooltip"} style={{top, left}}>
                            Here goes tooltip
                            <button>Next</button><button onClick={() => this.setState({showTutorial: false})}>Close</button>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    protected showTutorial() {
        this.setState({showTutorial: true});
    }
}
