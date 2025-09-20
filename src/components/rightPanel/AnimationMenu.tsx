import React, { useContext } from "react";
import ExpandableSection from "../ExpandableSection.tsx";
import Button from "../Button.tsx";
import { UserContext } from "../../contexts/UserContext.tsx";
import { AnimationContext } from "../../contexts/AnimationContext.tsx";
import { getAnimationPaths } from "../helpers/AnimationHelper.ts";
import { PositionContext } from "../../contexts/PositionContext.tsx";
import { DEFAULT_SIDE_MARGIN, DEFAULT_TOP_MARGIN, ICON } from "../../data/consts.ts";

export default function AnimationMenu() {
  const {gridSize} = useContext(UserContext);

  const {currentSections, selectedSection, updateState, selectedFormation} = useContext(UserContext);
  const {isAnimating, updateAnimationContext} = useContext(AnimationContext);
  const {participantPositions} = useContext(PositionContext);

  function animate(mode: "fromPrevious" | "all" = "all") {
    if (selectedSection === null) return;
    if (mode === "fromPrevious") {
      var sectionIds = [currentSections.find(x => x.order === (selectedSection!.order - 1))!.id, selectedSection!.id];
    } else {
      var sectionIds = currentSections.sort((a, b) => a.order - b.order).map(x => x.id);
    }

    updateState({isLoading: true});

    var animationPaths = getAnimationPaths(sectionIds, gridSize, participantPositions, selectedFormation?.topMargin ?? DEFAULT_TOP_MARGIN, selectedFormation?.sideMargin ?? DEFAULT_SIDE_MARGIN)
    updateAnimationContext({paths: animationPaths, isAnimating: true});
  }
  
  return (
    <ExpandableSection
      title="アニメーション"
      titleIcon={ICON.footprintBlack}>
      { !isAnimating &&
        <Button onClick={() => {animate()}}>全ての移動可視化</Button>
      }
      {
        isAnimating &&
        <Button
          onClick={() => {
            updateAnimationContext({paths: {}, isAnimating: false});
          }}>
            アニメーション停止
        </Button>
      }
    </ExpandableSection>
  )
}