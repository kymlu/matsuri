import React, { useContext, useEffect, useRef } from "react";
import { Layer, Stage, Transformer } from "react-konva";
import { objectColorSettings, objectPalette } from "../../themes/colours.ts";
import ParticipantObject from "./formationObjects/ParticipantObject.tsx";
import PropObject from "./formationObjects/PropObject.tsx";
import { GRID_SIZE } from "../../data/consts.ts";
import { FormationStateContext } from "../../contexts/FormationEditorContext.tsx";
import { ParticipantType } from "../../models/Participant.ts";
import { UserContext } from "../../contexts/UserContext.tsx";
import FormationGrid from "./FormationGrid.tsx";
import Button from "../Button.tsx";

export interface FormationEditorProps {
  height: number,
  width: number,
}

export default function FormationEditor(props: FormationEditorProps) {
  const {showPrevious, showNext} = useContext(UserContext);
  const {participantPositions, propPositions, updateFormationState} = useContext(FormationStateContext);
  const canvasHeight = (props.height + 2) * GRID_SIZE;
  const canvasWidth = (props.width + 2) * GRID_SIZE;
  const transformerRef = useRef(null);
  const layer = useRef<typeof Layer>(null);

  useEffect(() => {
    participantPositions.forEach(p => {
      p.x2 = p.x;
      p.y2 = p.y;
    });
  })

  function updateParticipantPosition(id: string, x: number, y: number) {
    var participant = participantPositions.find(x => x.id === id);
    if (participant) {
      participant.x2 = (participant.x * GRID_SIZE + x)/GRID_SIZE;
      participant.y2 = (participant.y * GRID_SIZE + y)/GRID_SIZE; // todo: fix off by 2m
      console.log('Updated position for', participant.participant.name, 'to', participant.x2, participant.y2);
    }
  }

  function saveFormation() {
    participantPositions.forEach(p => {
      p.x = p.x2;
      p.y = p.y2;
    });
    updateFormationState({participantPositions: participantPositions});
  }

  function updatePropPosition(id: string, x: number, y: number) {
    var prop = propPositions.find(x => x.id === id);
    if (prop) {
      prop.x = x;
      prop.y = y;
      updateFormationState({propPositions: [...propPositions.filter(x => x.id !== id), prop]});
    }
  }

  return (
    <div>
      <Button onClick={() => saveFormation()}>Save</Button>
      <Stage width={canvasWidth} height={canvasHeight}>
        <FormationGrid
          canvasHeight={canvasHeight}
          canvasWidth={canvasWidth}
          height={props.height}
          width={props.width}/>
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
          { participantPositions.map(placement => 
              (<ParticipantObject 
                key={placement.id}
                name={placement.participant.name} 
                role={placement.participant.type === ParticipantType.dancer ? "Dancer" : "Staff"} 
                colour={placement.category?.color || objectColorSettings["amberLight"]} 
                startX={placement.x * GRID_SIZE} 
                startY={placement.y * GRID_SIZE}
                updatePosition={(x, y) => updateParticipantPosition(placement.id, x, y)} 
              />)
            )
          }
        </Layer>
        { showNext && 
        <Layer>
          </Layer>
        }
      </Stage>
    </div>
  )
}