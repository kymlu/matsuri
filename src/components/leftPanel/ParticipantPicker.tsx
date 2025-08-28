import React, { useContext, useState } from "react";
import { categoryList, participantsList } from "../../data/ImaHitotabi.ts";
import { Participant } from "../../models/Participant.ts";
import ExpandableSection from "../ExpandableSection.tsx";
import ItemButton from "../ItemButton.tsx";
import SearchParticipantComponent from "../SearchParticipantComponent.tsx";
import { ParticipantPosition } from "../../models/Position.ts";
import { UserContext } from "../../contexts/UserContext.tsx";
import { FormationStateContext } from "../../contexts/FormationEditorContext.tsx";
import { db } from "../../App.tsx";
import { strEquals } from "../helpers/GlobalHelper.ts";

export default function ParticipantPicker () {
  const [filterText, setFilterText] = useState<string>("");
  const {selectedFormation} = useContext(UserContext);
  const {participantPositions, updateFormationState} = useContext(FormationStateContext);

  function setFilterTextWrapper(value: string) {
    setFilterText(value);
  }

  const [selectedParticipants, setSelectedParticipants] = useState<Array<string>>([]);

  
  function selectParticipant(newParticipant: Participant) {
    if (selectedParticipants.includes(newParticipant.id) && !newParticipant.isPlaceholder) {
      setSelectedParticipants(prev => (prev.filter(id => strEquals(id, newParticipant.id))))
      updateFormationState({participantPositions: participantPositions.filter(x => strEquals(x.participant.id, newParticipant.id))});
    } else {
      if (newParticipant.isPlaceholder) {
        // For dancer and staff, allow multiple
        var count = participantPositions.filter(x => x.participant.isPlaceholder).length;
        newParticipant = {...newParticipant, id: `${newParticipant.id}-${count + 1}`, name: `${newParticipant.name} ${count + 1}`};
      }
      setSelectedParticipants(prev => ([...prev, newParticipant.id]));
      var newPosition: ParticipantPosition = {
        id: crypto.randomUUID().toString(),
        participant: newParticipant,
        formationSceneId: "", // todo
        x: selectedFormation?.width ? selectedFormation.width / 2 : 5,
        x2: selectedFormation?.width ? selectedFormation.width / 2 : 5,
        y: selectedFormation?.length ? selectedFormation.length / 2 : 5,
        y2: selectedFormation?.length ? selectedFormation.length / 2 : 5,
        category: categoryList[0],
        isSelected: false
      };
      updateFormationState({participantPositions: [...participantPositions, newPosition]});
      db.upsertItem("participantPosition", newPosition);
    }
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
              isDisabled={selectedParticipants.includes(participant.id)}
              onClick={() => selectParticipant(participant)}/>)} 
        {/* todo: disable if used */}
        {/* todo: add undecided */}
      </div>
    </ExpandableSection>
  )
}