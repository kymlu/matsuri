import React, { useContext } from "react";
import { Rect, Text } from "react-konva";
import { FONT_SIZE } from "../../../data/consts.ts";
import { ColorStyle } from "../../../themes/colours.ts";
import BaseFormationObject from "./BaseFormationObject.tsx";
import { UserContext } from "../../../contexts/UserContext.tsx";

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
  const {gridSize} = useContext(UserContext);
  
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
        radius={gridSize/2}
        fill={props.colour.bgColour}
        stroke={props.colour.borderColour}
        strokeWidth={2} />
      <Text
        x={props.startX-gridSize/2}
        y={props.startY-gridSize/2}
        width={gridSize}
        height={gridSize}
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