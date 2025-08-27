import React from "react";
import { Group, Rect, Text } from "react-konva";
import { FONT_SIZE, GRID_SIZE } from "../../../data/consts.ts";
import { basePalette } from "../../../themes/colours.ts";

export interface MeterMarkerProps {
  value: number,
  colour?: string,
  startX: number,
  startY: number,
}

export default function LengthMeterMarker(props: MeterMarkerProps) {
  return (
      <Text x={props.startX} y={props.startY + FONT_SIZE/4} fontSize={20} height={20} text={`${props.value}m`} fontStyle="bold" verticalAlign="center" align="center"/>
  )
}