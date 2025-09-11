import React, { useContext } from "react";
import { Layer, Line } from "react-konva";
import { DEFAULT_WIDTH } from "../../data/consts.ts";
import { basePalette } from "../../themes/colours.ts";
import LengthMeterMarker from "./formationObjects/LengthMeterMarker.tsx";
import WidthMeterMarker from "./formationObjects/WidthMeterMarker.tsx";
import { UserContext } from "../../contexts/UserContext.tsx";

export interface FormationGridProps {
  canvasHeight: number,
  canvasWidth: number,
  height: number,
  width: number,
  isParade?: boolean
}

export default function FormationGrid(props: FormationGridProps) {
  const {gridSize} = useContext(UserContext);
  var gridHeight = Math.ceil(props.canvasHeight/gridSize);
  var gridWidth = Math.ceil(props.canvasWidth/gridSize);

  var emptySpaceX = gridWidth/2 - props.width/2;

  return (
    <>
      <Layer
        listening={false}>
        {[...Array(gridHeight)].map((_, i) => (
          <Line key={i} 
            points={[0, (i + 1) * gridSize, props.canvasWidth + gridSize, (i + 1) * gridSize]}
            dash={i % 2 === 0 ? [1, 1] : [4, 2]}
            stroke={i % 2 === 0 ? basePalette.grey[300] : basePalette.grey[400]}
            strokeWidth={1} />
        ))}
        {[...Array(gridWidth)].map((_, i) => (
          <Line key={i} 
            points={[(i + 1) * gridSize, 0, (i + 1) * gridSize, props.canvasHeight + gridSize]}
            dash={i % 2 === 0 ? [1, 1] : [4, 2]}
            stroke={(i + 1) === DEFAULT_WIDTH/2 ? basePalette.primary.main : i % 2 === 0 ? basePalette.grey[300] : basePalette.grey[400]}
            strokeWidth={(i + 1) === (Math.ceil(props.canvasWidth/gridSize)/2) ? 2 : 1} />
        ))}
        <Line
          points={[(emptySpaceX) * gridSize, gridSize * 2, (emptySpaceX) * gridSize, props.canvasHeight + gridSize]}
          strokeWidth={2}
          stroke={basePalette.primary.main}/>
        <Line
          points={[(gridWidth - emptySpaceX) * gridSize, gridSize * 2, (gridWidth - emptySpaceX) * gridSize, props.canvasHeight + gridSize]}
          strokeWidth={2}
          stroke={basePalette.primary.main}/>
      </Layer>
      <Layer
        key={"Meter"}
        listening={false}>
        {[...Array(props.height + 1)].map((_, i) => ( // todo: if parade, move up to starting position so that it doesn't span the whole position
          <LengthMeterMarker 
            key={i}
            startX={props.canvasWidth - 2 * gridSize}
            startY={i * gridSize + 7 * gridSize/4}
            value={props.isParade ? Math.abs(props.height - i) : i}/>
        ))}
        {[...Array(gridWidth + 2)].map((_, i) => (
          (i % 2 === 0 && i !== 0 && i !== (gridWidth)) &&
          <WidthMeterMarker
            key={i}
            startY={gridSize * 1.25}
            startX={i * gridSize}
            value={Math.abs(Math.round(i - gridWidth/2))}/>
        ))}
      </Layer>
    </>
  )
}