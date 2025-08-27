import React, { useContext, useRef, useState } from "react";
import { Group, Layer, Line, Rect, Stage, Text, Transformer } from "react-konva";
import { basePalette, objectPalette } from "../themes/colours.ts";
import ParticipantObject from "./formationObjects/ParticipantObject.tsx";
import PropObject from "./formationObjects/PropObject.tsx";
import { GRID_SIZE } from "../data/consts.ts";
import { FormationStateContext } from "../contexts/FormationEditorContext.tsx";
import { ParticipantType } from "../models/Participant.ts";
import MeterMarker from "./formationObjects/MeterMarker.tsx";
import { UserContext } from "../contexts/UserContext.tsx";

export interface FormationEditorProps {
  height: number,
  width: number,
}

export default function FormationEditor(props: FormationEditorProps) {
  const {showPrevious, showNext} = useContext(UserContext);
  const {participantPositions, propPositions, updateFormationState} = useContext(FormationStateContext);
  const canvasHeight = (props.height + 4) * GRID_SIZE;
  const canvasWidth = (props.width + 4) * GRID_SIZE;
  const transformerRef = useRef(null);

  return (
    <div>
      <Stage width={canvasWidth} height={canvasHeight} style={{ background: 'pink' }}>
        <Layer key={"Grid"}>
          {[...Array(Math.ceil(canvasWidth/GRID_SIZE))].map((_, i) => (
            <Line key={i} points={[0, (i-1) * GRID_SIZE, canvasHeight, (i-1) * GRID_SIZE]} dash={[2, 2]} stroke={basePalette.grey[400]} strokeWidth={1} />
          ))}
          {[...Array(Math.ceil(canvasHeight/GRID_SIZE))].map((_, i) => (
            <Line key={i} points={[i * GRID_SIZE, 0, i * GRID_SIZE, canvasWidth]} dash={[2, 2]} stroke={basePalette.grey[400]} strokeWidth={1} />
          ))}
        </Layer>
        <Layer key={"Meter"}>
          {[...Array(props.height)].map((_, i) => (
            <MeterMarker startX={canvasWidth - 4 * GRID_SIZE} startY={i * GRID_SIZE + 7 * GRID_SIZE/4} value={i}/>
          ))}
          {[...Array(props.width)].map((_, i) => (
            <MeterMarker startY={GRID_SIZE * 1.25} startX={i * GRID_SIZE + 7 * GRID_SIZE/4} value={i}/>
          ))}
        </Layer>
        { showPrevious && 
          <Layer>
          </Layer>
        }
        <Layer>
          <Transformer 
          ref={transformerRef}
          boundBoxFunc={(oldBox, newBox) => {
            // Limit resize
            if (newBox.width < 5 || newBox.height < 5) {
              return oldBox;
            }
            return newBox;
          }}/>
          { participantPositions.map(placement => 
              (<ParticipantObject 
                key={placement.id}
                name={placement.participant.name} 
                role={placement.participant.type === ParticipantType.dancer ? "Dancer" : "Staff"} 
                colour={placement.participant.type === ParticipantType.dancer ? objectPalette.amber.light : objectPalette.blue.light} 
                startX={placement.x} 
                startY={placement.y} 
              />)
            )
          }
          {
            propPositions.map(placement =>
              <PropObject 
                key={placement.id}
                name={placement.prop.name} 
                colour={objectPalette.purple.light} 
                length={placement.prop.length} 
                startX={placement.x} 
                startY={placement.y} 
              />
            )
          }
          <ParticipantObject name="Alice" role="Dancer" colour={objectPalette.amber.light} startX={300} startY={200} />
          <PropObject name="Flag" colour={objectPalette.purple.light} length={1} startX={10} startY={300}/>
          <PropObject name="Flag2" colour={objectPalette.purple.light} length={2} startX={20} startY={30}/>
        </Layer>
        { showNext && 
        <Layer>
          </Layer>
        }
      </Stage>
    </div>
  )
}