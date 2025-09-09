import React, { useContext, useEffect, useRef } from "react";
import { Layer, Path, Stage, Transformer } from "react-konva";
import { objectColorSettings, objectPalette } from "../../themes/colours.ts";
import ParticipantObject from "./formationObjects/ParticipantObject.tsx";
import PropObject from "./formationObjects/PropObject.tsx";
import { DEFAULT_WIDTH, GRID_MARGIN_Y } from "../../data/consts.ts";
import { PositionContext } from "../../contexts/PositionContext.tsx";
import { UserContext } from "../../contexts/UserContext.tsx";
import FormationGrid from "./FormationGrid.tsx";
import { NotePosition, ParticipantPosition, PropPosition } from "../../models/Position.ts";
import { strEquals } from "../helpers/GlobalHelper.ts";
import { dbController } from "../../data/DBProvider.tsx";
import { CategoryContext } from "../../contexts/CategoryContext.tsx";
import { useState } from "react";
import NoteObject from "./formationObjects/NoteObject.tsx";
import { AnimationContext } from "../../contexts/AnimationContext.tsx";
import { FormationContext } from "../../contexts/FormationContext.tsx";
import Konva from "konva";
import { FormationType } from "../../models/Formation.ts";

export interface FormationEditorProps {
  height: number,
  width: number,
}

