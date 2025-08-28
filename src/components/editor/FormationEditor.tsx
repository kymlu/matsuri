import React, { useContext, useEffect, useRef, useState } from "react";
import { Layer, Stage, Transformer } from "react-konva";
import { objectColorSettings, objectPalette } from "../../themes/colours.ts";
import ParticipantObject from "./formationObjects/ParticipantObject.tsx";
import PropObject from "./formationObjects/PropObject.tsx";
import { GRID_SIZE } from "../../data/consts.ts";
import { FormationStateContext } from "../../contexts/FormationEditorContext.tsx";
import { UserContext } from "../../contexts/UserContext.tsx";
import FormationGrid from "./FormationGrid.tsx";
import Button from "../Button.tsx";
import { db } from "../../App.tsx";
import { ParticipantPosition, PropPosition } from "../../models/Position.ts";
import { FormationSongSection } from "../../models/FormationSection.ts";
import { strEquals } from "../helpers/GlobalHelper.ts";

export interface FormationEditorProps {
  height: number,
  width: number,
}

export default function FormationEditor(props: FormationEditorProps) {
  const {selectedItem, showPrevious, showNext, updateState} = useContext(UserContext);
  const {participantPositions, propPositions, updateFormationState} = useContext(FormationStateContext);
  const canvasHeight = (props.height + 2) * GRID_SIZE;
  const canvasWidth = (Math.ceil(props.width/2) * 2 + 2) * GRID_SIZE;
  const transformerRef = useRef(null);
  const [dbInitialized, setDbInitialized] = useState(false)

  useEffect(() => {
    if (db === null && !dbInitialized){
      setDbInitialized(true);
      window.addEventListener("dbInitialized", () => { init() }, {once: true});
    } else if (!dbInitialized) {
      setDbInitialized(true);
      init();
    }
  }, [])

  function init () {
    console.log("init formation editor");
    Promise.all(
      [db.getAll("participantPosition"),
        db.getAll("propPosition"),
        db.getAll("formationSection")]).then(([participantPosition, propPosition, formationSongSections]) => {
      try {
        updateState({
          sections: (formationSongSections as Array<FormationSongSection>)
        });
        updateFormationState({
          participantPositions: participantPosition as Array<ParticipantPosition>,
          propPositions: propPosition as Array<PropPosition>
        });
        participantPositions.forEach(p => {
          p.x2 = p.x;
          p.y2 = p.y;
        });
      } catch (e) {
        console.error('Error parsing user from localStorage:', e);
      }
    });
  }

  function updateParticipantPosition(id: string, x: number, y: number) {
    var participant = participantPositions.find(x => x.id === id);
    if (participant) {
      participant.x2 = (participant.x * GRID_SIZE + x)/GRID_SIZE;
      participant.y2 = (participant.y * GRID_SIZE + y)/GRID_SIZE; // todo: fix off by 2m
      console.log('Updated position for', participant.participant.name, 'to', participant.x2, participant.y2);
      db.upsertItem("participantPosition", {...participant, x: participant.x2, y: participant.y2});
    }
  }

  // todo: redundant, fix
  function selectParticipant(participant: ParticipantPosition) {
    if (selectedItem === null || !strEquals(selectedItem.id, participant.id)) {
      updateState({selectedItem: participant});
      participantPositions.filter(x => x.isSelected).forEach(x => x.isSelected = false);
      participant.isSelected = true;
    } else {
      updateState({selectedItem: null});
      participant.isSelected = false;
    }
  }

  function saveFormation() {
    participantPositions.forEach(p => {
      p.x = p.x2;
      p.y = p.y2;
    });
    updateFormationState({participantPositions: participantPositions});
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
                colour={placement.category?.color || objectColorSettings["amberLight"]} 
                startX={placement.x * GRID_SIZE} 
                startY={placement.y * GRID_SIZE}
                isSelected={placement.isSelected}
                updatePosition={(x, y) => updateParticipantPosition(placement.id, x, y)}
                onClick={() => selectParticipant(placement)} 
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