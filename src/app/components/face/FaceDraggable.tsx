import {DoomPluginEvent} from "@app/common/chromeEvents";
import {Face} from "@app/components/face/Face";
import {FaceMood} from "@app/models/task";
import {Dispatcher} from "@app/services/dispatcher";
import React, {Component, SyntheticEvent} from "react";

interface IFaceDraggableProps {
  mood: FaceMood;
  r?: number;
  y?: number;
  onDoubleClick?: (e?: SyntheticEvent) => void;
}
interface IFaceDraggableState extends IFaceDraggableProps {
  dragged: boolean;
}
export class FaceDraggable extends Component<IFaceDraggableProps, IFaceDraggableState> {
  public static getDerivedStateFromProps(props: IFaceDraggableProps, state: IFaceDraggableState) {
    return state.dragged ? null : props;
  }

  constructor(props: any) {
    super(props);
    this.state = {
      mood: "bad",
      r: 15, y: 5,
      ...props,
      dragged: false,
    };
  }

  public startDragFace(event: SyntheticEvent<Element, MouseEvent>) {
    const mdEvent: MouseEvent = event.nativeEvent;
    const dragFnc = (e: MouseEvent) => this.setState(() => {
      return ({
        r: document.body.clientWidth - e.clientX - mdEvent.offsetX,
        y: e.clientY - mdEvent.offsetY,
      });
    });
    document.addEventListener("mousemove", dragFnc);
    document.addEventListener("mouseup", () => {
      document.removeEventListener("mousemove", dragFnc, false);
      this.setState({dragged: false});
    }, {once: true});
    this.setState({dragged: true});
  }

  public render() {
    const {onDoubleClick} = this.props;
    const {mood, r, y} = this.state;

    return (
      <div
        className="doom-face-on-top"
        onMouseDown={(e) => this.startDragFace(e)}
        onMouseUp={(e) => {
          Dispatcher.call(DoomPluginEvent.setOptions, {
            facePosition: {
              y: this.state.y,
              r: this.state.r,
            }});
        }}
        onClick={(e) => {
          e.stopPropagation();
        }}
        onDoubleClick={(e) => onDoubleClick(e)}
        style={{
          position: "fixed",
          top: `${y}px`,
          right: `${r}px`,
        }}
      ><Face mood={mood} /></div>
    );
  }
}
