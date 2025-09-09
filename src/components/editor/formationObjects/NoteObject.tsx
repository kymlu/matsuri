import React, { useContext } from "react";
import { Rect, Text } from "react-konva";
import { FONT_SIZE } from "../../../data/consts.ts";
import BaseFormationObject from "./BaseFormationObject.tsx";
import { ColorStyle } from "../../../themes/colours.ts";
import { UserContext } from "../../../contexts/UserContext.tsx";

export interface NoteObjectProps {
  label?: string,
  text: string,
  height: number,
  length: number,
  colour: ColorStyle,
  borderRadius?: number,
  startX: number,
  startY: number,
  isSelected?: boolean,
  onClick?: (forceSelect?: boolean) => void,
  updatePosition?: (x: number, y: number) => void,
  draggable?: boolean,
  fontSize?: number,
}

export default function NoteObject(props: NoteObjectProps) {
  const {gridSize} = useContext(UserContext);
  
  function onClick(forceSelect?: boolean) {
    if (props.draggable) {
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
      resizeEnabled={false} // todo: maybe set to true
      draggable={props.draggable}>
      <Rect
        x={props.startX}
        y={props.startY}
        width={props.length * gridSize}
        height={props.height * gridSize}
        fill={props.colour.bgColour}
        stroke={props.colour.borderColour}
        strokeWidth={gridSize/30}
        cornerRadius={props.borderRadius} />
      <Text
        x={props.startX}
        y={props.startY}
        height={props.height * gridSize}
        width={props.length * gridSize}
        text={props.text}
        fontSize={props.fontSize ?? FONT_SIZE}
        fontStyle="bold"
        fill={props.colour.textColour}
        verticalAlign="middle"
        align="center" />
      {props.label && 
        <>
          <Rect
            x={props.startX + gridSize / 4}
            y={props.startY - gridSize / 4}
            width={(props.length * 0.75) * gridSize}
            height={0.5 * gridSize}
            fill={props.colour.bgColour}
            stroke={props.colour.borderColour}
            strokeWidth={gridSize/30}
            cornerRadius={props.borderRadius} />
          <Text
            x={props.startX + gridSize / 2}
            y={props.startY - gridSize / 4}
            width={(props.length / 2) * gridSize}
            height={0.5 * gridSize}
            text={props.label}
            fontSize={props.fontSize ?? FONT_SIZE}
            fontStyle="bold"
            verticalAlign="middle"
            fill={props.colour.textColour}/>
        </>
        }
    </BaseFormationObject>
  )
}