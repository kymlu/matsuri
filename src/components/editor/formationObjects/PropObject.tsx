import React from "react";
import { Group, Rect, Text } from "react-konva";
import { BLOCK_SNAP_SIZE, FONT_SIZE, GRID_SIZE } from "../../../data/consts.ts";

export interface PropObjectProps {
  name: string,
  length: number,
  colour: string,
  startX: number,
  startY: number,
}

export default function PropObject(props: PropObjectProps) {
  return (
    <Group draggable
      onDragEnd={e => {
        e.target.to({
          x: Math.round(e.target.x() / BLOCK_SNAP_SIZE) * BLOCK_SNAP_SIZE,
          y: Math.round(e.target.y() / BLOCK_SNAP_SIZE) * BLOCK_SNAP_SIZE,
        })
      }}>
      <Rect x={props.startX} y={props.startY} width={props.length * GRID_SIZE} height={GRID_SIZE} fill={props.colour} />
      <Text x={props.startX} y={props.startY + FONT_SIZE} width={props.length * GRID_SIZE} height={GRID_SIZE} text={props.name} fontSize={FONT_SIZE} fontStyle="bold" fill="black" verticalAlign="center" align="center" />
    </Group>
  )
}