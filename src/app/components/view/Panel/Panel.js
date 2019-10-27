import React, { Component } from "react";
import Face from '../Face';
import Form from '../Form';
import './Panel.css';
import { Dispatcher } from "@app/services/dispatcher";

class Panel extends Component {
  constructor(props) {
    super(props);
    const url = chrome.extension.getURL("images/bgt2xo.png");
    this.state = {
      url,
      face: null,//{r: 15, y: 5, x: 0},
      ...Panel.getDerivedStateFromProps(props)
    };
  }

  static getDerivedStateFromProps(props, prevState) {
    console.log('PANEL:', props.tasks);
    return {
      tasks: props.tasks,
      face: props.face ? {r: 15, y: 5, x: 0, ...props.face} : null,
    };
  }

  toggleFormDisplaying() {
    const {overflow} = this.props;

    if (overflow)
      Dispatcher.dispatch('closeForm');
    else
      Dispatcher.dispatch('showForm', {name: 'TaskList'});
  }

  renderFace() {
    const {face} = this.state;

    if (!face) return null;

    return (
      <div
        className="doom-face-asdf"
        onMouseDown={(e) => this.startDragFace(e.persist() || e)}
        onDoubleClick={() => this.toggleFormDisplaying()}
        style={{
          position: 'fixed',
          top: `${face.y}px`,          
          right: face.r ? `${face.r}px` : 'auto',
          left: face.x ? `${face.x}px` : 'auto',
        }}
      ><Face mode={face.mode} /></div>
    );
  }

  startDragFace(event) {
    const mdEvent = event.nativeEvent;
    const dragFnc = (e) => this.setState({
        face: {
          x: e.clientX - mdEvent.offsetX,
          y: e.clientY - mdEvent.offsetY,
        }
      });

    this.handleFaceDrag = mdEvent.target.addEventListener('mousemove', dragFnc);
    document.addEventListener('mouseup', () =>  mdEvent.target.removeEventListener('mousemove', dragFnc, false), {once: true});
    mdEvent.target.addEventListener('mouseleave', () =>  mdEvent.target.removeEventListener('mousemove', dragFnc, false), {once: true});
  }
 
  renderForm({name, data}) {
    return (
      <Form name={name} data={data} />
    );
  }

  render() {
    const {overflow, form} = this.props;
    const {url, tasks, face} = this.state;
    form && form.data && (form.data.tasks = tasks);
console.log('panel render:', form);
    return (
      <div  style={
        overflow 
        ? {
            width: '100vw',
            height: '100vh',
            backgroundColor: 'rgba(50,0,0,0.8)',
//            backgroundImage: `url(${url})`
          }
        : {
          backgroundImage: 'none',
          width: 'auto',
          height: 'auto'
        }
        } className={`dd-popup`}>
        ${this.renderFace(face)}
        ${form ? this.renderForm(form) : null}
      </div>
    );
  }
}
export default Panel;
