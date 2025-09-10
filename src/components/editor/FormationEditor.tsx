import React, { useContext, useEffect, useImperativeHandle, useRef } from "react";
import { Layer, Stage, Transformer } from "react-konva";
import { basePalette, objectColorSettings } from "../../themes/colours.ts";
import ParticipantObject from "./formationObjects/ParticipantObject.tsx";
import PropObject from "./formationObjects/PropObject.tsx";
import { DEFAULT_WIDTH, GRID_MARGIN_Y } from "../../data/consts.ts";
import { PositionContext } from "../../contexts/PositionContext.tsx";
import { UserContext } from "../../contexts/UserContext.tsx";
import FormationGrid from "./FormationGrid.tsx";
import { createPosition, getAllIds, getFromPositionType, NotePosition, ParticipantPosition, Position, PositionType, PropPosition } from "../../models/Position.ts";
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
  const {updateExportContext} = useContext(ExportContext);
  const {participantList, propList, noteList, updateFormationContext} = useContext(FormationContext);
  const formationContext = useContext(FormationContext);
  const {selectedFormation, selectedSection, selectedItems, enableAnimation, currentSections, compareMode, updateState, isLoading, gridSize} = useContext(UserContext);
  const {participantPositions, propPositions, updatePositionState} = useContext(PositionContext);
  const [ghostParticipants, setGhostParticipants] = useState<ParticipantPosition[]>([]);
  const [ghostProps, setGhostProps] = useState<PropPosition[]>([]);
  const {categories} = useContext(CategoryContext);
  const canvasHeight = (props.height + GRID_MARGIN_Y * 2) * gridSize;
  const canvasWidth = DEFAULT_WIDTH * gridSize;
  const layerRef = useRef<Konva.Layer>(null);
  const transformerRef = useRef<Konva.Transformer>(null);
  const transformerRef3 = useRef<Konva.Transformer>(null);
  const animationLayerRef = useRef<Konva.Layer>(null);
  const animationRef = useRef<React.RefObject<Konva.Group | null>[]>([]);
  const participantRef = useRef<React.RefObject<Konva.Group | null>[]>([]);
  const propRef = useRef<React.RefObject<Konva.Group | null>[]>([]);
  const noteRef = useRef<React.RefObject<Konva.Group | null>[]>([]);
  const testRef = useRef<Konva.Arrow>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  useEffect(() => {
    if(transformerRef?.current && layerRef?.current){
      console.log(layerRef!.current!)
      const nodes = selectedIds.map((id) => layerRef!.current!.findOne("#" + id)).filter(x => x !== undefined);
      transformerRef?.current!.nodes(nodes);
      console.log(nodes);
    }
  }, [selectedIds]);

  participantList
    .sort((a, b) => a.id.localeCompare(b.id))
    .forEach((_, index) => 
      animationRef.current[index] = React.createRef<Konva.Group>()
    );
  participantList
    .sort((a, b) => a.id.localeCompare(b.id))
    .forEach((_, index) => 
      participantRef.current[index] = React.createRef<Konva.Group>()
    );
  propList
    .sort((a, b) => a.id.localeCompare(b.id))
    .forEach((_, index) => 
      propRef.current[index] = React.createRef<Konva.Group>()
    );
  noteList
    .sort((a, b) => a.id.localeCompare(b.id))
    .forEach((_, index) => 
      noteRef.current[index] = React.createRef<Konva.Group>()
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
    var ghostId = "";
    if (compareMode === "previous") {
      const previousSectionId = userContext?.selectedSection &&
        currentSections.find(x => x.order === (userContext!.selectedSection!.order - 1))?.id;
      if (previousSectionId) ghostId = previousSectionId;
    } else if (compareMode === "next") {
      const nextSectionId = userContext?.selectedSection &&
      currentSections.find(x => x.order === (userContext!.selectedSection!.order + 1))?.id;
      if (nextSectionId) ghostId = nextSectionId;
    }

    if (compareMode !== "none" && ghostId) {
      Promise.all([
        dbController.getByFormationSectionId("participantPosition", ghostId),
        dbController.getByFormationSectionId("propPosition", ghostId),
      ]).then(([participants, props]) => {
        setGhostParticipants(participants as Array<ParticipantPosition>);
        setGhostProps(props as Array<PropPosition>);
      });
    } else {
      setGhostParticipants([]);
      setGhostProps([]);
    }
  }, [userContext?.selectedSection, userContext?.compareMode, formationContext?.participantList]);

  // todo: remove empty grid gap when switching sections
  useEffect(() => {
    if(isNullOrUndefined(selectedSection)) return;
    
    if(enableAnimation && userContext.previousSectionId &&userContext.selectedSection) {
      updateState({isLoading: true});
      getAnimationPaths([userContext.previousSectionId!, userContext.selectedSection!.id], gridSize)
        .then((animationPaths) => {
          updateState({isLoading: false});
          updateAnimationContext({paths: animationPaths, isAnimating: true});
        });
    }

    Promise.all(
      [ dbController.getByFormationSectionId("participantPosition", selectedSection!.id),
        dbController.getByFormationSectionId("propPosition", selectedSection!.id),
        dbController.getByFormationSectionId("notePosition", selectedSection!.id),
      ])
      .then(([participantPosition, propPosition, notePosition]) => {
      try {
        var participantPositionList = participantPosition as Array<ParticipantPosition>;
        
        var propPositionList = propPosition as Array<PropPosition>;

        var notePositionList = notePosition as Array<NotePosition>;
        
        updatePositionState({
          participantPositions: participantPositionList,
          propPositions: propPositionList
        });
        updateFormationContext({
          noteList: notePositionList
        });
        
        participantPositions.forEach(p => { // todo: remove, probably
          p.x2 = p.x;
          p.y2 = p.y;
        });
      } catch (e) {
        console.error('Error parsing user from localStorage:', e);
      }
    });
  }, [userContext.selectedSection]);

  useImperativeHandle(props.ref, () => ({
    async exportToPdf(exportName: string) {
      if (isNullOrUndefined(stageRef.current)) return;
      updateExportContext({isExporting: true, exportProgress: 0});
      var stage = (stageRef.current! as Konva.Stage);
      const pdf = new jsPDF({
        orientation: stage.width() > stage.height() ? "landscape" : "portrait",
        unit: "px",
        format: [stage.width()/2, stage.height()/2]});

      console.log("generating ", exportName);
      for (let i = 0; i < currentSections.length; i++) {
        const section = currentSections[i];
    
        updateState({
          selectedSection: section,
          previousSectionId: null,
          selectedItems: [],
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
    
      pdf.save(exportName ?? "formation.pdf");
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
    type: PositionType,
    forceSelect?: boolean,
    multiSelect?: boolean,
    ref?: React.Ref<Konva.Group>
  ) {
    if (item === null) return;

    if (multiSelect) {
      var newList: Position[] = [];
      if (!selectedItems.map(x => getFromPositionType(x).id).includes(item.id)) {
        newList = [...selectedItems, createPosition(item)];
        updateState({selectedItems: newList});
      } else {
        newList = [...selectedItems.filter(x => x.type !== type || !strEquals(getFromPositionType(x).id, item.id))];
        updateState({selectedItems: newList});
      }
      setSelectedIds(getAllIds(newList));
    } else {
      // not already selected
      if (selectedItems.length === 0
        || !selectedItems.map(x => getFromPositionType(x).id).includes(item.id)) {
        updateState({selectedItems: [createPosition(item)]});
        setSelectedIds([item.id]);
      } else if (!forceSelect) {
        updateState({selectedItems: []});
        setSelectedIds([]);
      }
    }
  }

  useEffect(() => {
    if(!isAnimating) return;
    updateState({isLoading: false});

    const steps = 30;

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
          if (event.target === stageRef.current) {
            updateState({selectedItems: []});
            if(selectedIds.length > 0) {
              setSelectedIds([]);
            }
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
        { compareMode !== "none" &&
          <Layer opacity={0.5}>
            {
              ghostProps
                .map(placement =>
                  <PropObject 
                    id={"ghost" + placement.id}
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
            { ghostParticipants
                .map(placement => 
                  <ParticipantObject 
                    id={"ghost" + placement.id}
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
        <Layer ref={layerRef} >
          {/* <BaseFormationObject draggable startX={100} startY={100} isSelected onClick={() => { console.log("parentclicked")}}>
            <BaseFormationObject startX={100} startY={100} onClick={() => { console.log("child1clicked")}}>
              <PropObject name="test" length={1} startX={0} startY={0} rotation={0} colour={objectColorSettings.blueLight}/>
            </BaseFormationObject><BaseFormationObject startX={100} startY={100} onClick={() => { console.log("child2clicked")}}>
              <PropObject name="test" length={1} startX={100} startY={100} rotation={0} colour={objectColorSettings.amberLight}/>
            </BaseFormationObject>
          </BaseFormationObject> */}
          <NoteObject
            id="sectionName"
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
          { !isAnimating &&
            noteList
              .sort((a, b) => a.id.localeCompare(b.id))
              .map((note, index) => 
                <NoteObject 
                  id={note.id}
                  key={note.id}
                  colour={note.color ?? objectColorSettings.blueLight} 
                  startX={getPixel(note.x)} 
                  startY={getPixel(note.y)}
                  height={note.height}
                  length={note.width}
                  label={note.label}
                  text={note.text}
                  borderRadius={note.borderRadius}
                  fontSize={gridSize * note.fontGridRatio}
                  updatePosition={(x, y) => updateNotePosition(note.id, x, y)}
                  onClick={(forceSelect?: boolean, multiSelect?: boolean) => selectItem(note, PositionType.note, forceSelect, multiSelect, noteRef.current[index])} 
                  alwaysBold={note.alwaysBold}
                  draggable
                />
            )
          }
          { !isAnimating &&
            propPositions
              .sort((a, b) => a.propId.localeCompare(b.propId))
              .map((placement, index) =>
                <PropObject 
                  id={placement.id}
                  key={placement.id}
                  name={propList.find(x => strEquals(placement.propId, x.id))!.name}
                  colour={propList.find(x => strEquals(placement.propId, x.id))!.color ?? objectColorSettings.purpleLight} 
                  length={propList.find(x => strEquals(placement.propId, x.id))!.length}
                  startX={getPixel(placement.x)} 
                  startY={getPixel(placement.y)} 
                  updatePosition={(x, y) => updatePropPosition(placement.id, x, y)}
                  onClick={(forceSelect?: boolean, multiSelect?: boolean) => selectItem(placement, PositionType.prop, forceSelect, multiSelect, propRef.current[index])}
                  draggable={!isAnimating}
                  rotation={placement.angle} 
                  onRotate={(angle, x, y) => updatePropRotation(placement.id, angle, x, y)}
                  />
              )
          } 
          { !isAnimating && participantPositions
              .sort((a, b) => a.participantId.localeCompare(b.participantId))
              .map((placement, index) => 
                <ParticipantObject 
                  id = {placement.id}
                  key={placement.id}
                  name={participantList.find(x=> strEquals(placement.participantId, x.id))?.displayName!} 
                  colour={categories.find(x => strEquals(x.id, placement.categoryId))?.color || objectColorSettings["amberLight"]} 
                  startX={getPixel(placement.x)} 
                  startY={getPixel(placement.y)}
                  updatePosition={(x, y) => updateParticipantPosition(placement.id, x, y)}
                  onClick={(forceSelect?: boolean, multiSelect?: boolean) => {selectItem(placement, PositionType.participant, forceSelect, multiSelect, participantRef.current[index])}} 
                  draggable={!isAnimating}
                />
            )
          }
          <Transformer
            flipEnabled={false}
            ref={transformerRef}
            resizeEnabled={false}
            rotateEnabled={false} // todo implement in single select prop etc.
            borderStrokeWidth={2}
            borderStroke={basePalette.primary.main}
            anchorStrokeWidth={2}
            anchorStroke={basePalette.primary.main}
            rotationSnaps={[
              0, 15, 30, 45, 60, 75, 90, 105, 120, 135, 150, 165,
              180, 195, 210, 225, 240, 255,
              270, 285, 300, 315, 330, 345, 360
            ]}
            rotationSnapTolerance={10}
            onTransformEnd={(event) => { 
              console.log("rotation is broken");
              console.log(event.target);
              //props.onTransform?.(event.target);
            }}
            />
        {/* <Group>
          <Arrow
            strokeScaleEnabled={false}
            draggable
            ref={testRef} x={0} y={0}
            strokeWidth={10}
            stroke={objectPalette.blue.light}
            points={[100, 100, 100, 100, 200, 100]}
            fill={basePalette.primary.main}></Arrow>
          <Transformer
            flipEnabled={false}
            ref={transformerRef3}
            boundBoxFunc={(oldBox, newBox) => {
              // limit resize
              if (newBox.height > 25 || newBox.height < 20) {
                return oldBox;
              }
              return newBox;
            }}/>
          </Group> */}
        </Layer>
        { !isLoading && isAnimating &&
          <Layer useRef={animationLayerRef}>
            {participantPositions
              .sort((a, b) => a.participantId.localeCompare(b.participantId))
              .map((placement, index) => 
                <ParticipantObject 
                  id={"animate" + placement.id}
                  key={placement.id}
                  name={participantList.find(x=> strEquals(placement.participantId, x.id))?.displayName!} 
                  colour={categories.find(x => strEquals(x.id, placement.categoryId))?.color || objectColorSettings["amberLight"]} 
                  startX={0} 
                  startY={0}
                  ref={animationRef.current[index]}
                />
            )}
          </Layer>
        }
      </Stage>
    </div>
  )
}