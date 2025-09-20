import React, { useContext } from "react";
import { Rect, Text } from "react-konva";
import BaseFormationObject from "./BaseFormationObject.tsx";
import { basePalette, ColorStyle } from "../../../themes/colours.ts";
import { Shape, ShapeConfig } from "konva/lib/Shape";
import { Stage } from "konva/lib/Stage";
import { UserContext } from "../../../contexts/UserContext.tsx";

export interface PropObjectProps {
  id: string,
  name: string,
  length: number,
  colour: ColorStyle,
  startX: number,
  startY: number,
  onClick?: (forceSelect?: boolean, multiSelect?: boolean) => void,
  updatePosition?: (x: number, y: number) => void,
  draggable?: boolean,
  onRotate?: (rotation: number, x: number, y: number) => void,
  rotation: number,
  ref?: React.Ref<any>,
  selected?: boolean,
}

export default function PropObject(props: PropObjectProps) {
  const {gridSize} = useContext(UserContext);

  function onRotate(item: Shape<ShapeConfig> | Stage) {
    if (props.onRotate) {
      console.log("onRotate");
      props.onRotate(item.attrs["rotation"], item.attrs["x"], item.attrs["y"]);
    }
  }

  return (
    <BaseFormationObject
      id={props.id}
      onClick={(forceSelect?: boolean, multiSelect?: boolean) => props.onClick?.(forceSelect, multiSelect)}
      updatePosition={props.updatePosition}
      rotation={props.rotation}
      draggable={props.draggable}
      startX={props.startX}
      startY={props.startY}
      onTransform={onRotate}
      ref={props.ref}>
      <Rect
        width={props.length * gridSize}
        height={gridSize}
        fill={props.colour.bgColour}
        stroke={props.selected ? basePalette.primary.main : props.colour.borderColour}
        strokeWidth={props.selected ? gridSize/20 : gridSize/30} />
      <Text
        y={gridSize/3}
        width={props.length * gridSize}
        text={props.name}
        fontSize={gridSize/3}
        fontStyle="bold"
        fill={props.colour.textColour}
        verticalAlign="middle"
        align="center" />
    </BaseFormationObject>
  )
}