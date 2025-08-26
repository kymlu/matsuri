import React, { useContext } from "react";
import { Circle, Group, Text } from "react-konva";
import { BLOCK_SNAP_SIZE, FONT_SIZE, GRID_SIZE } from "../../data/consts.ts";
import { UserContext } from "../../contexts/UserContext.tsx";

export interface ParticipantObjectProps {
  name: string,
  role: string,
  colour: string,
  startX: number,
  startY: number,
}

export default function ParticipantObject(props: ParticipantObjectProps) {
  const {snapToGrid} = useContext(UserContext)

  return (
    <Group draggable 
      onDragEnd={e => {
        if(snapToGrid){
          var x = Math.round(e.target.x() / BLOCK_SNAP_SIZE) * BLOCK_SNAP_SIZE;
          var y = Math.round(e.target.y() / BLOCK_SNAP_SIZE) * BLOCK_SNAP_SIZE;
          e.target.to({
            x: x,
            y: y,
          });
          // TODO: save new position
        }
      }}>
      <Circle x={props.startX} y={props.startY} radius={GRID_SIZE/2} fill={props.colour} />
      <Text x={props.startX-GRID_SIZE/2} y={props.startY-FONT_SIZE/2} width={GRID_SIZE} height={GRID_SIZE} text={props.name} fontSize={FONT_SIZE} fontStyle="bold" fill="black" verticalAlign="center" align="center" />
    </Group>
  )
}