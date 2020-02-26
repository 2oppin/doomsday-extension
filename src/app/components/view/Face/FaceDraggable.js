import React, { Component } from "react";
import Face from '@app/components/view/Face/index';
import { Dispatcher } from '@app/services/dispatcher';

class FaceDraggable extends Component {
  constructor(props) {
    super(props);

    this.state = {
      mood: 'bad',
      r: 15, y: 5, x: 0,
      ...props
    };
  }

  static getDerivedStateFromProps(props, state) {
    if (state.mood !== props.mood)
      return {mood: props.mood};
    return null;
  }

  startDragFace(event) {
    const mdEvent = event.nativeEvent;
    const dragFnc = (e) => this.setState(() => {

      return ({
          x: e.clientX - mdEvent.offsetX,
          y: e.clientY - mdEvent.offsetY,
      });
    });
    mdEvent.target.addEventListener('mousemove', dragFnc);
    document.addEventListener('mouseup', () =>  mdEvent.target.removeEventListener('mousemove', dragFnc, false), {once: true});
    document.addEventListener('mouseleave', () =>  mdEvent.target.removeEventListener('mousemove', dragFnc, false), {once: true});
  }

  render() {
    const {onDoubleClick} = this.props;
    const {mood, r, x, y} = this.state;

    return (
      <div
        className="doom-face-asdf"
        onMouseDown={(e) => this.startDragFace(e.persist() || e)}
        onDoubleClick={() => onDoubleClick()}
        style={{
          position: 'fixed',
          top: `${y}px`,
          right: !x && r ? `${r}px` : 'auto',
          left: x ? `${x}px` : 'auto',
        }}
      ><Face mood={mood} /></div>
    );
  }
}
export default FaceDraggable;
