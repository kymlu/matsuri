import React, { useContext } from "react";
import { Line, Rect, Text } from "react-konva";
import { DEFAULT_FONT_SIZE } from "../../../lib/consts.ts";
import BaseFormationObject from "./BaseFormationObject.tsx";
import { basePalette, ColorStyle } from "../../../themes/colours.ts";
import { VisualSettingsContext } from "../../../contexts/VisualSettingsContext.tsx";

export interface NoteObjectProps {
  id: string,
  label?: string,
  text: string,
  height: number,
  length: number,
  colour: ColorStyle,
  borderRadius?: number,
  startX: number,
  startY: number,
  onClick?: (isMoving?: boolean, multiSelect?: boolean) => void,
  updatePosition?: (x: number, y: number) => void,
  draggable?: boolean,
  fontSize?: number,
  alwaysBold?: boolean,
  hasBorder: boolean,
  ref?: React.Ref<any>,
  selected?: boolean,
  textAlignment?: "left" | "center" | "right",
}

export default function NoteObject(props: NoteObjectProps) {
  const {gridSize} = useContext(VisualSettingsContext);

  return (
    <BaseFormationObject
      id={props.id}
      onClick={(isMoving?: boolean, multiSelect?: boolean) => props.onClick?.(isMoving, multiSelect)}
      updatePosition={props.updatePosition}
      ref={props.ref}
      startX={props.startX}
      startY={props.startY}
      draggable={props.draggable}>
      {
        (props.colour.bgColour || props.colour.borderColour || props.selected) &&
        <Rect
          width={props.length * gridSize}
          height={props.height * gridSize}
          fill={props.colour.bgColour}
          stroke={props.selected ? basePalette.primary.main : props.colour.borderColour}
          strokeWidth={props.selected ? gridSize/15 : props.hasBorder ? gridSize/20 : 0}
          cornerRadius={props.borderRadius}
          strokeScaleEnabled={false}/>
      }
      {
        props.label && 
        <>
          <Text
            x={gridSize / 3 }
            width={(props.length / 2) * gridSize}
            height={0.5 * gridSize}
            text={props.label}
            fontSize={props.fontSize ?? DEFAULT_FONT_SIZE}
            fontStyle="bold"
            verticalAlign="middle"
            fill={props.colour.textColour ?? basePalette.black}/>
          <Line
            points={[0, 0.5 * gridSize, props.length * gridSize, 0.5 * gridSize]}
            stroke={basePalette.black}
            strokeWidth={gridSize/30}/>
        </>
      }
      <Text
        y={props.label ? 0.55 * gridSize : 0}
        height={props.height * gridSize - (props.label ? 0.55 * gridSize : 0)}
        width={props.length * gridSize}
        text={props.text}
        padding={0.2*gridSize}
        fontSize={props.fontSize ?? DEFAULT_FONT_SIZE}
        fontStyle={props.alwaysBold ? "bold" : "normal"}
        fill={props.colour.textColour ?? basePalette.black}
        verticalAlign="middle"
        align={props.textAlignment ?? "center"} />
      
    </BaseFormationObject>
  )
}