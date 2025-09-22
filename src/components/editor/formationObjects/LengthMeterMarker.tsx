import React, { useContext } from "react";
import { Text } from "react-konva";
import { UserContext } from "../../../contexts/UserContext.tsx";
import { GridSizeContext } from "../../../contexts/GridSizeContext.tsx";

export interface MeterMarkerProps {
  value: number,
  colour?: string,
  startX: number,
  startY: number,
}

export default function LengthMeterMarker(props: MeterMarkerProps) {
  const {gridSize} = useContext(GridSizeContext);

  return (
      <Text 
        x={props.startX}
        y={props.startY}
        fontSize={gridSize/2}
        height={20}
        text={`${props.value}m`}
        fontStyle="bold"
        verticalAlign="center"
        align="center"/>
  )
}