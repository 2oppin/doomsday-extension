import React, {Component, ReactNode} from "react";
import "./Panel.css";

interface IPanelProps {
    onClose: () => void;
    overflow: boolean;
    children: ReactNode;
}

export class Panel extends Component<IPanelProps, {}> {
    private url = chrome.extension.getURL("images/bgt2xo.png");

    public componentDidMount() {
        document.addEventListener("keydown", this.onKeyDown.bind(this));
    }

    public componentWillUnmount() {
        document.removeEventListener("keydown", this.onKeyDown);
    }

    public render() {
        const {overflow, children} = this.props;
        const {url} = this;

        return (
            <div style={
                overflow
                    ? {
                        width: "100vw",
                        height: "100vh",
                        backgroundImage: `url(${url})`,
                    }
                    : {
                        backgroundImage: "none",
                        width: "auto",
                        height: "auto",
                    }
            } className={`dd-popup`}
                 onClick={(e) => this.props.onClose()}
            >
                {children}
            </div>
        );
    }

    private onKeyDown(e: KeyboardEvent) {
        const {onClose} = this.props;

        switch (e.key) {
            case "Escape":
                onClose();
                e.preventDefault();
                return false;
        }
    }
}
