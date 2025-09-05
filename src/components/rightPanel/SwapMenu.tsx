import React, { useContext } from "react";
import ExpandableSection from "../ExpandableSection.tsx";
import Button from "../Button.tsx";
import ItemButton from "../ItemButton.tsx";
import { PositionContext } from "../../contexts/PositionContext.tsx";
import { UserContext } from "../../contexts/UserContext.tsx";
import { strEquals } from "../helpers/GlobalHelper.ts";
import { FormationContext } from "../../contexts/FormationContext.tsx";
import { isParticipant, ParticipantPosition } from "../../models/Position.ts";

export default function SwapMenu() {
  const {selectedSection, selectedItem} = useContext(UserContext);
  const {participantList} = useContext(FormationContext);
  const {participantPositions} = useContext(PositionContext);

  return (
    <ExpandableSection title="隊列交換">
      <div className="flex flex-row flex-wrap gap-2">
          {participantList
            .filter(x => (selectedItem == null || isParticipant(selectedItem) || !strEquals(x.id, (selectedItem as unknown as ParticipantPosition).participantId)))
            .sort((a, b) => a.displayName.localeCompare(b.displayName))
            .map(participant => 
              <ItemButton
                key={participant.id}
                item={{name: participant.displayName, id: participant.id}}/>)} 
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