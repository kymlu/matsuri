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
      <Circle
        x={props.startX}
        y={props.startY}
        radius={gridSize/4}
        fill={basePalette.primary.main}/>
      <Text 
        x={props.startX - gridSize/4}
        y={props.startY - gridSize/4}
        width={gridSize/2}
        fontSize={gridSize/3}
        fill={basePalette.white}
        height={gridSize/2}
        text={props.value.toString()}
        fontStyle="bold"
        verticalAlign="middle"
        align="center"/>
    </Group>
  )
}