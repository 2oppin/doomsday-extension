import React, {Component, ReactNode} from "react";
import "./Panel.css";

interface IPanelProps {
  onEscClick: (e: KeyboardEvent) => void;
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
      <div  style={
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
        } className={`dd-popup`}>
        {children}
      </div>
    );
  }

  private onKeyDown(e: KeyboardEvent) {
    const {onEscClick} = this.props;

    switch (e.key) {
      case "Escape":
        onEscClick(e);
        e.preventDefault();
        return false;
    }
  }
}
