import React, { useContext, useEffect, useImperativeHandle, useRef } from "react";
import { Layer, Stage, Transformer } from "react-konva";
import { objectColorSettings } from "../../themes/colours.ts";
import ParticipantObject from "./formationObjects/ParticipantObject.tsx";
import PropObject from "./formationObjects/PropObject.tsx";
import { DEFAULT_WIDTH, GRID_MARGIN_Y } from "../../data/consts.ts";
import { PositionContext } from "../../contexts/PositionContext.tsx";
import { UserContext } from "../../contexts/UserContext.tsx";
import FormationGrid from "./FormationGrid.tsx";
import { NotePosition, ParticipantPosition, PropPosition } from "../../models/Position.ts";
import { isNullOrUndefined, strEquals } from "../helpers/GlobalHelper.ts";
import { dbController } from "../../data/DBProvider.tsx";
import { CategoryContext } from "../../contexts/CategoryContext.tsx";
import { useState } from "react";
import NoteObject from "./formationObjects/NoteObject.tsx";
import { AnimationContext } from "../../contexts/AnimationContext.tsx";
import { FormationContext } from "../../contexts/FormationContext.tsx";
import Konva from "konva";
import { FormationType } from "../../models/Formation.ts";
import { getAnimationPaths } from "../helpers/AnimationHelper.ts";
import jsPDF from "jspdf";
import { ExportContext } from "../../contexts/ExportContext.tsx";

export interface FormationEditorProps {
  height: number,
  width: number,
  ref: React.Ref<any>,
}

