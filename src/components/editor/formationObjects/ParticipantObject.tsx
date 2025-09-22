import React, { useContext } from "react";
import { Circle, Text } from "react-konva";
import { basePalette, ColorStyle } from "../../../themes/colours.ts";
import BaseFormationObject from "./BaseFormationObject.tsx";
import Konva from "konva";
import { GridSizeContext } from "../../../contexts/GridSizeContext.tsx";

export interface ParticipantObjectProps {
  id: string,
  name: string,
  colour: ColorStyle,
  startX: number,
  startY: number,
  updatePosition?: (x: number, y: number) => void,
  onClick?: (forceSelect?: boolean, multiSelect?: boolean) => void,
  draggable?: boolean,
  ref?: React.Ref<Konva.Group>,
  selected?: boolean,
}

// Todo: show position if selected in view mode

export default function ParticipantObject(props: ParticipantObjectProps) {
  const {gridSize} = useContext(GridSizeContext);
  
  return (
    <BaseFormationObject
      id={props.id}
      startX={props.startX}
      startY={props.startY}
      onClick={(forceSelect?: boolean, multiSelect?: boolean) => props.onClick?.(forceSelect, multiSelect)}
      updatePosition={props.updatePosition}
      draggable={props.draggable}
      ref={props.ref}>
      <Circle 
        radius={(gridSize/2) * 0.9}
        fill={props.colour.bgColour}
        stroke={props.selected ? basePalette.primary.main : props.colour.borderColour}
        strokeWidth={props.selected ? gridSize/20 : gridSize/30} />
      <Text
        x={-gridSize/2}
        y={-gridSize/2}
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