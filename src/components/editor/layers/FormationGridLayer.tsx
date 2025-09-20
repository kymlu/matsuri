import React, { useContext } from "react";
import { Layer, Line } from "react-konva";
import { basePalette, objectColorSettings } from "../../../themes/colours.ts";
import LengthMeterMarker from "../formationObjects/LengthMeterMarker.tsx";
import WidthMeterMarker from "../formationObjects/WidthMeterMarker.tsx";
import { UserContext } from "../../../contexts/UserContext.tsx";
import NoteObject from "../formationObjects/NoteObject.tsx";

export interface FormationGridProps {
  canvasHeight: number,
  canvasWidth: number,
  height: number,
  width: number,
  isParade?: boolean,
  topMargin: number,
  bottomMargin: number,
  sideMargin: number,
}

export default function FormationGridLayer(props: FormationGridProps) {
  const {gridSize, selectedSection} = useContext(UserContext);
  var gridHeight = Math.ceil(props.canvasHeight/gridSize);
  var gridWidth = Math.ceil(props.canvasWidth/gridSize);

  return (
    <>
      <Layer
        listening={false}>
        {/** Grid lines */}
        {[...Array(gridHeight + 1)].map((_, i) => (
          <Line key={i} 
            points={[0, (i) * gridSize, props.canvasWidth + gridSize, (i) * gridSize]}
            dash={i % 2 !== gridHeight / 2 ? [1, 1] : [4, 2]}
            stroke={i % 2 !== 0 ? basePalette.grey[300] : basePalette.grey[400]}
            strokeWidth={1} />
        ))}
        {[...Array(gridWidth + 1)].map((_, i) => (
          <Line key={i} 
            points={[i * gridSize, 0, i * gridSize, props.canvasHeight + gridSize]}
            dash={i % 2 !== (gridWidth / 2) % 2 ? [1, 1] : [4, 2]}
            stroke={i === gridWidth/2 ? basePalette.primary.main : i % 2 === 0 ? basePalette.grey[300] : basePalette.grey[400]}
            strokeWidth={(i) === (Math.ceil(gridWidth)/2) ? 2 : 1} />
        ))}
        {/** Width limit lines */}
        <Line
          points={[props.sideMargin * gridSize, gridSize * 2, props.sideMargin * gridSize, props.canvasHeight + gridSize]}
          strokeWidth={2}
          stroke={basePalette.primary.main}/>
        <Line
          points={[(gridWidth - props.sideMargin) * gridSize, gridSize * 2, (gridWidth - props.sideMargin) * gridSize, props.canvasHeight + gridSize]}
          strokeWidth={2}
          stroke={basePalette.primary.main}/>
        {
          // Stage limits
          (!props.isParade ?? true) && 
          <Line
            points={[(props.sideMargin - 1) * gridSize, (props.height + props.topMargin) * gridSize, (props.width + props.sideMargin + 1) * gridSize, (props.height + props.topMargin) * gridSize]}
            strokeWidth={2}
            stroke={basePalette.primary.main}/>
        }
      </Layer>
      {/** Markers */}
      <Layer
        key={"Meter"}
        listening={false}>
        {[...Array(props.height + props.bottomMargin - 1)].map((_, i) => ( // todo: if parade, move up to starting position so that it doesn't span the whole position
          <LengthMeterMarker 
            key={i}
            startX={props.canvasWidth - 2 * gridSize}
            startY={i * gridSize + (props.topMargin - 0.25) * gridSize}
            value={props.isParade ? Math.abs(props.height - i) : i}/>
        ))}
        {[...Array(gridWidth)].map((_, i) => (
          ((gridWidth / 2) % 2 === i % 2 && i !== 0 && i !== (gridWidth)) &&
          <WidthMeterMarker
            key={i}
            startY={gridSize * 1.25}
            startX={i * gridSize}
            value={Math.abs(Math.round(i - gridWidth/2))}/>
        ))}
        {/** Section name */}
        <NoteObject
          id="sectionName"
          text={selectedSection?.displayName ?? ""}
          startX={(props.sideMargin + props.width/2 - 2.5) * gridSize}
          startY={gridSize * 0.1}
          height={0.75}
          length={5}
          colour={objectColorSettings.white}
          borderRadius={0}
          fontSize={gridSize * 0.4}
          alwaysBold
          showBackground
          />
      </Layer>
    </>
  )
}