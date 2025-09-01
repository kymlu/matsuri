import React, { useContext, useState } from "react";
import { categoryList, participantsList } from "../../data/ImaHitotabi.ts";
import { Participant } from "../../models/Participant.ts";
import ExpandableSection from "../ExpandableSection.tsx";
import ItemButton from "../ItemButton.tsx";
import SearchParticipantComponent from "../SearchParticipantComponent.tsx";
import { ParticipantPosition } from "../../models/Position.ts";
import { UserContext } from "../../contexts/UserContext.tsx";
import { PositionContext } from "../../contexts/PositionContext.tsx";
import { strEquals } from "../helpers/GlobalHelper.ts";
import { dbController } from "../../data/DBProvider.tsx";
import { DEFAULT_WIDTH } from "../../data/consts.ts";

export default function ParticipantPicker () {
  const [filterText, setFilterText] = useState<string>("");
  const {selectedFormation, selectedSection} = useContext(UserContext);
  const {participantPositions, updatePositionState} = useContext(PositionContext);

  function setFilterTextWrapper(value: string) {
    setFilterText(value);
  }

  // const [selectedParticipants, setSelectedParticipants] = useState<Array<string>>([]);

  function selectParticipant(newParticipant: Participant) {
    if(selectedSection === null) return;

    if (newParticipant.isPlaceholder) {
      // For dancer and staff, allow multiple
      var count = participantPositions.filter(x => x.participant.isPlaceholder).length;
      newParticipant = {...newParticipant, id: `${newParticipant.id}-${count + 1}`, name: `${newParticipant.name} ${count + 1}`};
    }
    if (participantPositions.some(x => strEquals(x.participant.id, newParticipant.id) && strEquals(x.formationScene!.id, selectedSection?.id))) {
      var count = participantPositions.filter(x => strEquals(x.participant.id, newParticipant.id)).length;
      newParticipant = {...newParticipant, name: `${newParticipant.name} ${count}`};
    }
    var newPosition: ParticipantPosition = {
      id: crypto.randomUUID().toString(),
      participant: newParticipant,
      formationScene: selectedSection!,
      x: DEFAULT_WIDTH/2,
      x2: DEFAULT_WIDTH/2,
      y: 2,
      y2: 2,
      category: participantPositions.filter(x => strEquals(x.participant.id, newParticipant.id))?.[0]?.category ?? categoryList[0],
      isSelected: false
    };
    updatePositionState({participantPositions: [...participantPositions, newPosition]});
    dbController.upsertItem("participantPosition", newPosition);
  }
  
  return (
    <ExpandableSection title="参加者">
        <SearchParticipantComponent onValueChanged={(value) => setFilterTextWrapper(value)}/>
        <div className="flex flex-row flex-wrap flex-1 gap-2 overflow-scroll">
          {participantsList
            .filter(x => x.name.includes(filterText))
            .sort((a, b) => a.isPlaceholder ? -100 : 0 || a.name.localeCompare(b.name))
            .map(participant => 
              <ItemButton
              key={participant.id}
              item={participant}
              //isDisabled={selectedParticipants.includes(participant.id)}
              onClick={() => selectParticipant(participant)}/>)} 
        {/* todo: disable if used */}
        {/* todo: add undecided */}
      </div>
    </ExpandableSection>
  )
}