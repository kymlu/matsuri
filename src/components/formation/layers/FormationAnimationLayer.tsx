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
import { Path } from "../../../models/AnimationPath.ts";
import { Group } from "konva/lib/Group";

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

  useEffect(() => {
    Object.keys(props.participants)
      .forEach((_, index) => 
        participantRef.current[index] = React.createRef<Konva.Group>()
      );
    Object.keys(props.props)
      .forEach((_, index) => 
        propRef.current[index] = React.createRef<Konva.Group>()
      );
  }, [props.participantPositions, props.propPositions]);
  

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

    const animationPromises: Promise<void>[] = [];

    createAnimations(animationPromises, sortedParticipantPaths, participantRef, false, props.previousParticipantPositions);
    createAnimations(animationPromises, sortedPropPaths, propRef, true);

    Promise.all(animationPromises).then(() => {
      updateAnimationContext({isAnimating: false});
    });
  }, [isAnimating]);

  function createAnimations(
    promiseArray: Promise<void>[],
    paths: [string, Path][],
    refs: React.RefObject<React.RefObject<Group | null>[]>,
    hasRotation: boolean,
    previousPositions?: Record<string, ParticipantPosition>,
  ) {
    const steps = 30;

    Object.entries(paths)
      .forEach(([, pathData], index) => {
        const path = new Konva.Path({
          x: previousPositions ? previousPositions[pathData[0]]?.x ?? 0 : 0,
          y: previousPositions ? previousPositions[pathData[0]]?.y ?? 0 : 0,
          data: pathData[1].path,
        });

        const pathLen = path.getLength();
        const step = pathLen / steps;
        const anglePerStep = hasRotation ? (pathData[1].toAngle! - pathData[1].fromAngle!)/steps : 0;
        let pos = 0;

        refs.current[index].current?.cache();

        // Wrap each animation in a Promise
        const animPromise = new Promise<void>((resolve) => {
          const anim = new Konva.Animation(() => {
            pos++;

            const pt = path.getPointAtLength(pos * step);
            if (pt && refs?.current[index]) {
              refs.current[index]?.current?.position({ x: pt.x, y: pt.y });
              if (hasRotation) {
                refs.current[index]?.current?.rotation(pathData[1].fromAngle! + pos * anglePerStep);
              }
            }

            if (pos >= steps) {
              anim.stop();
              resolve();
            }
          });

          anim.start();
        });

        promiseArray.push(animPromise);
      });
  }
  
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
					  isPlaceholder={props.participants[placement.participantId]?.isPlaceholder}
          />;
        }
        )
      }
    </Layer>
  )
}