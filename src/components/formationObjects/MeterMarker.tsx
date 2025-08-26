import React from "react";
import { Group, Rect, Text } from "react-konva";
import { FONT_SIZE, GRID_SIZE } from "../../data/consts.ts";
import { basePalette } from "../../themes/colours.ts";

export interface MeterMarkerProps {
  value: number,
  colour?: string,
  startX: number,
  startY: number,
}

export default function MeterMarker(props: MeterMarkerProps) {
  return (
    <Group>
      <Rect x={props.startX} y={props.startY} width={GRID_SIZE/2} height={20} fill={basePalette.grey[300]} cornerRadius={2} />
      <Text x={props.startX} y={props.startY + FONT_SIZE/4} width={GRID_SIZE/2} fontSize={FONT_SIZE} height={20} text={props.value.toString()} verticalAlign="center" align="center"/>
    </Group>
  )
}