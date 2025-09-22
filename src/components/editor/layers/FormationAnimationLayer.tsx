import React, { useContext, useEffect } from "react";
import { Layer } from "react-konva";
import { AnimationContext } from "../../../contexts/AnimationContext.tsx";
import { UserContext } from "../../../contexts/UserContext.tsx";
import { objectColorSettings } from "../../../themes/colours.ts";
import ParticipantObject from "../formationObjects/ParticipantObject.tsx";
import { useRef } from "react";
import Konva from "konva";
import { ParticipantPosition } from "../../../models/Position.ts";
import { Participant } from "../../../models/Participant.ts";
import { ParticipantCategory } from "../../../models/ParticipantCategory.ts";

export type FormationAnimationLayerProps = {
  topMargin: number,
  bottomMargin: number,
  sideMargin: number,
  participants: Record<string, Participant>,
  categories: Record<string, ParticipantCategory>,
  positions: ParticipantPosition[]
}

export function FormationAnimationLayer(props: FormationAnimationLayerProps) {
  const {paths, isAnimating, updateAnimationContext} = useContext(AnimationContext);
  const {updateState} = useContext(UserContext);
  const animationLayerRef = useRef<Konva.Layer>(null);
  const animationRef = useRef<React.RefObject<Konva.Group | null>[]>([]);
  
  Object.keys(props.participants)
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
  
  return (
    <Layer
      listening={false}
      useRef={animationLayerRef}>
      {props.positions
        ?.sort((a, b) => a.participantId.localeCompare(b.participantId))
        .map((placement, index) => {
          const participant = props.participants[placement.participantId];
          if (!participant) return;
          return <ParticipantObject 
            id={"animate" + placement.id}
            key={placement.id}
            name={participant.displayName!} 
            colour={placement.categoryId ? props.categories[placement.categoryId]?.color || objectColorSettings["amberLight"] : objectColorSettings["amberLight"]} 
            startX={0} 
            startY={0}
            ref={animationRef.current[index]}
          />;
        }
        )
      }
    </Layer>
  )
}