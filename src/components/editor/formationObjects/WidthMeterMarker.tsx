import React, { useContext } from "react";
import { Circle, Group, Text } from "react-konva";
import { basePalette } from "../../../themes/colours.ts";
import { UserContext } from "../../../contexts/UserContext.tsx";

export interface MeterMarkerProps {
  value: number,
  colour?: string,
  startX: number,
  startY: number,
}

export default function WidthMeterMarker(props: MeterMarkerProps) {
  const {gridSize} = useContext(UserContext);
  return (
    <Group>
      <Circle x={props.startX} y={props.startY} radius={8} fill={basePalette.primary.main}/>
      <Text x={props.startX - 10}
        y={props.startY - 4}
        width={gridSize/2}
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