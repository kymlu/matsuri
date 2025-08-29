import React from "react";
import { Rect, Text } from "react-konva";
import { FONT_SIZE, GRID_SIZE } from "../../../data/consts.ts";
import BaseFormationObject from "./BaseFormationObject.tsx";

export interface PropObjectProps {
  name: string,
  length: number,
  colour: string,
  startX: number,
  startY: number,
  isSelected?: boolean,
  onClick?: () => void
}

export default function PropObject(props: PropObjectProps) {
  function onClick() {
    props.onClick?.();
  }

  return (
    <BaseFormationObject
      isSelected={props.isSelected}
      startX={props.startX}
      startY={props.startY}
      onClick={onClick}
      updatePosition={()=>{}}
      rotateEnabled={true}
      resizeEnabled={false}>
        <Rect x={props.startX} y={props.startY} width={props.length * GRID_SIZE} height={GRID_SIZE} fill={props.colour} />
        <Text x={props.startX} y={props.startY + FONT_SIZE} width={props.length * GRID_SIZE} height={GRID_SIZE} text={props.name} fontSize={FONT_SIZE} fontStyle="bold" fill="black" verticalAlign="center" align="center" />
    </BaseFormationObject>
  )
}