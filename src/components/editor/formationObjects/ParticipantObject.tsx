import React, { useContext, useEffect, useRef } from "react";
import { Circle, Group, Text, Transformer } from "react-konva";
import { BLOCK_SNAP_SIZE, FONT_SIZE, GRID_SIZE } from "../../../data/consts.ts";
import { UserContext } from "../../../contexts/UserContext.tsx";
import { basePalette, ColorStyle } from "../../../themes/colours.ts";
import Konva from "konva";
import BaseFormationObject from "./BaseFormationObject.tsx";

export interface ParticipantObjectProps {
  name: string,
  colour: ColorStyle,
  startX: number,
  startY: number,
  updatePosition?: (x: number, y: number) => void,
  isSelected?: boolean,
  onClick: () => void,
}

export default function ParticipantObject(props: ParticipantObjectProps) {
  function onClick() {
    props.onClick?.();
  }
  
  console.log('Rendering ParticipantObject:', props.name, 'at', props.startX, props.startY, props);
  
  return (
    <BaseFormationObject
      isSelected={props.isSelected}
      startX={props.startX}
      startY={props.startY}
      onClick={onClick}
      updatePosition={props.updatePosition}
      rotateEnabled={false}
      resizeEnabled={false}>
      <Circle 
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
            text={props.name}
            fontSize={FONT_SIZE}
            fontStyle="bold"
            fill={props.colour.textColour}
            verticalAlign="middle"
            align="center" />
    </BaseFormationObject>
  )
}