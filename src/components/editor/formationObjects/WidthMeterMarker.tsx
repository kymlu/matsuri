import React from "react";
import { Circle, Group, Rect, Text } from "react-konva";
import { FONT_SIZE, GRID_SIZE } from "../../../data/consts.ts";
import { basePalette } from "../../../themes/colours.ts";

export interface MeterMarkerProps {
  value: number,
  colour?: string,
  startX: number,
  startY: number,
}

export default function WidthMeterMarker(props: MeterMarkerProps) {
  return (
    <Group>
      <Circle x={props.startX} y={props.startY} radius={8} fill={basePalette.primary.main}/>
      <Text x={props.startX - 12}
        y={props.startY - 4}
        width={GRID_SIZE/2}
        fontSize={10}
        fill={basePalette.white}
        height={20}
        text={props.value.toString()}
        fontStyle="bold"
        verticalAlign="center"
        align="center"/>
    </Group>
  )
}