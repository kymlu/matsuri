import React, { useContext, useEffect } from "react";
import { Layer } from "react-konva";
import { AnimationContext } from "../../../contexts/AnimationContext.tsx";
import { UserContext } from "../../../contexts/UserContext.tsx";
import { objectColorSettings } from "../../../themes/colours.ts";
import ParticipantObject from "../formationObjects/ParticipantObject.tsx";
import { useRef } from "react";
import Konva from "konva";
import { ParticipantPosition, PropPosition } from "../../../models/Position.ts";
import { Participant } from "../../../models/Participant.ts";
import { ParticipantCategory } from "../../../models/ParticipantCategory.ts";
import { VisualSettingsContext } from "../../../contexts/VisualSettingsContext.tsx";
import { strEquals } from "../../../lib/helpers/GlobalHelper.ts";
import { Prop } from "../../../models/Prop.ts";
import PropObject from "../formationObjects/PropObject.tsx";
import { useMemo } from "react";

export type FormationAnimationLayerProps = {
  topMargin: number,
  bottomMargin: number,
  sideMargin: number,
  participants: Record<string, Participant>,
  props: Record<string, Prop>,
  categories: Record<string, ParticipantCategory>,
  participantPositions: ParticipantPosition[],
  previousParticipantPositions: Record<string, ParticipantPosition>,
  propPositions: PropPosition[],
}

export function FormationAnimationLayer(props: FormationAnimationLayerProps) {
  const {participantPaths, propPaths, isAnimating, updateAnimationContext} = useContext(AnimationContext);
  const {updateState} = useContext(UserContext);
  const {followingId} = useContext(VisualSettingsContext);
  const animationLayerRef = useRef<Konva.Layer>(null);
  const participantRef = useRef<React.RefObject<Konva.Group | null>[]>([]);
  const propRef = useRef<React.RefObject<Konva.Group | null>[]>([]);
  
  Object.keys(props.participants)
    .forEach((_, index) => 
      participantRef.current[index] = React.createRef<Konva.Group>()
    );
  Object.keys(props.props)
    .forEach((_, index) => 
      propRef.current[index] = React.createRef<Konva.Group>()
    );

  // Precompute paths and sort them
  const sortedParticipantPaths = useMemo(
    () => Object.entries(participantPaths).sort((a, b) => a[0].localeCompare(b[0])),
    [participantPaths]
  );

  const sortedPropPaths = useMemo(
    () => Object.entries(propPaths).sort((a, b) => a[0].localeCompare(b[0])),
    [propPaths]
  );

  useEffect(() => {
    if (!isAnimating) return;

    updateState({isLoading: false});

    const steps = 30;

    const animationPromises: Promise<void>[] = [];

    Object.entries(sortedParticipantPaths)
      .forEach(([, pathData], index) => {
        const path = new Konva.Path({
          x: props.previousParticipantPositions[pathData[0]]?.x ?? 0,
          y: props.previousParticipantPositions[pathData[0]]?.y ?? 0,
          data: pathData[1].path,
        });

        const pathLen = path.getLength();
        const step = pathLen / steps;
        let pos = 0;

        participantRef.current[index].current?.cache();

        // Wrap each animation in a Promise
        const animPromise = new Promise<void>((resolve) => {
          const anim = new Konva.Animation(() => {
            pos++;

            const pt = path.getPointAtLength(pos * step);
            if (pt && participantRef?.current[index]) {
              participantRef.current[index]?.current?.position({ x: pt.x, y: pt.y });
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
    Object.entries(sortedPropPaths)
      .forEach(([, pathData], index) => {
        const path = new Konva.Path({
          x: 0,
          y: 0,
          data: pathData[1].path,
        });

        const pathLen = path.getLength();
        const step = pathLen / steps;
        const anglePerStep = (pathData[1].toAngle! - pathData[1].fromAngle!)/steps;
        let pos = 0;

        propRef.current[index].current?.cache();

        // Wrap each animation in a Promise
        const animPromise = new Promise<void>((resolve) => {
          const anim = new Konva.Animation(() => {
            pos++;

            const pt = path.getPointAtLength(pos * step);
            if (pt && propRef?.current[index]) {
              propRef.current[index]?.current?.position({ x: pt.x, y: pt.y });
              propRef.current[index]?.current?.rotation(pathData[1].fromAngle! + pos * anglePerStep);
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
      {props.propPositions
        ?.sort((a, b) => a.propId.localeCompare(b.propId))
        .map((placement, index) => {
          const prop = props.props[placement.propId];
          if (!prop) return <></>;
          return <PropObject 
            id={"animate" + placement.id}
            key={placement.id}
            name={prop.name!} 
            colour={prop.color ?? objectColorSettings["amberLight"]} 
            startX={0} 
            startY={0}
            ref={propRef.current[index]}
            length={prop.length}
            rotation={0}
          />;
        }
        )
      }
      {props.participantPositions
        ?.sort((a, b) => a.participantId.localeCompare(b.participantId))
        .map((placement, index) => {
          const participant = props.participants[placement.participantId];
          if (!participant) return <></>;
          return <ParticipantObject 
            id={"animate" + placement.id}
            key={placement.id}
            name={participant.displayName!} 
            colour={placement.categoryId ? props.categories[placement.categoryId]?.color || objectColorSettings["amberLight"] : objectColorSettings["amberLight"]} 
            startX={props.previousParticipantPositions[placement.participantId]?.x ?? 0} 
            startY={props.previousParticipantPositions[placement.participantId]?.y ?? 0}
            ref={participantRef.current[index]}
            following={strEquals(followingId, placement.participantId)}
          />;
        }
        )
      }
    </Layer>
  )
}