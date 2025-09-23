import React, { useContext, useEffect, useRef, useState } from "react";
import { Stage } from "react-konva";
import { UserContext } from "../../contexts/UserContext.tsx";
import FormationGridLayer from "./layers/FormationGridLayer.tsx";
import { isNullOrUndefined, strEquals } from "../../helpers/GlobalHelper.ts";
import { AnimationContext } from "../../contexts/AnimationContext.tsx";
import { FormationType } from "../../models/Formation.ts";
import { getParticipantAnimationPaths, getPropAnimationPaths } from "../../helpers/AnimationHelper.ts";
import { FormationGhostLayer } from "./layers/FormationGhostLayer.tsx";
import { FormationAnimationLayer } from "./layers/FormationAnimationLayer.tsx";
import { FormationMainLayer } from "./layers/FormationMainLayer.tsx";
import { SettingsContext } from "../../contexts/SettingsContext.tsx";
import { ParticipantCategory } from "../../models/ParticipantCategory.ts";
import { AnimationPath } from "../../models/AnimationPath.ts";
import { FormationContext } from "../../contexts/FormationContext.tsx";
import { AppModeContext } from "../../contexts/AppModeContext.tsx";
import { VisualSettingsContext } from "../../contexts/VisualSettingsContext.tsx";
import { EntitiesContext } from "../../contexts/EntitiesContext.tsx";
import { PositionContext } from "../../contexts/PositionContext.tsx";
import { ParticipantPosition } from "../../models/Position.ts";

export interface FormationCanvasProps {
  height: number,
  width: number,
  topMargin: number,
  bottomMargin: number,
  sideMargin: number,
  ref: React.Ref<any>,
  categories: Record<string, ParticipantCategory>;
  setAnimationPaths: (participantPaths: AnimationPath[]) => void,
  setFollowingPositions?: (newPosition: Record<string, ParticipantPosition> | null) => void
}

export default function FormationCanvas(props: FormationCanvasProps) {
  const editLayerRef = React.createRef<any>();
  const stageRef = useRef(null);
  const userContext = useContext(UserContext);
  const {isAnimating, updateAnimationContext} = useContext(AnimationContext);
  const {appMode} = useContext(AppModeContext);
  const {selectedSection, isLoading, currentSections, compareMode, updateState} = useContext(UserContext);
  const {gridSize, followingId, updateVisualSettingsContext} = useContext(VisualSettingsContext);
  const {selectedFormation} = useContext(FormationContext);
  const {enableAnimation} = useContext(SettingsContext);
  const {participantPositions, propPositions, notePositions, arrowPositions} = useContext(PositionContext);
  const {participantList, propList} = useContext(EntitiesContext);
  const canvasHeight = (props.height + props.topMargin + props.bottomMargin) * gridSize;
  const canvasWidth = (props.width + props.sideMargin * 2) * gridSize;
  
  const [orderedSectionIds, setOrderedSectionIds] = useState<string[]>([]);
  const [ghostSectionId, setGhostSectionId] = useState<string | null>(null);

  useEffect(() => {
    setOrderedSectionIds(currentSections.map(x => x.id));
  }, [currentSections])

  useEffect(() => {
    if(isNullOrUndefined(selectedSection) || appMode === "view") return;
    
    if(enableAnimation && userContext.previousSectionId &&userContext.selectedSection) {
      updateState({isLoading: true});
      var participantPaths = getParticipantAnimationPaths(
        [userContext.previousSectionId!, userContext.selectedSection!.id],
        gridSize,
        Object.values(participantPositions).flat(),
        props.topMargin,
        props.sideMargin);
      var propPaths = getPropAnimationPaths(
        [userContext.previousSectionId!, userContext.selectedSection!.id],
        gridSize,
        Object.values(propPositions).flat(),
        props.topMargin,
        props.sideMargin);
      updateState({isLoading: false});
      updateAnimationContext({participantPaths: participantPaths, propPaths: propPaths, isAnimating: true});
    }
  }, [userContext.selectedSection]);

  useEffect(() => {
    if(followingId) {
      var newFollowingPositions = {};
      Object.keys(participantPositions).forEach((key) => {
        var position = participantPositions[key].filter(x => strEquals(x.participantId, followingId));
        if (position.length > 0) {
          newFollowingPositions[key] = position[0];
        }
      })
      props.setFollowingPositions?.(newFollowingPositions);
    } else {
      props.setFollowingPositions?.(null);
    }
  }, [followingId]);

  useEffect(() => {
    if (compareMode !== "none") {
      setGhostSectionId(orderedSectionIds[orderedSectionIds.indexOf(selectedSection!.id) + 
        (compareMode === "next" ? 1 : -1)]);
    }
  }, [userContext.compareMode, userContext.selectedSection, userContext.compareMode]);

  return (
    <div className="m-auto">
      <Stage
        ref={stageRef}
        width={canvasWidth}
        height={canvasHeight}
        onMouseDown={(e) => { editLayerRef.current?.onMouseDown(e) }}
        onMouseUp={(e) => { editLayerRef.current?.onMouseUp(e) }}
        onMouseMove={(e) => { editLayerRef.current?.onMouseMove(e) }}
        onClick={(event) => {
          if (event.target === event.target.getStage()) {
            editLayerRef.current?.clearSelections();
            updateVisualSettingsContext({followingId: null});
          }
        }}>
        {
          selectedFormation && selectedSection &&
          <FormationGridLayer
            canvasHeight={canvasHeight}
            canvasWidth={canvasWidth}
            height={props.height}
            width={props.width}
            topMargin={props.topMargin}
            bottomMargin={props.bottomMargin}
            sideMargin={props.sideMargin}
            isParade={selectedFormation.type === FormationType.parade}
            sectionName={selectedSection.displayName}/>
        }
        
        { compareMode !== "none" && ghostSectionId &&
          <FormationGhostLayer
            topMargin={props.topMargin}
            bottomMargin={props.bottomMargin}
            sideMargin={props.sideMargin}
            participants={participantList}
            props={propList}
            partPositions={participantPositions[ghostSectionId]}
            propPositions={propPositions[ghostSectionId]}
            categories={props.categories}
            />
        }
        {
          !isLoading && !isAnimating && selectedSection &&
          <FormationMainLayer 
            topMargin={props.topMargin}
            bottomMargin={props.bottomMargin}
            sideMargin={props.sideMargin}
            ref={editLayerRef}
            categories={props.categories}
            participants={participantList}
            props={propList}
            partPositions={participantPositions[selectedSection.id]}
            propPositions={propPositions[selectedSection.id]}
            notePositions={notePositions[selectedSection.id]}
            arrowPositions={arrowPositions[selectedSection.id]}
            />
        }
        {
          !isLoading && isAnimating && selectedSection &&
          <FormationAnimationLayer
            topMargin={props.topMargin}
            bottomMargin={props.bottomMargin}
            sideMargin={props.sideMargin}
            participants={participantList}
            participantPositions={participantPositions[selectedSection.id]}
            props={propList}
            propPositions={propPositions[selectedSection.id]}
            categories={props.categories}/>
        }
      </Stage>
    </div>
  )
}