import React, { useContext } from "react";
import ExpandableSection from "../ExpandableSection.tsx";
import Button from "../Button.tsx";
import ItemButton from "../ItemButton.tsx";
import { PositionContext } from "../../contexts/PositionContext.tsx";

export default function SwapMenu() {
  const {participantPositions} = useContext(PositionContext);

  return (
    <ExpandableSection title="隊列交換">
      <div className="flex flex-row flex-wrap gap-2">
          {participantPositions
            .flatMap(x => x.participant)
            .sort((a, b) => a.isPlaceholder ? -100 : 0 || a.name.localeCompare(b.name))
            .map(participant => 
              <ItemButton
              key={participant.id}
              item={participant}/>)} 
            {/* todo: disable if used */}
            {/* todo: add undecided */}
        </div>
        <div className="flex flex-row flex-wrap gap-1">
          <Button disabled>当シーン</Button>
          <Button disabled>以降のシーン</Button>
          <Button disabled>全てのシーン</Button>
        </div>
    </ExpandableSection>
  )
}