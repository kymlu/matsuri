import React, { useContext, useEffect, useState } from "react";
import { Layer } from "react-konva";
import { AnimationContext } from "../../../contexts/AnimationContext.tsx";
import { CategoryContext } from "../../../contexts/CategoryContext.tsx";
import { FormationContext } from "../../../contexts/FormationContext.tsx";
import { PositionContext } from "../../../contexts/PositionContext.tsx";
import { UserContext } from "../../../contexts/UserContext.tsx";
import { objectColorSettings } from "../../../themes/colours.ts";
import { isNullOrUndefined, isNullOrUndefinedOrBlank, strEquals } from "../../../helpers/GlobalHelper.ts";
import ParticipantObject from "../formationObjects/ParticipantObject.tsx";
import { useRef } from "react";
import Konva from "konva";
import { getAnimationPaths } from "../../../helpers/AnimationHelper.ts";
import { ParticipantPosition } from "../../../models/Position.ts";
import { SettingsContext } from "../../../contexts/SettingsContext.tsx";

export type FormationAnimationLayerProps = {
  topMargin: number,
  bottomMargin: number,
  sideMargin: number,
}

export function FormationAnimationLayer(props: FormationAnimationLayerProps) {
  const userContext = useContext(UserContext);
  const {paths, isAnimating, updateAnimationContext} = useContext(AnimationContext);
  const {participantList} = useContext(FormationContext);
  const {updateState, previousSectionId, gridSize} = useContext(UserContext);
  const {enableAnimation} = useContext(SettingsContext);
  const {participantPositions} = useContext(PositionContext);
  const {categories} = useContext(CategoryContext);
  const animationLayerRef = useRef<Konva.Layer>(null);
  const animationRef = useRef<React.RefObject<Konva.Group | null>[]>([]);
  const [currentParticipants, setCurrentPartipants] = useState<ParticipantPosition[]>([]);
  const [prevSectionId, setPrevSectionId] = useState<string | null>(null);

  useEffect(() => {
    if (userContext.selectedSection){
      setCurrentPartipants(participantPositions
        .filter(x => strEquals(x.formationSectionId, userContext.selectedSection!.id))
        .sort((a, b) => a.participantId.localeCompare(b.participantId)));
    }
  }, [userContext.selectedSection]);
  
  participantList
    .sort((a, b) => a.id.localeCompare(b.id))
    .forEach((_, index) => 
      animationRef.current[index] = React.createRef<Konva.Group>()
    );
    
  useEffect(() => {
    if(!isAnimating) return;
    updateState({isLoading: false});

    const steps = 30;

    const animationPromises: Promise<void>[] = [];

    Object.entries(paths)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .forEach(([, pathData], index) => {
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
          const anim = new Konva.Animation(() => {
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

  useEffect(() => {
    if (
      !enableAnimation ||
      isNullOrUndefinedOrBlank(userContext.previousSectionId) ||
      isNullOrUndefined(userContext.selectedSection))
      return;

    var animationPaths = getAnimationPaths(
      [userContext.previousSectionId!, userContext.selectedSection!.id],
      gridSize,
      participantPositions,
      props.topMargin,
      props.sideMargin
      )
    updateAnimationContext({paths: animationPaths, isAnimating: true});
  }, [previousSectionId]);
  
  return (
    <Layer
      listening={false}
      useRef={animationLayerRef}>
      {currentParticipants
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
        )
      }
    </Layer>
  )
}