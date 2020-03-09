import {FaceMood} from "@app/components/view/Face/Face";
import React, {Component, ReactEventHandler, SyntheticEvent} from "react";

import {Face} from "@app/components/view/Face/index";

interface IFaceDraggableProps {
  mood: FaceMood;
  r?: number;
  y?: number;
  x?: number;
  onDoubleClick?: (e?: SyntheticEvent) => void;
}

export class FaceDraggable extends Component<IFaceDraggableProps, IFaceDraggableProps> {
  public static getDerivedStateFromProps(props: IFaceDraggableProps, state: IFaceDraggableProps) {
    if (state.mood !== props.mood)
      return {mood: props.mood};
    return null;
  }

  constructor(props: any) {
    super(props);

    this.state = {
      mood: "bad",
      r: 15, y: 5, x: 0,
      ...props,
    };
  }

  public startDragFace(event: SyntheticEvent<Element, MouseEvent>) {
    const mdEvent: MouseEvent = event.nativeEvent;
    const dragFnc = (e: MouseEvent) => this.setState(() => {

      return ({
          x: e.clientX - mdEvent.offsetX,
          y: e.clientY - mdEvent.offsetY,
      });
    });
    mdEvent.target.addEventListener("mousemove", dragFnc);
    document.addEventListener("mouseup", () =>  mdEvent.target.removeEventListener("mousemove", dragFnc, false), {once: true});
    document.addEventListener("mouseleave", () =>  mdEvent.target.removeEventListener("mousemove", dragFnc, false), {once: true});
  }

  public render() {
    const {onDoubleClick} = this.props;
    const {mood, r, x, y} = this.state;

    return (
      <div
        className="doom-face-asdf"
        onMouseDown={(e) => {
          e.persist();
          this.startDragFace(e);
        }}
        onDoubleClick={(e) => onDoubleClick(e)}
        style={{
          position: "fixed",
          top: `${y}px`,
          right: !x && r ? `${r}px` : "auto",
          left: x ? `${x}px` : "auto",
        }}
      ><Face mood={mood} /></div>
    );
  }
}
