import React from "react";
import { Layer, Line } from "react-konva";
import { GRID_SIZE } from "../../data/consts.ts";
import { basePalette } from "../../themes/colours.ts";
import LengthMeterMarker from "./formationObjects/LengthMeterMarker.tsx";
import WidthMeterMarker from "./formationObjects/WidthMeterMarker.tsx";

export interface FormationGridProps {
  canvasHeight: number,
  canvasWidth: number,
  height: number,
  width: number,
  isParade?: boolean // todo: implement
}

export default function FormationGrid(props: FormationGridProps) {
  return (
    <>
      <Layer>
        {[...Array(Math.ceil(props.canvasHeight/GRID_SIZE))].map((_, i) => (
          <Line key={i} 
            points={[0, (i + 1) * GRID_SIZE, props.canvasHeight + GRID_SIZE, (i + 1) * GRID_SIZE]}
            dash={[2, 2]}
            stroke={basePalette.grey[400]}
            strokeWidth={1} />
        ))}
        {[...Array(Math.ceil(props.canvasWidth/GRID_SIZE))].map((_, i) => (
          <Line key={i} 
            points={[(i + 1) * GRID_SIZE, 0, (i + 1) * GRID_SIZE, props.canvasWidth + GRID_SIZE]}
            dash={[2, 2]}
            stroke={i === (Math.ceil(props.canvasWidth/GRID_SIZE)/2) ? basePalette.primary.main : basePalette.grey[400]}
            strokeWidth={i === (Math.ceil(props.canvasWidth/GRID_SIZE)/2) ? 2 : 1} />
        ))}
      </Layer>
      <Layer key={"Meter"}>
        {[...Array(props.height)].map((_, i) => (
          <LengthMeterMarker 
            key={i}
            startX={props.canvasWidth - 2 * GRID_SIZE}
            startY={i * GRID_SIZE + 7 * GRID_SIZE/4}
            value={i}/>
        ))}
        {[...Array(props.width - 1)].map((_, i) => (
          i % 2 === 0 &&
          <WidthMeterMarker
            key={i}
            startY={GRID_SIZE * 1.25}
            startX={(i + 1) * GRID_SIZE}
            value={Math.abs(Math.round(i - props.width/2))}/>
        ))}
      </Layer>
    </>
  )
}