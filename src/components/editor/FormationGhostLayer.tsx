import React, { useContext, useEffect } from "react"
import { Layer } from "react-konva"
import { objectColorSettings } from "../../themes/colours.ts"
import { strEquals } from "../helpers/GlobalHelper.ts"
import ParticipantObject from "./formationObjects/ParticipantObject.tsx"
import PropObject from "./formationObjects/PropObject.tsx"
import { getPixel } from "./FormationHelper.ts"
import { FormationContext } from "../../contexts/FormationContext.tsx"
import { UserContext } from "../../contexts/UserContext.tsx"
import { CategoryContext } from "../../contexts/CategoryContext.tsx"
import { dbController } from "../../data/DBProvider.tsx"
import { ParticipantPosition, PropPosition } from "../../models/Position.ts"
import { useState } from "react"

export function FormationGhostLayer() {
  const userContext = useContext(UserContext);
  const {currentSections, compareMode, gridSize} = useContext(UserContext);
  const formationContext = useContext(FormationContext);
  const {participantList, propList} = useContext(FormationContext);
  const {categories} = useContext(CategoryContext);
  const [ghostParticipants, setGhostParticipants] = useState<ParticipantPosition[]>([]);
  const [ghostProps, setGhostProps] = useState<PropPosition[]>([]);
  
  useEffect(() => {
    var ghostId = "";
    if (compareMode === "previous") {
      const previousSectionId = userContext?.selectedSection &&
        currentSections.find(x => x.order === (userContext!.selectedSection!.order - 1))?.id;
      if (previousSectionId) ghostId = previousSectionId;
    } else if (compareMode === "next") {
      const nextSectionId = userContext?.selectedSection &&
      currentSections.find(x => x.order === (userContext!.selectedSection!.order + 1))?.id;
      if (nextSectionId) ghostId = nextSectionId;
    }

    if (compareMode !== "none" && ghostId) {
      Promise.all([
        dbController.getByFormationSectionId("participantPosition", ghostId),
        dbController.getByFormationSectionId("propPosition", ghostId),
      ]).then(([participants, props]) => {
        setGhostParticipants(participants as Array<ParticipantPosition>);
        setGhostProps(props as Array<PropPosition>);
      });
    } else {
      setGhostParticipants([]);
      setGhostProps([]);
    }
  }, [userContext?.selectedSection, userContext?.compareMode, formationContext?.participantList]);

  return (<Layer
    opacity={0.5}
    listening={false}>
    {
      ghostProps
        .map(placement =>
          <PropObject 
            id={"ghost" + placement.id}
            key={placement.id}
            name={propList.find(x => strEquals(placement.propId, x.id))!.name}
            colour={propList.find(x => strEquals(placement.propId, x.id))!.color ?? objectColorSettings.purpleLight} 
            length={propList.find(x => strEquals(placement.propId, x.id))!.length}
            startX={getPixel(gridSize, placement.x)} 
            startY={getPixel(gridSize, placement.y)}
            rotation={placement.angle} 
          />
        )
    } 
    { ghostParticipants
        .map(placement => 
          <ParticipantObject 
            id={"ghost" + placement.id}
            key={placement.id}
            name={participantList.find(x => strEquals(placement.participantId, x.id))?.displayName!} 
            colour={categories.find(x => strEquals(x.id, placement.categoryId))?.color || objectColorSettings["amberLight"]} 
            startX={getPixel(gridSize, placement.x)} 
            startY={getPixel(gridSize, placement.y)}
          />
      )
    }
  </Layer>)
}