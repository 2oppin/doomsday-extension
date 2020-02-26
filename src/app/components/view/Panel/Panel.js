import React, { Component } from "react";
import './Panel.css';

class Panel extends Component {
  constructor(props) {
    super(props);
    const url = chrome.extension.getURL("images/bgt2xo.png");
    this.state = {
      url,
      face: props.face ? {r: 15, y: 5, x: 0, ...props.face} : null,
      tasks: props.tasks,
    };
  }

  componentDidMount() {
    document.addEventListener('keydown', this.onKeyDown.bind(this));
  }

  componentWillUnmount() {
    document.removeEventListener('keydown', this.onKeyDown);
  }

  onKeyDown(e) {
    const {onEscClick} = this.props;

    switch (e.key) {
      case 'Escape':
        onEscClick();
        e.preventDefault();
        return false;
    }
  }

  render() {
    const {overflow, children} = this.props;
    const {url} = this.state;

    return (
      <div  style={
        overflow
        ? {
            width: '100vw',
            height: '100vh',
            // backgroundColor: 'rgba(50, 0 , 0, 0.8)',
            backgroundImage: `url(${url})`
          }
        : {
          backgroundImage: 'none',
          width: 'auto',
          height: 'auto'
        }
        } className={`dd-popup`}>
        {children}
      </div>
    );
  }
}
export default Panel;
