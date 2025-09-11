import React, { useContext, useEffect, useState } from "react";
import { Layer } from "react-konva";
import { AnimationContext } from "../../contexts/AnimationContext.tsx";
import { CategoryContext } from "../../contexts/CategoryContext.tsx";
import { ExportContext } from "../../contexts/ExportContext.tsx";
import { FormationContext } from "../../contexts/FormationContext.tsx";
import { PositionContext } from "../../contexts/PositionContext.tsx";
import { UserContext } from "../../contexts/UserContext.tsx";
import { objectColorSettings } from "../../themes/colours.ts";
import { isNullOrUndefined, strEquals } from "../helpers/GlobalHelper.ts";
import ParticipantObject from "./formationObjects/ParticipantObject.tsx";
import { useRef } from "react";
import Konva from "konva";
import { getAnimationPaths } from "../helpers/AnimationHelper.ts";
import { ParticipantPosition } from "../../models/Position.ts";

export function FormationAnimationLayer() {
  const userContext = useContext(UserContext);
  const {paths, isAnimating, updateAnimationContext} = useContext(AnimationContext);
  const {participantList} = useContext(FormationContext);
  const {enableAnimation, updateState, gridSize} = useContext(UserContext);
  const {participantPositions} = useContext(PositionContext);
  const {categories} = useContext(CategoryContext);
  const animationLayerRef = useRef<Konva.Layer>(null);
  const animationRef = useRef<React.RefObject<Konva.Group | null>[]>([]);
  const [currentParticipants, setCurrentPartipants] = useState<ParticipantPosition[]>([]);

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
    return; // broken
    if(
      !enableAnimation ||
      isNullOrUndefined(userContext.previousSectionId) ||
      isNullOrUndefined(userContext.selectedSection)) return;

    updateState({isLoading: true});
    getAnimationPaths([userContext.previousSectionId!, userContext.selectedSection!.id], gridSize, participantPositions)
      .then((animationPaths) => {
        updateState({isLoading: false});
        updateAnimationContext({paths: animationPaths, isAnimating: true});
      });
  }, [userContext.previousSectionId]);
  
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