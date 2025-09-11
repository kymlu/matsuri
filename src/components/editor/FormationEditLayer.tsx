import React, { useContext, useEffect, useImperativeHandle, useRef, useState } from "react";
import { Layer, Transformer } from "react-konva";
import { createPosition, getAllIds, getFromPositionType, NotePosition, ParticipantPosition, Position, PositionType, PropPosition } from "../../models/Position.ts";
import { objectColorSettings, basePalette } from "../../themes/colours.ts";
import { strEquals } from "../helpers/GlobalHelper.ts";
import { getPixel } from "./FormationHelper.ts";
import NoteObject from "./formationObjects/NoteObject.tsx";
import ParticipantObject from "./formationObjects/ParticipantObject.tsx";
import PropObject from "./formationObjects/PropObject.tsx";
import Konva from "konva";
import { AnimationContext } from "../../contexts/AnimationContext.tsx";
import { CategoryContext } from "../../contexts/CategoryContext.tsx";
import { FormationContext } from "../../contexts/FormationContext.tsx";
import { PositionContext } from "../../contexts/PositionContext.tsx";
import { UserContext } from "../../contexts/UserContext.tsx";
import { dbController } from "../../data/DBProvider.tsx";
import { Ref } from "react";

export type FormationEditLayerProps = {
  ref: React.Ref<any>
}

