import React, { useContext } from "react";
import ExpandableSection from "../ExpandableSection.tsx";
import Button from "../Button.tsx";
import { dbController } from "../../data/DBProvider.tsx";
import { ParticipantPosition } from "../../models/Position.ts";
import { UserContext } from "../../contexts/UserContext.tsx";
import { GRID_SIZE } from "../../data/consts.ts";
import { AnimationContext } from "../../contexts/AnimationContext.tsx";

export default function AnimationMenu() {
  const {sections} = useContext(UserContext);
  const {paths, updateAnimationContext} = useContext(AnimationContext);

  function animate() {
    Promise.all(
      [
        dbController.getAll("participantPosition"),
      ])
      .then(([res1]) => {
      try {
        var sectionIds = sections.map(x => x.id);
        var participantList = (res1 as Array<ParticipantPosition>)
          .filter(x => sectionIds.includes(x.formationScene.id))
          .reduce((acc, item) => {
            const key = item.participant.id;
            if (!acc[key]) {
              acc[key] = [];
            }
            acc[key].push(item);
            return acc;
          }, {} as Record<string, ParticipantPosition[]>);
          const animationPaths = Object.fromEntries(Object.entries((participantList))
            .map(([key, positionList]) => {
              const path = positionList
                .sort((a, b) => a.formationScene.songSection.order - b.formationScene.songSection.order)
                .reduce((acc, point, index) => {
                  if (index === 0) {
                    return `M${point.x * GRID_SIZE} ${point.y * GRID_SIZE}`;
                  } else {
                    return `${acc} L${point.x * GRID_SIZE} ${point.y * GRID_SIZE}`;
                  }
                }, "");
              return [key, path];
          }));
          console.log(animationPaths);
          updateAnimationContext({paths: animationPaths});
      } catch (e) {
        console.error('Error parsing user from localStorage:', e);
      }
    });
  }
  
  return (
    <ExpandableSection title="アニメーション">
      {/* <Button onClick={() => {}}>Show transition from previous</Button> */}
      <Button onClick={() => {animate()}}>移動可視化</Button>
    </ExpandableSection>
  )
}