export default function FormationEditor(props: FormationEditorProps) {
  const stageRef = useRef(null);
  const userContext = useContext(UserContext);
  const {paths, isAnimating, updateAnimationContext} = useContext(AnimationContext);
  const {updateExportContext, exportName} = useContext(ExportContext);
  const {participantList, propList, noteList} = useContext(FormationContext);
  const {selectedFormation, selectedItem, enableAnimation, currentSections, compareMode, updateState, isLoading, gridSize} = useContext(UserContext);
  const {participantPositions, propPositions} = useContext(PositionContext);
  const [previousSectionId, setPreviousSectionId] = useState<string | null | undefined>("");
  const [nextSectionId, setNextSectionId] = useState<string | null | undefined>("");
  const {categories} = useContext(CategoryContext);
  const canvasHeight = (props.height + GRID_MARGIN_Y * 2) * gridSize;
  const canvasWidth = DEFAULT_WIDTH * gridSize;
  const transformerRef = useRef(null);
  const animationLayerRef = useRef<Konva.Layer>(null);
  const animationRef = useRef<React.RefObject<Konva.Group | null>[]>([]);

  participantList
    .sort((a, b) => a.id.localeCompare(b.id))
    .forEach((_, index) => 
      animationRef.current[index] = React.createRef<Konva.Group>()
    );

  useEffect(() => {
    if(
      !enableAnimation ||
      isNullOrUndefined(userContext.previousSectionId) ||
      isNullOrUndefined(userContext.selectedSection)) return;

    updateState({isLoading: true});
    getAnimationPaths([userContext.previousSectionId!, userContext.selectedSection!.id], gridSize)
      .then((animationPaths) => {
        updateState({isLoading: false});
        updateAnimationContext({paths: animationPaths, isAnimating: true});
      });
  }, [userContext.previousSectionId]);
  
  useEffect(() => {
    if (compareMode === "previous") {
      const previousSectionId = userContext?.selectedSection && currentSections.find(x => x.order === (userContext!.selectedSection!.order - 1))?.id;
      const sectionId = previousSectionId && currentSections.find(x => strEquals(x.id, previousSectionId))?.id;
      setPreviousSectionId(sectionId);
    } else if (compareMode === "next") {
      const nextSectionId = userContext?.selectedSection && currentSections.find(x => x.order === (userContext!.selectedSection!.order + 1))?.id;
      const sectionId = nextSectionId && currentSections.find(x => strEquals(x.id, nextSectionId))?.id;
      setNextSectionId(sectionId);
    }
  }, [userContext?.selectedSection, userContext?.compareMode]);

  useImperativeHandle(props.ref, () => ({
    async exportToPdf() {
      if (isNullOrUndefined(stageRef.current)) return;
      updateExportContext({isExporting: true, exportProgress: 0});
      var stage = (stageRef.current! as Konva.Stage);
      const pdf = new jsPDF({
        orientation: stage.width() > stage.height() ? "landscape" : "portrait",
        unit: "px",
        format: [stage.width()/2, stage.height()/2]});

      for (let i = 0; i < currentSections.length; i++) {
        const section = currentSections[i];
    
        updateState({
          selectedSection: section,
          previousSectionId: null,
          selectedItem: null,
          compareMode: "none",
        });
    
        await new Promise<void>((resolve) => {
          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              resolve();
            });
          });
        });
    
        console.log("Exporting section", section.displayName);
    
        // todo: manually draw all objects to reduce file size
        const dataUrl = stage.toDataURL({ pixelRatio: 2 });
        // note on pixel ratio: using 2 here has a good quality, but the file size can be quite large
        // using 1 gives a smaller file size, but the quality is quite poor
    
        // todo: support japanese
        // pdf.setLanguage("ja");
        // https://qiita.com/hidepon4649/items/df7dbea48c4dd3049ef9

        pdf.addImage(
          dataUrl,
          0,
          0,
          stage.width()/2,
          stage.height()/2,
        );

        updateExportContext({exportProgress: Math.round(((i + 1) / currentSections.length) * 100)});

        if (i < currentSections.length - 1) {
          pdf.addPage();
        }
      }
    
      pdf.save(exportName ?? "formation.pdf"); // todo this is a little broken, will not update the name properly
      updateExportContext({isExporting: false, exportProgress: 100});
    }
  }));

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

  function getPixel(gridX: number, margin?: number): number {
    return gridX * gridSize - (margin ?? 0);
  }

  function selectItem(
    item: ParticipantPosition | PropPosition | NotePosition | null,
    forceSelect?: boolean
  ) {
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
    if(!isAnimating) return;
    updateState({isLoading: false});

    const steps = 50;

    const animationPromises: Promise<void>[] = [];

    Object.entries(paths)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .forEach(([key, pathData], index) => {
        const path = new Konva.Path({
          x: 0,
          y: 0,
          data: pathData,
        });

        const pathLen = path.getLength();
        const step = pathLen / steps;
        let pos = 0;

        // Wrap each animation in a Promise
        const animPromise = new Promise<void>((resolve) => {
          const anim = new Konva.Animation((frame) => {
            pos++;

            const pt = path.getPointAtLength(pos * step);
            if (pt && animationRef?.current[index]) {
              animationRef.current[index]?.current?.position({ x: pt.x, y: pt.y });
            }

            if (pos >= steps) {
              anim.stop();
              resolve();
            }
          });

          anim.start();
        });

        animationPromises.push(animPromise);
      });

    Promise.all(animationPromises).then(() => {
      updateAnimationContext({isAnimating: false});
    });
  }, [isAnimating]);

  return (
    <div>
      <Stage
        ref={stageRef}
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
        { compareMode === "previous" && previousSectionId &&
          <Layer opacity={0.5}>
            {
              propPositions
                .filter(placement => strEquals(placement.formationSectionId, previousSectionId))
                .map(placement =>
                  <PropObject 
                    key={placement.id}
                    name={propList.find(x => strEquals(placement.propId, x.id))!.name}
                    colour={propList.find(x => strEquals(placement.propId, x.id))!.color ?? objectColorSettings.purpleLight} 
                    length={propList.find(x => strEquals(placement.propId, x.id))!.length}
                    startX={getPixel(placement.x)} 
                    startY={getPixel(placement.y)}
                    rotation={placement.angle} 
                  />
                )
            } 
            { participantPositions
                .filter(placement => strEquals(placement.formationSectionId, previousSectionId))
                .map(placement => 
                  <ParticipantObject 
                    key={placement.id}
                    name={participantList.find(x => strEquals(placement.participantId, x.id))?.displayName!} 
                    colour={categories.find(x => strEquals(x.id, placement.categoryId))?.color || objectColorSettings["amberLight"]} 
                    startX={getPixel(placement.x)} 
                    startY={getPixel(placement.y)}
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
            alwaysBold
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
          { !isLoading && !isAnimating &&
            noteList
              .filter(note => strEquals(userContext.selectedSection?.id, note.formationSectionId))
              .map(note => 
                <NoteObject 
                  key={note.id}
                  colour={note.color ?? objectColorSettings.blueLight} 
                  startX={getPixel(note.x)} 
                  startY={getPixel(note.y)}
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
          { !isLoading && !isAnimating &&
            propPositions
              .filter(placement => strEquals(userContext.selectedSection?.id, placement.formationSectionId))
              .map(placement =>
                <PropObject 
                  key={placement.id}
                  name={propList.find(x => strEquals(placement.propId, x.id))!.name}
                  colour={propList.find(x => strEquals(placement.propId, x.id))!.color ?? objectColorSettings.purpleLight} 
                  length={propList.find(x => strEquals(placement.propId, x.id))!.length}
                  isSelected={placement.isSelected}
                  startX={getPixel(placement.x)} 
                  startY={getPixel(placement.y)} 
                  updatePosition={(x, y) => updatePropPosition(placement.id, x, y)}
                  onClick={(forceSelect?: boolean) => selectItem(placement, forceSelect)}
                  draggable={!isAnimating}
                  rotation={placement.angle} 
                  onRotate={(angle, x, y) => updatePropRotation(placement.id, angle, x, y)}
                  />
              )
          } 
          { !isLoading && !isAnimating && participantPositions
              .filter(placement => strEquals(userContext.selectedSection?.id, placement.formationSectionId))
              .map(placement => 
                <ParticipantObject 
                  key={placement.id}
                  name={participantList.find(x=> strEquals(placement.participantId, x.id))?.displayName!} 
                  colour={categories.find(x => strEquals(x.id, placement.categoryId))?.color || objectColorSettings["amberLight"]} 
                  startX={getPixel(placement.x)} 
                  startY={getPixel(placement.y)}
                  isSelected={placement.isSelected}
                  updatePosition={(x, y) => updateParticipantPosition(placement.id, x, y)}
                  onClick={(forceSelect?: boolean) => selectItem(placement, forceSelect)} 
                  draggable={!isAnimating}
                />
            )
          }
        </Layer>
        { !isLoading && isAnimating &&
          <Layer useRef={animationLayerRef}>
            {participantPositions
              .filter(placement => strEquals(userContext.selectedSection?.id, placement.formationSectionId))
              .sort((a, b) => a.participantId.localeCompare(b.participantId))
              .map((placement, index) => 
                <ParticipantObject 
                  key={placement.id}
                  name={participantList.find(x=> strEquals(placement.participantId, x.id))?.displayName!} 
                  colour={categories.find(x => strEquals(x.id, placement.categoryId))?.color || objectColorSettings["amberLight"]} 
                  startX={0} 
                  startY={0}
                  isSelected={false}
                  ref={animationRef.current[index]}
                />
            )}
          </Layer>
        }
        { !isAnimating &&  compareMode === "next" && nextSectionId &&
          <Layer opacity={0.5}>
          {
            propPositions
              .filter(placement => strEquals(placement.formationSectionId, nextSectionId))
              .map(placement =>
                <PropObject 
                  key={placement.id}
                  name={propList.find(x => strEquals(placement.propId, x.id))!.name}
                  colour={propList.find(x => strEquals(placement.propId, x.id))!.color ?? objectColorSettings.purpleLight} 
                  length={propList.find(x => strEquals(placement.propId, x.id))!.length}
                  startX={getPixel(placement.x)} 
                  startY={getPixel(placement.y)} 
                  rotation={placement.angle} 
                  />
              )
          } 
          { participantPositions
              .filter(placement => strEquals(placement.formationSectionId, nextSectionId))
              .map(placement => 
                <ParticipantObject 
                  key={placement.id}
                  name={participantList.find(x=> strEquals(placement.participantId, x.id))?.displayName!} 
                  colour={categories.find(x => strEquals(x.id, placement.categoryId))?.color || objectColorSettings["amberLight"]} 
                  startX={getPixel(placement.x)} 
                  startY={getPixel(placement.y)}
                />
            )
          }
        </Layer>
        }
      </Stage>
    </div>
  )
}