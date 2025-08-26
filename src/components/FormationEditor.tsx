import React, { useContext, useRef, useState } from "react";
import { Group, Layer, Line, Rect, Stage, Text, Transformer } from "react-konva";
import { basePalette, objectPalette } from "../themes/colours.ts";
import ParticipantObject from "./formationObjects/ParticipantObject.tsx";
import PropObject from "./formationObjects/PropObject.tsx";
import { GRID_SIZE } from "../data/consts.ts";
import { FormationStateContext } from "../contexts/FormationEditorContext.tsx";
import { ParticipantType } from "../models/Participant.ts";
import MeterMarker from "./formationObjects/MeterMarker.tsx";

export interface FormationEditorProps {
  children: React.ReactNode,
  height?: number,
  width?: number,
  showPrevious?: boolean
  showNext?: boolean
}

export default function FormationEditor(props: FormationEditorProps) {
  const {participantPositions, propPositions, updateFormationState} = useContext(FormationStateContext);
  const height = props.height ?? window.innerHeight;
  const width = props.width ?? window.innerWidth;
  const transformerRef = useRef(null);

  return (
    <div>
      <Stage width={width} height={height} style={{ border: '1px solid black', background: 'none' }}>
        <Layer key={"Grid"}>
          {[...Array(Math.ceil(width/GRID_SIZE))].map((_, i) => (
            <Line key={i} points={[0, i * GRID_SIZE, height, i * GRID_SIZE]} dash={[2, 2]} stroke={basePalette.grey[400]} strokeWidth={1} />
          ))}
          {[...Array(Math.ceil(height/GRID_SIZE))].map((_, i) => (
            <Line key={i} points={[i * GRID_SIZE, 0, i * GRID_SIZE, width]} dash={[2, 2]} stroke={basePalette.grey[400]} strokeWidth={1} />
          ))}
        </Layer>
        <Layer key={"Meter"}>
          {[...Array(Math.ceil(height/GRID_SIZE))].map((_, i) => (
            <MeterMarker startX={0} startY={i * GRID_SIZE - GRID_SIZE/4} value={i-1}/>
          ))}
          {[...Array(Math.ceil(width/GRID_SIZE))].map((_, i) => (
            <MeterMarker startY={10} startX={i * GRID_SIZE - GRID_SIZE/4} value={i-1}/>
          ))}
        </Layer>
        { props.showPrevious && 
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
        { props.showNext && 
        <Layer>
          </Layer>
        }
      </Stage>
      {props.children}
    </div>
  )
}