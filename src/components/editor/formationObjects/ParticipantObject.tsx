import React, { useContext } from "react";
import { Circle, Text } from "react-konva";
import { FONT_SIZE } from "../../../data/consts.ts";
import { ColorStyle } from "../../../themes/colours.ts";
import BaseFormationObject from "./BaseFormationObject.tsx";
import { UserContext } from "../../../contexts/UserContext.tsx";

export interface ParticipantObjectProps {
  name: string,
  colour: ColorStyle,
  startX: number,
  startY: number,
  updatePosition?: (x: number, y: number) => void,
  isSelected?: boolean,
  onClick?: (forceSelect?: boolean) => void,
  draggable?: boolean,
  ref?: React.Ref<any>,
}

export default function ParticipantObject(props: ParticipantObjectProps) {
  const {gridSize} = useContext(UserContext);
  console.log(props.ref)
  
  function onClick(forceSelect?: boolean) {
    if(props.draggable) {
      props.onClick?.(forceSelect);
    }
  }
  
  return (
    <BaseFormationObject
      isSelected={props.isSelected}
      startX={props.startX}
      startY={props.startY}
      onClick={onClick}
      updatePosition={props.updatePosition}
      rotateEnabled={false}
      resizeEnabled={false}
      draggable={props.draggable}
      ref={props.ref}>
      <Circle 
        x={props.startX}
        y={props.startY}
        radius={gridSize/2}
        fill={props.colour.bgColour}
        stroke={props.colour.borderColour}
        strokeWidth={gridSize/30} />
      <Text
        x={props.startX-gridSize/2}
        y={props.startY-gridSize/2}
        width={gridSize}
        height={gridSize}
        text={props.name}
        fontSize={gridSize/3}
        fontStyle="bold"
        fill={props.colour.textColour}
        verticalAlign="middle"
        align="center" />
    </BaseFormationObject>
  )
}