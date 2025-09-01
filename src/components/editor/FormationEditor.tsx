import React, { useContext, useEffect, useRef } from "react";
import { Layer, Stage, Transformer } from "react-konva";
import { objectColorSettings } from "../../themes/colours.ts";
import ParticipantObject from "./formationObjects/ParticipantObject.tsx";
import PropObject from "./formationObjects/PropObject.tsx";
import { DEFAULT_WIDTH, GRID_MARGIN_Y, GRID_SIZE } from "../../data/consts.ts";
import { PositionContext } from "../../contexts/PositionContext.tsx";
import { UserContext } from "../../contexts/UserContext.tsx";
import FormationGrid from "./FormationGrid.tsx";
import { ParticipantPosition, PropPosition } from "../../models/Position.ts";
import { strEquals } from "../helpers/GlobalHelper.ts";
import { dbController } from "../../data/DBProvider.tsx";
import { CategoryContext } from "../../contexts/CategoryContext.tsx";
import { songList } from "../../data/ImaHitotabi.ts";
import { useState } from "react";

export interface FormationEditorProps {
  height: number,
  width: number,
}

export default function FormationEditor(props: FormationEditorProps) {
  const userContext = useContext(UserContext)
  const {selectedItem, currentSections, compareMode, updateState} = useContext(UserContext);
  const {participantPositions, propPositions} = useContext(PositionContext);
  const [previousSectionId, setPreviousSectionId] = useState<string | undefined>("");
  const [nextSectionId, setNextSectionId] = useState<string | undefined>("");
  const {categories} = useContext(CategoryContext);
  const canvasHeight = (props.height + GRID_MARGIN_Y * 2) * GRID_SIZE;
  const canvasWidth = DEFAULT_WIDTH * GRID_SIZE;
  const transformerRef = useRef(null);
  
  useEffect(() => {
    if (compareMode === "previous") {
      const previousSection = userContext?.selectedSection && songList[0].sections.find(x => x.order === (userContext.selectedSection!.songSection.order - 1))?.id;
      const section = currentSections.find(x => strEquals(x.songSectionId, previousSection))?.id;
      setPreviousSectionId(section);
    } else if (compareMode === "next") {
      const nextSection = userContext?.selectedSection && songList[0].sections.find(x => x.order === (userContext.selectedSection!.songSection.order + 1))?.id;
      const section = currentSections.find(x => strEquals(x.songSectionId, nextSection))?.id;
      setNextSectionId(section);
    }
  }, [userContext?.selectedSection, userContext?.compareMode]);
  
  function updateParticipantPosition(id: string, x: number, y: number) {
    var participant = participantPositions.find(x => x.id === id);
    if (participant) {
      participant.x2 = (participant.x * GRID_SIZE + x)/GRID_SIZE;
      participant.y2 = (participant.y * GRID_SIZE + y)/GRID_SIZE; // todo: fix off by 2m
      dbController.upsertItem("participantPosition", {...participant, x: participant.x2, y: participant.y2});
    }
  }

  function updatePropPosition(id: string, x: number, y: number) {
    var prop = propPositions.find(x => x.id === id);
    if (prop) {
      prop.x2 = (prop.x * GRID_SIZE + x)/GRID_SIZE;
      prop.y2 = (prop.y * GRID_SIZE + y)/GRID_SIZE; // todo: fix off by 2m
      dbController.upsertItem("propPosition", {...prop, x: prop.x2, y: prop.y2});
    }
  }

  function getPixelX(gridX: number): number {
    return gridX * GRID_SIZE; // todo
  }

  function getPixelY(gridY: number): number {
    return gridY * GRID_SIZE; // todo
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
      <Stage
        width={canvasWidth}
        height={canvasHeight}
        onClick={(event) => {
          if (strEquals(typeof event.target, Stage.name)) {
            updateState({selectedItem: null});
            participantPositions.filter(x => x.isSelected).forEach(x => x.isSelected = false);
            propPositions.filter(x => x.isSelected).forEach(x => x.isSelected = false);
          }
        }}>
        <FormationGrid
          canvasHeight={canvasHeight}
          canvasWidth={canvasWidth}
          height={props.height}
          width={props.width}/>
        { compareMode === "previous" && previousSectionId &&
          <Layer opacity={0.5}>
            {
              propPositions
                .filter(placement => strEquals(placement.formationSceneId, previousSectionId))
                .map(placement =>
                  <PropObject 
                    key={placement.id}
                    name={placement.prop.name} 
                    colour={placement.color ?? objectColorSettings.purpleLight} 
                    length={placement.prop.length} 
                    isSelected={placement.isSelected}
                    startX={getPixelX(placement.x)} 
                    startY={getPixelY(placement.y)} 
                    updatePosition={(x, y) => updatePropPosition(placement.id, x, y)}
                    onClick={(forceSelect?: boolean) => selectProp(placement, forceSelect)} 
                  />
                )
            } 
            { participantPositions
                .filter(placement => strEquals(placement.formationSceneId, previousSectionId))
                .map(placement => 
                  <ParticipantObject 
                    key={placement.id}
                    name={placement.participant.name} 
                    colour={categories.find(x => strEquals(x.id, placement.category?.id))?.color || objectColorSettings["amberLight"]} 
                    startX={getPixelX(placement.x)} 
                    startY={getPixelY(placement.y)}
                    isSelected={placement.isSelected}
                    updatePosition={(x, y) => updateParticipantPosition(placement.id, x, y)}
                    onClick={(forceSelect?: boolean) => selectParticipant(placement, forceSelect)} 
                  />
              )
            }
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
            propPositions
              .filter(placement => strEquals(userContext.selectedSection?.id, placement.formationSceneId))
              .map(placement =>
                <PropObject 
                  key={placement.id}
                  name={placement.prop.name} 
                  colour={placement.color ?? objectColorSettings.purpleLight} 
                  length={placement.prop.length} 
                  isSelected={placement.isSelected}
                  startX={getPixelX(placement.x)} 
                  startY={getPixelY(placement.y)} 
                  updatePosition={(x, y) => updatePropPosition(placement.id, x, y)}
                  onClick={(forceSelect?: boolean) => selectProp(placement, forceSelect)}
                  draggable 
                />
              )
          } 
          { participantPositions
              .filter(placement => strEquals(userContext.selectedSection?.id, placement.formationSceneId))
              .map(placement => 
                <ParticipantObject 
                  key={placement.id}
                  name={placement.participant.name} 
                  colour={categories.find(x => strEquals(x.id, placement.category?.id))?.color || objectColorSettings["amberLight"]} 
                  startX={getPixelX(placement.x)} 
                  startY={getPixelY(placement.y)}
                  isSelected={placement.isSelected}
                  updatePosition={(x, y) => updateParticipantPosition(placement.id, x, y)}
                  onClick={(forceSelect?: boolean) => selectParticipant(placement, forceSelect)} 
                  draggable
                />
            )
          }
        </Layer>
        { compareMode === "next" && nextSectionId &&
          <Layer opacity={0.5}>
          {
            propPositions
              .filter(placement => strEquals(placement.formationSceneId, nextSectionId))
              .map(placement =>
                <PropObject 
                  key={placement.id}
                  name={placement.prop.name} 
                  colour={placement.color ?? objectColorSettings.purpleLight} 
                  length={placement.prop.length} 
                  isSelected={placement.isSelected}
                  startX={getPixelX(placement.x)} 
                  startY={getPixelY(placement.y)} 
                  updatePosition={(x, y) => updatePropPosition(placement.id, x, y)}
                  onClick={(forceSelect?: boolean) => selectProp(placement, forceSelect)} 
                />
              )
          } 
          { participantPositions
              .filter(placement => strEquals(placement.formationSceneId, nextSectionId))
              .map(placement => 
                <ParticipantObject 
                  key={placement.id}
                  name={placement.participant.name} 
                  colour={categories.find(x => strEquals(x.id, placement.category?.id))?.color || objectColorSettings["amberLight"]} 
                  startX={getPixelX(placement.x)} 
                  startY={getPixelY(placement.y)}
                  isSelected={placement.isSelected}
                  updatePosition={(x, y) => updateParticipantPosition(placement.id, x, y)}
                  onClick={(forceSelect?: boolean) => selectParticipant(placement, forceSelect)} 
                />
            )
          }
        </Layer>
        }
      </Stage>
    </div>
  )
}