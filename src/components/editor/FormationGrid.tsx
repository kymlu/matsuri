import React from "react";
import { Layer, Line } from "react-konva";
import { DEFAULT_WIDTH, GRID_SIZE } from "../../data/consts.ts";
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
  var gridHeight = Math.ceil(props.canvasHeight/GRID_SIZE);
  var gridWidth = Math.ceil(props.canvasWidth/GRID_SIZE);

  var emptySpaceX = gridWidth/2 - props.width/2;

  return (
    <>
      <Layer>
        {[...Array(gridHeight)].map((_, i) => (
          <Line key={i} 
            points={[0, (i + 1) * GRID_SIZE, props.canvasWidth + GRID_SIZE, (i + 1) * GRID_SIZE]}
            dash={i % 2 == 0 ? [1, 1] : [4, 2]}
            stroke={i % 2 == 0 ? basePalette.grey[300] : basePalette.grey[400]}
            strokeWidth={1} />
        ))}
        {[...Array(gridWidth)].map((_, i) => (
          <Line key={i} 
            points={[(i + 1) * GRID_SIZE, 0, (i + 1) * GRID_SIZE, props.canvasHeight + GRID_SIZE]}
            dash={i % 2 == 0 ? [1, 1] : [4, 2]}
            stroke={(i + 1) === DEFAULT_WIDTH/2 ? basePalette.primary.main : i % 2 == 0 ? basePalette.grey[300] : basePalette.grey[400]}
            strokeWidth={(i + 1) === (Math.ceil(props.canvasWidth/GRID_SIZE)/2) ? 2 : 1} />
        ))}
        <Line
          points={[(emptySpaceX) * GRID_SIZE, GRID_SIZE * 2, (emptySpaceX + 1) * GRID_SIZE, props.canvasHeight + GRID_SIZE]}
          strokeWidth={2}
          stroke={basePalette.primary.main}/>
        <Line
          points={[(gridWidth - emptySpaceX) * GRID_SIZE, GRID_SIZE * 2, (gridWidth - emptySpaceX + 1) * GRID_SIZE, props.canvasHeight + GRID_SIZE]}
          strokeWidth={2}
          stroke={basePalette.primary.main}/>
      </Layer>
      <Layer key={"Meter"}>
        {[...Array(props.height)].map((_, i) => (
          <LengthMeterMarker 
            key={i}
            startX={props.canvasWidth - 2 * GRID_SIZE}
            startY={i * GRID_SIZE + 7 * GRID_SIZE/4}
            value={i}/>
        ))}
        {[...Array(gridWidth + 2)].map((_, i) => (
          (i % 2 === 0 && i !== 0 && i !== (gridWidth)) &&
          <WidthMeterMarker
            key={i}
            startY={GRID_SIZE * 1.25}
            startX={i * GRID_SIZE}
            value={Math.abs(Math.round(i - gridWidth/2))}/>
        ))}
      </Layer>
    </>
  )
}