import React, { useContext, useEffect, useImperativeHandle, useRef, useState } from "react";
import { Layer, Rect, Transformer } from "react-konva";
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
import { Group } from "konva/lib/Group";

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
    clearSelections: () => {
      updateState({selectedItems: []});
      setSelectedIds([]);
    },

    onMouseDown: (e) => {
      const isElement = e.target.findAncestor(".elements-container");
      const isTransformer = e.target.findAncestor("Transformer");
      if (isElement || isTransformer) {
        return;
      }
  
      const pos = e.target.getStage().getPointerPosition();
      selection.current.visible = true;
      selection.current.x1 = pos.x;
      selection.current.y1 = pos.y;
      selection.current.x2 = pos.x;
      selection.current.y2 = pos.y;
      updateSelectionRect();
    },
    
    onMouseMove: (e) => {
      if (!selection.current.visible) {
        return;
      }
      const pos = e.target.getStage().getPointerPosition();
      selection.current.x2 = pos.x;
      selection.current.y2 = pos.y;
      updateSelectionRect();
    },

    onMouseUp: () => {
      oldPos.current = null;
      selection.current.visible = false;
      const { x1, x2, y1, y2 } = selection.current;
      const moved = x1 !== x2 || y1 !== y2;
      if (!moved) {
        updateSelectionRect();
        return;
      }
      if (selectionRectRef.current){
        const selBox = selectionRectRef.current?.getClientRect();

        const selectedParticipantIds: Array<string> = [];
        participantRef.current?.forEach((elementNode) => {
          if(elementNode.current) {
            var node = (elementNode as React.RefObject<Group>);
            const elBox = node.current.getClientRect();
            if (Konva.Util.haveIntersection(selBox, elBox)) {
              selectedParticipantIds.push(node.current.attrs.id);
            }
          }
        });

        const selectedPropIds: Array<string> = [];
        propRef.current?.forEach((elementNode) => {
          if(elementNode.current) {
            var node = (elementNode as React.RefObject<Group>);
            const elBox = node.current.getClientRect();
            if (Konva.Util.haveIntersection(selBox, elBox)) {
              selectedPropIds.push(node.current.attrs.id);
            }
          }
        });

        const selectedNoteIds: Array<string> = [];
        noteRef.current?.forEach((elementNode) => {
          if(elementNode.current) {
            var node = (elementNode as React.RefObject<Group>);
            const elBox = node.current.getClientRect();
            if (Konva.Util.haveIntersection(selBox, elBox)) {
              selectedNoteIds.push(node.current.attrs.id);
            }
          }
        });

        updateState({selectedItems: [
          ...participantPositions.filter(x => selectedParticipantIds.includes(x.id))
            .map(x => ({type: PositionType.participant, participant: x} as Position)),
          ...propPositions.filter(x => selectedPropIds.includes(x.id))
            .map(x => ({type: PositionType.prop, prop: x} as Position)),
          ...noteList.filter(x => selectedNoteIds.includes(x.id))
            .map(x => ({type: PositionType.note, note: x} as Position)),
        ]});

        setSelectedIds([...selectedParticipantIds, ...selectedPropIds, ...selectedNoteIds]);
  
        updateSelectionRect();
      }
    }
  }));

  const selectionRectRef = React.useRef<Konva.Rect | null>(null);
  const selection = React.useRef({
    visible: false,
    x1: 0,
    y1: 0,
    x2: 0,
    y2: 0
  });

  const updateSelectionRect = () => {
    if (selectionRectRef.current) {
      const node = selectionRectRef.current;
      node.setAttrs({
        visible: selection.current.visible,
        x: Math.min(selection.current.x1, selection.current.x2),
        y: Math.min(selection.current.y1, selection.current.y2),
        width: Math.abs(selection.current.x1 - selection.current.x2),
        height: Math.abs(selection.current.y1 - selection.current.y2),
        fill: "rgba(0, 161, 255, 0.3)"
      });
    }
  };

  const oldPos = React.useRef(null);
  
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
              ref={noteRef.current[index]}
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
              ref={propRef.current[index]}
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
              ref={participantRef.current[index]}
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
      <Rect fill="rgba(0,0,255,0.5)" ref={selectionRectRef} />
    </Layer>
  )
}