export function FormationEditLayer(props: FormationEditLayerProps) {
  const userContext = useContext(UserContext);
  const {isAnimating} = useContext(AnimationContext);
  const {participantList, propList, noteList} = useContext(FormationContext);
  const {selectedItems, selectedSection, updateState, gridSize} = useContext(UserContext);
  const {participantPositions, propPositions, updatePositionState} = useContext(PositionContext);
  const {categories} = useContext(CategoryContext);
  const layerRef = useRef<Konva.Layer>(null);
  const transformerRef = useRef<Konva.Transformer>(null);
  const participantRef = useRef<React.RefObject<Konva.Group | null>[]>([]);
  const propRef = useRef<React.RefObject<Konva.Group | null>[]>([]);
  const noteRef = useRef<React.RefObject<Konva.Group | null>[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [currentParticipants, setCurrentPartipants] = useState<ParticipantPosition[]>([]);
  const [currentProps, setCurrentPropPositions] = useState<PropPosition[]>([]);
  const [currentNotes, setCurrentNotePositions] = useState<NotePosition[]>([]);
  const [editedPartPIds, setEditedPartPIds] = useState<string[]>([]);
  const [editedPropPIds, setEditedPropPIds] = useState<string[]>([]);
  const [editedNotePIds, setEditedNotePIds] = useState<string[]>([]);

  useImperativeHandle(props.ref, () => ({
    clearSelections() {
      updateState({selectedItems: []});
      setSelectedIds([]);
    }
  }));

  useEffect(() => {
    if(transformerRef?.current && layerRef?.current && selectedIds.length > 0){
      const nodes = selectedIds.map((id) => layerRef!.current!.findOne("#" + id)).filter(x => x !== undefined);
      transformerRef?.current!.nodes(nodes);
    } else {
      transformerRef?.current!.nodes([]);
    }
  }, [selectedIds]);

  // Reset selection when section changes
  useEffect(() => {
    setSelectedIds([]);
    participantPositions
      .filter(x => editedPartPIds.includes(x.id))
      .forEach(x => {x.x = x.x2; x.y = x.y2;})
    setEditedPartPIds([]);
    propPositions
      .filter(x => editedPropPIds.includes(x.id))
      .forEach(x => {x.x = x.x2; x.y = x.y2;})
    setEditedPropPIds([]);
    noteList
      .filter(x => editedNotePIds.includes(x.id))
      .forEach(x => {x.x = x.x2; x.y = x.y2;})
    setEditedNotePIds([]);
  }, [userContext.selectedSection]);

  // Update participant positions
  useEffect(() => {
    if (userContext.selectedSection) {
      const filtered = participantPositions
        .filter(x => strEquals(x.formationSectionId, userContext.selectedSection!.id))
        .sort((a, b) => a.participantId.localeCompare(b.participantId));
      setCurrentPartipants(filtered);
    }
  }, [userContext.selectedSection, participantPositions, participantList]);

  // Update prop positions
  useEffect(() => {
    if (userContext.selectedSection) {
      const filtered = propPositions
        .filter(x => strEquals(x.formationSectionId, userContext.selectedSection!.id))
        .sort((a, b) => a.propId.localeCompare(b.propId));
      setCurrentPropPositions(filtered);
    }
  }, [userContext.selectedSection, propPositions, propList]);

  // Update note positions
  useEffect(() => {
    if (userContext.selectedSection) {
      const filtered = noteList
        .filter(x => strEquals(x.formationSectionId, userContext.selectedSection!.id))
        .sort((a, b) => a.id.localeCompare(b.id));
      setCurrentNotePositions(filtered);
    }
  }, [userContext.selectedSection, noteList]);

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
    
  function updateParticipantPosition(id: string, x: number, y: number) {
    var participant = participantPositions.find(x => strEquals(x.id, id));
    if (participant) {
      participant.x2 = (participant.x * gridSize + x)/gridSize;
      participant.y2 = (participant.y * gridSize + y)/gridSize; // todo: fix off by 2m
      dbController.upsertItem("participantPosition", {...participant, x: participant.x2, y: participant.y2});
      setEditedPartPIds([...editedPartPIds, id]);
    }
  }

  function updatePropPosition(id: string, x: number, y: number) {
    var prop = propPositions.find(x => strEquals(x.id, id));
    if (prop) {
      prop.x2 = (prop.x * gridSize + x)/gridSize;
      prop.y2 = (prop.y * gridSize + y)/gridSize; // todo: fix off by 2m
      dbController.upsertItem("propPosition", {...prop, x: prop.x2, y: prop.y2});
      setEditedPropPIds([...editedPropPIds, id]);
    }
  }
  function updateNotePosition(id: string, x: number, y: number) {
    var prop = noteList.find(x => strEquals(x.id, id));
    if (prop) {
      prop.x2 = (prop.x * gridSize + x)/gridSize;
      prop.y2 = (prop.y * gridSize + y)/gridSize; // todo: fix off by 2m
      dbController.upsertItem("notePosition", {...prop, x: prop.x2, y: prop.y2});
      setEditedNotePIds([...editedNotePIds, id]);
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

  return (
    <Layer 
      ref={layerRef}>
      {
        currentNotes
          .map((note, index) => 
            <NoteObject 
              id={note.id}
              key={note.id}
              colour={note.color ?? objectColorSettings.blueLight} 
              startX={getPixel(gridSize, note.x)} 
              startY={getPixel(gridSize, note.y)}
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
      { 
        currentProps
          .map((placement, index) =>
            <PropObject 
              id={placement.id}
              key={placement.id}
              name={propList.find(x => strEquals(placement.propId, x.id))?.name ?? ""}
              colour={propList.find(x => strEquals(placement.propId, x.id))?.color ?? objectColorSettings.purpleLight} 
              length={propList.find(x => strEquals(placement.propId, x.id))?.length ?? 11}
              startX={getPixel(gridSize, placement.x)} 
              startY={getPixel(gridSize, placement.y)} 
              updatePosition={(x, y) => updatePropPosition(placement.id, x, y)}
              onClick={(forceSelect?: boolean, multiSelect?: boolean) => selectItem(placement, PositionType.prop, forceSelect, multiSelect, propRef.current[index])}
              draggable={!isAnimating}
              rotation={placement.angle} 
              onRotate={(angle, x, y) => updatePropRotation(placement.id, angle, x, y)}
              />
          )
      } 
      {
        currentParticipants
          .map((placement, index) => 
            <ParticipantObject 
              id = {placement.id}
              key={placement.id}
              name={participantList.find(x=> strEquals(placement.participantId, x.id))?.displayName!} 
              colour={categories.find(x => strEquals(x.id, placement.categoryId))?.color || objectColorSettings["amberLight"]} 
              startX={getPixel(gridSize, placement.x)} 
              startY={getPixel(gridSize, placement.y)}
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
        onTransformEnd={(event) => 
          { 
            console.log("rotation is broken");
            console.log(event.target);
            //props.onTransform?.(event.target);
          }
        }
      />    
    </Layer>
  )
}