export default function FormationEditor(props: FormationEditorProps) {
  const canvasRef = useRef(null);
  const userContext = useContext(UserContext);
  const {paths} = useContext(AnimationContext);
  const {participantList, propList, noteList} = useContext(FormationContext);
  const {selectedFormation, selectedItem, isAnimating, currentSections, compareMode, updateState, gridSize} = useContext(UserContext);
  const {participantPositions, propPositions} = useContext(PositionContext);
  const [previousSectionId, setPreviousSectionId] = useState<string | undefined>("");
  const [nextSectionId, setNextSectionId] = useState<string | undefined>("");
  const {categories} = useContext(CategoryContext);
  const canvasHeight = (props.height + GRID_MARGIN_Y * 2) * gridSize;
  const canvasWidth = DEFAULT_WIDTH * gridSize;
  const transformerRef = useRef(null);
  const animationLayerRef = useRef<Konva.Layer>(null);
  const animationRef = useRef<{ [key: string]: Konva.Node | null }>({});
  
  useEffect(() => {
    if (compareMode === "previous") {
      const previousSectionId = userContext?.selectedSection && currentSections.find(x => x.order === (userContext!.selectedSection!.order - 1))?.id;
      const section = previousSectionId && currentSections.find(x => strEquals(x.id, previousSectionId))?.id;
      section && setPreviousSectionId(section);
    } else if (compareMode === "next") {
      const nextSectionId = userContext?.selectedSection && currentSections.find(x => x.order === (userContext!.selectedSection!.order + 1))?.id;
      const section = nextSectionId && currentSections.find(x => strEquals(x.id, nextSectionId))?.id;
      section && setNextSectionId(section);
    }
  }, [userContext?.selectedSection, userContext?.compareMode]);
  
  function updateParticipantPosition(id: string, x: number, y: number) {
    var participant = participantPositions.find(x => strEquals(x.id, id));
    if (participant) {
      participant.x2 = (participant.x * gridSize + x)/gridSize;
      participant.y2 = (participant.y * gridSize + y)/gridSize; // todo: fix off by 2m
      dbController.upsertItem("participantPosition", {...participant, x: participant.x2, y: participant.y2});
    }
  }

  function updatePropPosition(id: string, x: number, y: number) {
    var prop = propPositions.find(x => strEquals(x.id, id));
    if (prop) {
      prop.x2 = (prop.x * gridSize + x)/gridSize;
      prop.y2 = (prop.y * gridSize + y)/gridSize; // todo: fix off by 2m
      dbController.upsertItem("propPosition", {...prop, x: prop.x2, y: prop.y2});
    }
  }
  function updateNotePosition(id: string, x: number, y: number) {
    var prop = noteList.find(x => strEquals(x.id, id));
    if (prop) {
      prop.x2 = (prop.x * gridSize + x)/gridSize;
      prop.y2 = (prop.y * gridSize + y)/gridSize; // todo: fix off by 2m
      dbController.upsertItem("notePosition", {...prop, x: prop.x2, y: prop.y2});
    }
  }

  function updatePropRotation(id: string, angle: number, x: number, y: number) {
    var prop = propPositions.find(x => strEquals(x.id, id));
    if (prop) {
      prop.angle = angle;
      prop.x = x/gridSize; //(x * gridSize + x)/gridSize;
      prop.y = y/gridSize; //(y * gridSize + y)/gridSize;
      dbController.upsertItem("propPosition", prop);
    }
  }

  function getPixelX(gridX: number): number {
    return gridX * gridSize; // todo
  }

  function getPixelY(gridY: number): number {
    return gridY * gridSize; // todo
  }

  function selectItem(
    item: ParticipantPosition | PropPosition | NotePosition | null,
    forceSelect?: boolean) {
      if (item === null) return;

      if (selectedItem === null || !strEquals(selectedItem.id, item.id)) {
        updateState({selectedItem: item});
        participantPositions.filter(x => x.isSelected).forEach(x => x.isSelected = false);
        propPositions.filter(x => x.isSelected).forEach(x => x.isSelected = false);
        noteList.filter(x => x.isSelected).forEach(x => x.isSelected = false);
        item.isSelected = true;
      } else if (!forceSelect) {
        updateState({selectedItem: null});
        item.isSelected = false;
      }
    }

    useEffect(() => {
      const animations: Array<Konva.Animation> = [];
      const steps = 50;

      Object.entries(paths).forEach(([key, pathData]) => {
        const path = new Konva.Path({
          x: 0,
          y: 0,
          stroke: 'cyan',
          data: pathData,
        });

        const pathLen = path.getLength();
        const step = pathLen / steps;
        let pos = 0;

        const anim = new Konva.Animation(function (frame) {
          pos = pos + 1;
          const pt = path!.getPointAtLength(pos * step);

          if (animationRef[key]?.current) { // todo: doesn't work, ref doesn't attach to object (current is always null)
            animationRef[key].current.position({ x: pt!.x, y: pt!.y });
          }

          if (pos >= steps) {
            anim.stop(); // stop will reset the location
          }
        });

        animations.push(anim);
      });

      // Start all animations
      animations.forEach((anim) => anim.start());
    }, [userContext.isAnimating]);

  return (
    <div>
      <Stage
        ref={canvasRef}
        width={canvasWidth}
        height={canvasHeight}
        onClick={(event) => {
          if (strEquals(typeof event.currentTarget, Stage.name)) { //https://konvajs.org/docs/events/Stage_Events.html
            updateState({selectedItem: null});
            participantPositions.filter(x => x.isSelected).forEach(x => x.isSelected = false);
            propPositions.filter(x => x.isSelected).forEach(x => x.isSelected = false);
          }
        }}>
        <FormationGrid
          canvasHeight={canvasHeight}
          canvasWidth={canvasWidth}
          height={props.height}
          width={props.width}
          isParade={selectedFormation?.type === FormationType.parade}/>
        { !isAnimating && compareMode === "previous" && previousSectionId &&
          <Layer opacity={0.5}>
            {
              propPositions
                .filter(placement => strEquals(placement.formationSceneId, previousSectionId))
                .map(placement =>
                  <PropObject 
                    key={placement.id}
                    name={propList.find(x => strEquals(placement.propId, x.id))!.name}
                    colour={propList.find(x => strEquals(placement.propId, x.id))!.color ?? objectColorSettings.purpleLight} 
                    length={propList.find(x => strEquals(placement.propId, x.id))!.length}
                    startX={getPixelX(placement.x)} 
                    startY={getPixelY(placement.y)}
                    rotation={placement.angle} 
                  />
                )
            } 
            { participantPositions
                .filter(placement => strEquals(placement.formationSceneId, previousSectionId))
                .map(placement => 
                  <ParticipantObject 
                    key={placement.id}
                    name={participantList.find(x => strEquals(placement.participantId, x.id))?.displayName!} 
                    colour={categories.find(x => strEquals(x.id, placement.categoryId))?.color || objectColorSettings["amberLight"]} 
                    startX={getPixelX(placement.x)} 
                    startY={getPixelY(placement.y)}
                  />
              )
            }
          </Layer>
        }
        <Layer>
          <NoteObject
            text={userContext.selectedSection?.displayName ?? ""}
            startX={gridSize * 0.75}
            startY={gridSize * 0.25}
            height={1.1}
            length={3}
            colour={objectColorSettings.purpleLightest}
            borderRadius={10}
            fontSize={gridSize * 0.4}
            />
          <Transformer 
          ref={transformerRef}
          boundBoxFunc={(oldBox, newBox) => {
            // Limit resize
            if (newBox.width < 5 || newBox.height < 5) {
              return oldBox;
            }
            return newBox;
          }}/>
          { !isAnimating &&
            noteList
              .filter(note => strEquals(userContext.selectedSection?.id, note.formationSceneId))
              .map(note => 
                <NoteObject 
                  key={note.id}
                  colour={note.color ?? objectColorSettings.blueLight} 
                  startX={getPixelX(note.x)} 
                  startY={getPixelY(note.y)}
                  isSelected={note.isSelected}
                  height={note.height}
                  length={note.width}
                  label={note.label}
                  text={note.text}
                  borderRadius={note.borderRadius}
                  fontSize={gridSize * note.fontGridRatio}
                  updatePosition={(x, y) => updateNotePosition(note.id, x, y)}
                  onClick={(forceSelect?: boolean) => selectItem(note, forceSelect)} 
                  alwaysBold={note.alwaysBold}
                  draggable
                />
            )
          }
          {
            propPositions
              .filter(placement => strEquals(userContext.selectedSection?.id, placement.formationSceneId))
              .map(placement =>
                <PropObject 
                  key={placement.id}
                  name={propList.find(x => strEquals(placement.propId, x.id))!.name}
                  colour={propList.find(x => strEquals(placement.propId, x.id))!.color ?? objectColorSettings.purpleLight} 
                  length={propList.find(x => strEquals(placement.propId, x.id))!.length}
                  isSelected={placement.isSelected}
                  startX={getPixelX(placement.x)} 
                  startY={getPixelY(placement.y)} 
                  updatePosition={(x, y) => updatePropPosition(placement.id, x, y)}
                  onClick={(forceSelect?: boolean) => selectItem(placement, forceSelect)}
                  draggable={!isAnimating}
                  rotation={placement.angle} 
                  onRotate={(angle, x, y) => updatePropRotation(placement.id, angle, x, y)}
                  />
              )
          } 
          { participantPositions
              .filter(placement => strEquals(userContext.selectedSection?.id, placement.formationSceneId))
              .map(placement => 
                <ParticipantObject 
                  key={placement.id}
                  name={participantList.find(x=> strEquals(placement.participantId, x.id))?.displayName!} 
                  colour={categories.find(x => strEquals(x.id, placement.categoryId))?.color || objectColorSettings["amberLight"]} 
                  startX={getPixelX(placement.x)} 
                  startY={getPixelY(placement.y)}
                  isSelected={placement.isSelected}
                  updatePosition={(x, y) => updateParticipantPosition(placement.id, x, y)}
                  onClick={(forceSelect?: boolean) => selectItem(placement, forceSelect)} 
                  draggable={!isAnimating}
                />
            )
          }
         {false && <NoteObject
            label="Hello"
            text={"Legend\nabc\n\nabc"}
            colour={objectColorSettings.amberLight}
            startX={getPixelX(6)}
            startY={getPixelY(6)}
            isSelected={false}
            updatePosition={(x, y) => {/** todo */}}
            onClick={(forceSelect?: boolean) => {/** todo */}}
            draggable
            height={3}
            length={5}
            borderRadius={10}
            fontSize={12}
          />}
        </Layer>
        {isAnimating &&
          <Layer useRef={animationLayerRef}>
            {
              Object.entries(paths)
                .map(path => 
                  <Path
                    key={path[0]}
                    data={path[1]}
                    stroke={objectPalette.cyan.main}
                    strokeWidth={2}/>)
            }
            {participantPositions
              .filter(placement => strEquals(userContext.selectedSection?.id, placement.formationSceneId))
              .map(placement => 
                <ParticipantObject 
                  key={placement.id}
                  name={participantList.find(x=> strEquals(placement.participantId, x.id))?.displayName!} 
                  colour={categories.find(x => strEquals(x.id, placement.categoryId))?.color || objectColorSettings["amberLight"]} 
                  startX={0} 
                  startY={0}
                  isSelected={false}
                  ref={(ref) => animationRef.current[placement.participantId] = ref}
                />
            )}
          </Layer>
        }
        { !isAnimating &&  compareMode === "next" && nextSectionId &&
          <Layer opacity={0.5}>
          {
            propPositions
              .filter(placement => strEquals(placement.formationSceneId, nextSectionId))
              .map(placement =>
                <PropObject 
                  key={placement.id}
                  name={propList.find(x => strEquals(placement.propId, x.id))!.name}
                  colour={propList.find(x => strEquals(placement.propId, x.id))!.color ?? objectColorSettings.purpleLight} 
                  length={propList.find(x => strEquals(placement.propId, x.id))!.length}
                  startX={getPixelX(placement.x)} 
                  startY={getPixelY(placement.y)} 
                  rotation={placement.angle} 
                  />
              )
          } 
          { participantPositions
              .filter(placement => strEquals(placement.formationSceneId, nextSectionId))
              .map(placement => 
                <ParticipantObject 
                  key={placement.id}
                  name={participantList.find(x=> strEquals(placement.participantId, x.id))?.displayName!} 
                  colour={categories.find(x => strEquals(x.id, placement.categoryId))?.color || objectColorSettings["amberLight"]} 
                  startX={getPixelX(placement.x)} 
                  startY={getPixelY(placement.y)}
                />
            )
          }
        </Layer>
        }
      </Stage>
    </div>
  )
}