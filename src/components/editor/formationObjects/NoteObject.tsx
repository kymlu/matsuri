import React, { useContext } from "react";
import { Line, Rect, Text } from "react-konva";
import { FONT_SIZE } from "../../../data/consts.ts";
import BaseFormationObject from "./BaseFormationObject.tsx";
import { basePalette, ColorStyle } from "../../../themes/colours.ts";
import { UserContext } from "../../../contexts/UserContext.tsx";

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
  onClick?: (forceSelect?: boolean, multiSelect?: boolean) => void,
  updatePosition?: (x: number, y: number) => void,
  draggable?: boolean,
  fontSize?: number,
  alwaysBold?: boolean,
  ref?: React.Ref<any>,
}

export default function NoteObject(props: NoteObjectProps) {
  const {gridSize} = useContext(UserContext);

  return (
    <BaseFormationObject
      id={props.id}
      onClick={(forceSelect?: boolean, multiSelect?: boolean) => props.onClick?.(forceSelect, multiSelect)}
      updatePosition={props.updatePosition}
      ref={props.ref}
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
      {
        props.label && 
        <>
          <Text
            x={props.startX + gridSize / 3 }
            y={props.startY}
            width={(props.length / 2) * gridSize}
            height={0.5 * gridSize}
            text={props.label}
            fontSize={props.fontSize ?? FONT_SIZE}
            fontStyle="bold"
            verticalAlign="middle"
            fill={props.colour.textColour}/>
          <Line
            points={[props.startX, props.startY + 0.5 * gridSize, props.startX + props.length * gridSize, props.startY + 0.5 * gridSize]}
            stroke={basePalette.black}
            strokeWidth={gridSize/30}/>
        </>
      }
      <Text
        x={props.startX + gridSize * 0.15}
        y={props.startY + (props.label ? 0.55 * gridSize : 0)}
        height={props.height * gridSize - (props.label ? 0.55 * gridSize : 0)}
        width={(props.length - 0.3) * gridSize}
        text={props.text}
        fontSize={props.fontSize ?? FONT_SIZE}
        fontStyle={props.alwaysBold ? "bold" : "normal"}
        fill={props.colour.textColour}
        verticalAlign="middle"
        align="center" />
      
    </BaseFormationObject>
  )
}