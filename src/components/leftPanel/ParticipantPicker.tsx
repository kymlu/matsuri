import React, { useContext, useState } from "react";
import { categoryList, participantsList } from "../../data/ImaHitotabi.ts";
import { Participant, ParticipantType } from "../../models/Participant.ts";
import ExpandableSection from "../ExpandableSection.tsx";
import ItemButton from "../ItemButton.tsx";
import SearchParticipantComponent from "../SearchParticipantComponent.tsx";
import { GRID_SIZE } from "../../data/consts.ts";
import { ParticipantPosition } from "../../models/Position.ts";
import { UserContext } from "../../contexts/UserContext.tsx";
import { FormationStateContext } from "../../contexts/FormationEditorContext.tsx";

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
      setSelectedParticipants(prev => (prev.filter(id => id !== newParticipant.id)))
      // updateFormationState({participantPositions: participantPositions.filter(x => x.participant.id != newPosition.participant.id)});
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
        category: categoryList[newParticipant.name.length % categoryList.length],
      };
        updateFormationState({participantPositions: [...participantPositions, newPosition]});
    }
  }
  
  return (
    <ExpandableSection title="Participants">
        <SearchParticipantComponent onValueChanged={(value) => setFilterTextWrapper(value)}/>
          <div className="max-h-40 overflow-scroll">
            <div className="flex flex-row flex-wrap gap-2">
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
        </div>
      </ExpandableSection>
  )
}