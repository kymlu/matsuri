import React, { useContext } from "react";
import { Rect, Text } from "react-konva";
import { FONT_SIZE } from "../../../data/consts.ts";
import BaseFormationObject from "./BaseFormationObject.tsx";
import { ColorStyle } from "../../../themes/colours.ts";
import { Shape, ShapeConfig } from "konva/lib/Shape";
import { Stage } from "konva/lib/Stage";
import { UserContext } from "../../../contexts/UserContext.tsx";

export interface PropObjectProps {
  name: string,
  length: number,
  colour: ColorStyle,
  startX: number,
  startY: number,
  isSelected?: boolean,
  onClick?: (forceSelect?: boolean) => void,
  updatePosition?: (x: number, y: number) => void,
  draggable?: boolean,
  onRotate?: (rotation: number, x: number, y: number) => void,
  rotation: number,
}

export default function PropObject(props: PropObjectProps) {
  const {gridSize} = useContext(UserContext);

  function onClick(forceSelect?: boolean) {
    if (props.draggable) {
      props.onClick?.(forceSelect);
    }
  }

  function onRotate(item: Shape<ShapeConfig> | Stage) {
    if (props.onRotate) {
      console.log("onRotate");
      props.onRotate(item.attrs["rotation"], item.attrs["x"], item.attrs["y"]);
    }
  }

  return (
    <BaseFormationObject
      isSelected={props.isSelected}
      startX={props.startX}
      startY={props.startY}
      onClick={onClick}
      updatePosition={props.updatePosition}
      rotateEnabled={true}
      resizeEnabled={false}
      rotation={props.rotation}
      draggable={props.draggable}
      onTransform={onRotate}>
      <Rect x={props.startX}
        y={props.startY}
        width={props.length * gridSize}
        height={gridSize}
        fill={props.colour.bgColour}
        stroke={props.colour.borderColour}
        strokeWidth={2} />
      <Text x={props.startX}
        y={props.startY + FONT_SIZE}
        width={props.length * gridSize}
        // height={gridSize}
        text={props.name}
        fontSize={FONT_SIZE}
        fontStyle="bold"
        fill={props.colour.textColour}
        verticalAlign="middle"
        align="center" />
    </BaseFormationObject>
  )
}