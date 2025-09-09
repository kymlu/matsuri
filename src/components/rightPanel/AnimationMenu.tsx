import React, { useContext } from "react";
import ExpandableSection from "../ExpandableSection.tsx";
import Button from "../Button.tsx";
import { UserContext } from "../../contexts/UserContext.tsx";
import { AnimationContext } from "../../contexts/AnimationContext.tsx";
import { getAnimationPaths } from "../helpers/AnimationHelper.ts";

export default function AnimationMenu() {
  const {gridSize} = useContext(UserContext);

  const {currentSections, selectedSection, updateState, selectedFormation} = useContext(UserContext);
  const {isAnimating, updateAnimationContext} = useContext(AnimationContext);

  function animate(mode: "fromPrevious" | "all" = "all") {
    if (selectedSection === null) return;
    if (mode === "fromPrevious") {
      var sectionIds = [currentSections.find(x => x.order === (selectedSection!.order - 1))!.id, selectedSection!.id];
    } else {
      var sectionIds = currentSections.sort((a, b) => a.order - b.order).map(x => x.id);
    }

    updateState({isLoading: true});

    getAnimationPaths(selectedFormation!.id, sectionIds, gridSize)
      .then((animationPaths) => {
        updateAnimationContext({paths: animationPaths, isAnimating: true});
      });
  }
  
  return (
    <ExpandableSection title="アニメーション">
      { !isAnimating &&
        <Button onClick={() => {animate()}}>全ての移動可視化</Button>
      }
      {
        isAnimating &&
        <Button onClick={() => {
          updateAnimationContext({paths: {}, isAnimating: false});
        }}>アニメーション停止</Button>
      }
    </ExpandableSection>
  )
}