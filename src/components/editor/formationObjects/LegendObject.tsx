import React, {  } from "react";
import { Rect, Text } from "react-konva";
import { FONT_SIZE, GRID_SIZE } from "../../../data/consts.ts";
import { ColorStyle } from "../../../themes/colours.ts";
import BaseFormationObject from "./BaseFormationObject.tsx";

// todo
export interface LegendObjectProps {
  text: string,
  colour: ColorStyle,
  startX: number,
  startY: number,
  updatePosition?: (x: number, y: number) => void,
  isSelected?: boolean,
  onClick: (forceSelect?: boolean) => void,
}

export default function LegendObject(props: LegendObjectProps) {
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
      rotateEnabled={false}
      resizeEnabled={false}>
      <Rect 
        x={props.startX}
        y={props.startY}
        radius={GRID_SIZE/2}
        fill={props.colour.bgColour}
        stroke={props.colour.borderColour}
        strokeWidth={2} />
      <Text
        x={props.startX-GRID_SIZE/2}
        y={props.startY-GRID_SIZE/2}
        width={GRID_SIZE}
        height={GRID_SIZE}
        text={props.text}
        wrap="true"
        fontSize={FONT_SIZE}
        fontStyle="bold"
        fill={props.colour.textColour}
        verticalAlign="middle"
        align="center" />
    </BaseFormationObject>
  )
}