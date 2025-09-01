import React from "react";
import { Rect, Text } from "react-konva";
import { FONT_SIZE, GRID_SIZE } from "../../../data/consts.ts";
import BaseFormationObject from "./BaseFormationObject.tsx";
import { ColorStyle } from "../../../themes/colours.ts";

export interface PropObjectProps {
  name: string,
  length: number,
  colour: ColorStyle,
  startX: number,
  startY: number,
  isSelected?: boolean,
  onClick: (forceSelect?: boolean) => void,
  updatePosition?: (x: number, y: number) => void
}

export default function PropObject(props: PropObjectProps) {
  function onClick(forceSelect?: boolean) {
    props.onClick?.(forceSelect);
  }

  return (
    <BaseFormationObject
      isSelected={props.isSelected}
      startX={props.startX}
      startY={props.startY}
      onClick={onClick}
      updatePosition={props.updatePosition}
      rotateEnabled={true}
      resizeEnabled={false}>
        <Rect x={props.startX}
          y={props.startY}
          width={props.length * GRID_SIZE}
          height={GRID_SIZE}
          fill={props.colour.bgColour}
          stroke={props.colour.borderColour}
          strokeWidth={2} />
        <Text x={props.startX}
          y={props.startY + FONT_SIZE}
          width={props.length * GRID_SIZE}
          //height={GRID_SIZE}
          text={props.name}
          fontSize={FONT_SIZE}
          fontStyle="bold"
          fill={props.colour.textColour}
          verticalAlign="center"
          align="center" />
    </BaseFormationObject>
  )
}