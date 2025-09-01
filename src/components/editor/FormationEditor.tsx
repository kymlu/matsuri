import React, { useContext, useRef } from "react";
import { Layer, Stage, Transformer } from "react-konva";
import { objectColorSettings, objectPalette } from "../../themes/colours.ts";
import ParticipantObject from "./formationObjects/ParticipantObject.tsx";
import PropObject from "./formationObjects/PropObject.tsx";
import { DEFAULT_WIDTH, GRID_SIZE } from "../../data/consts.ts";
import { PositionContext } from "../../contexts/PositionContext.tsx";
import { UserContext } from "../../contexts/UserContext.tsx";
import FormationGrid from "./FormationGrid.tsx";
import { ParticipantPosition, PropPosition } from "../../models/Position.ts";
import { strEquals } from "../helpers/GlobalHelper.ts";
import { dbController } from "../../data/DBProvider.tsx";
import { CategoryContext } from "../../contexts/CategoryContext.tsx";

export interface FormationEditorProps {
  height: number,
  width: number,
}

export default function FormationEditor(props: FormationEditorProps) {
  const {selectedItem, showPrevious, showNext, updateState} = useContext(UserContext);
  const {participantPositions, propPositions} = useContext(PositionContext);
  const {categories} = useContext(CategoryContext);
  const canvasHeight = (props.height + 2) * GRID_SIZE;
  const canvasWidth = DEFAULT_WIDTH * GRID_SIZE;
  const transformerRef = useRef(null);

  function updateParticipantPosition(id: string, x: number, y: number) {
    var participant = participantPositions.find(x => x.id === id);
    if (participant) {
      participant.x2 = (participant.x * GRID_SIZE + x)/GRID_SIZE;
      participant.y2 = (participant.y * GRID_SIZE + y)/GRID_SIZE; // todo: fix off by 2m
      console.log('Updated position for', participant.participant.name, 'to', participant.x2, participant.y2);
      dbController.upsertItem("participantPosition", {...participant, x: participant.x2, y: participant.y2});
    }
  }

  function updatePropPosition(id: string, x: number, y: number) {
    var prop = propPositions.find(x => x.id === id);
    if (prop) {
      prop.x2 = (prop.x * GRID_SIZE + x)/GRID_SIZE;
      prop.y2 = (prop.y * GRID_SIZE + y)/GRID_SIZE; // todo: fix off by 2m
      console.log('Updated position for', prop.prop.name, 'to', prop.x2, prop.y2);
      dbController.upsertItem("propPosition", {...prop, x: prop.x2, y: prop.y2});
    }
  }

  // todo: redundant, fix
  function selectParticipant(participant: ParticipantPosition, forceSelect?: boolean) {
    if (selectedItem === null || !strEquals(selectedItem.id, participant.id)) {
      updateState({selectedItem: participant});
      participantPositions.filter(x => x.isSelected).forEach(x => x.isSelected = false);
      propPositions.filter(x => x.isSelected).forEach(x => x.isSelected = false);
      participant.isSelected = true;
    } else if (!forceSelect) {
      updateState({selectedItem: null});
      participant.isSelected = false;
    }
  }

  // todo: redundant, fix
  function selectProp(prop: PropPosition, forceSelect?: boolean) {
    if (selectedItem === null || !strEquals(selectedItem.id, prop.id)) {
      updateState({selectedItem: prop});
      participantPositions.filter(x => x.isSelected).forEach(x => x.isSelected = false);
      propPositions.filter(x => x.isSelected).forEach(x => x.isSelected = false);
      prop.isSelected = true;
    } else if (!forceSelect) {
      updateState({selectedItem: null});
      prop.isSelected = false;
    }
  }

  return (
    <div>
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
                colour={placement.color ?? objectColorSettings.purpleLight} 
                length={placement.prop.length} 
                isSelected={placement.isSelected}
                startX={placement.x * GRID_SIZE} 
                startY={placement.y * GRID_SIZE} 
                updatePosition={(x, y) => updatePropPosition(placement.id, x, y)}
                onClick={(forceSelect?: boolean) => selectProp(placement, forceSelect)} 
              />
            )
          } 
          { participantPositions.map(placement => 
              (<ParticipantObject 
                key={placement.id}
                name={placement.participant.name} 
                colour={categories.find(x => strEquals(x.id, placement.category?.id))?.color || objectColorSettings["amberLight"]} 
                startX={placement.x * GRID_SIZE} 
                startY={placement.y * GRID_SIZE}
                isSelected={placement.isSelected}
                updatePosition={(x, y) => updateParticipantPosition(placement.id, x, y)}
                onClick={(forceSelect?: boolean) => selectParticipant(placement, forceSelect)} 
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