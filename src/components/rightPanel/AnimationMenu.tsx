import React, { useContext } from "react";
import ExpandableSection from "../ExpandableSection.tsx";
import Button from "../Button.tsx";
import { dbController } from "../../data/DBProvider.tsx";
import { ParticipantPosition } from "../../models/Position.ts";
import { UserContext } from "../../contexts/UserContext.tsx";
import { AnimationContext } from "../../contexts/AnimationContext.tsx";

export default function AnimationMenu() {
  const {gridSize} = useContext(UserContext);

  const {currentSections, selectedSection} = useContext(UserContext);
  const {updateAnimationContext} = useContext(AnimationContext);

  function animate(mode: "fromPrevious" | "all" = "all") {
    if (selectedSection === null) return;

    Promise.all(
      [
        dbController.getAll("participantPosition"),
      ])
      .then(([res1]) => {
      try {
        if (mode === "fromPrevious") {
          var sectionIds = [selectedSection!.id, currentSections.find(x => x.order === (selectedSection!.order - 1))!.id];
        } else {
          var sectionIds = currentSections.sort((a, b) => a.order - b.order).map(x => x.id);
        }
        var participantList = (res1 as Array<ParticipantPosition>)
          .filter(x => sectionIds.includes(x.formationSceneId))
          .reduce((acc, item) => {
            const key = item.participantId;
            if (!acc[key]) {
              acc[key] = [];
            }
            acc[key].push(item);
            return acc;
          }, {} as Record<string, ParticipantPosition[]>);
        
        const animationPaths = Object.fromEntries(Object.entries((participantList))
          .map(([key, positionList]) => {
            const path = positionList
              .sort((a, b) => sectionIds.indexOf(a.formationSceneId) - sectionIds.indexOf(b.formationSceneId))
              .reduce((acc, point, index) => {
                if (index === 0) {
                  return `M${point.x * gridSize} ${point.y * gridSize}`;
                } else {
                  return `${acc} L${point.x * gridSize} ${point.y * gridSize}`;
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
      { selectedSection?.order !== 1 && <Button onClick={() => {animate("fromPrevious")}}>前からの移動可視化</Button> }
      <Button onClick={() => {animate()}}>全ての移動可視化</Button>
    </ExpandableSection>
  )
}