import React, { useContext } from "react";
import { Circle, Group, Text } from "react-konva";
import { BLOCK_SNAP_SIZE, FONT_SIZE, GRID_SIZE } from "../../../data/consts.ts";
import { UserContext } from "../../../contexts/UserContext.tsx";
import { basePalette, ColorStyle } from "../../../themes/colours.ts";

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
  const {snapToGrid} = useContext(UserContext);
  console.log('Rendering ParticipantObject:', props.name, 'at', props.startX, props.startY, props);
  
  return (
    <Group draggable 
      onClick={e => {props.onClick()}}
      onDragEnd={e => {
        const node = e.target;

        if (snapToGrid){
          var x = Math.round(node.x() / BLOCK_SNAP_SIZE) * BLOCK_SNAP_SIZE;
          var y = Math.round(node.y() / BLOCK_SNAP_SIZE) * BLOCK_SNAP_SIZE;
          node.to({
            x: x,
            y: y,
            onFinish: () => {
              console.log("Movement", e.target.attrs.x, e.target.attrs.y);
              props.updatePosition &&
              props.updatePosition(e.target.attrs.x, node.attrs.y)
            }
          });
        }
      }}>
      <Circle 
        x={props.startX}
        y={props.startY}
        radius={GRID_SIZE/2}
        fill={props.colour.bgColour}
        stroke={props.isSelected ? basePalette.primary.main : props.colour.borderColour}
        strokeWidth={props.isSelected ? 4 : 2} />
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
    </Group>
  )
}