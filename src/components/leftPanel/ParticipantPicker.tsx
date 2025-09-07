import React, { useContext, useState } from "react";
import { categoryList, teamMembers } from "../../data/ImaHitotabi.ts";
import { Participant, ParticipantOption } from "../../models/Participant.ts";
import ExpandableSection from "../ExpandableSection.tsx";
import ItemButton from "../ItemButton.tsx";
import { ParticipantPosition } from "../../models/Position.ts";
import { UserContext } from "../../contexts/UserContext.tsx";
import { PositionContext } from "../../contexts/PositionContext.tsx";
import { isNullOrUndefined, isNullOrUndefinedOrBlank, strEquals } from "../helpers/GlobalHelper.ts";
import { dbController } from "../../data/DBProvider.tsx";
import { FormationContext } from "../../contexts/FormationContext.tsx";
import ClearableTextInput from "../ClearableTextInput.tsx";

export default function ParticipantPicker () {
  const [filterText, setFilterText] = useState<string>("");
  const {participantList, updateFormationContext} = useContext(FormationContext);
  const {selectedSection, currentSections, marginPositions, selectedFormation} = useContext(UserContext);
  const {participantPositions, updatePositionState} = useContext(PositionContext);

  function setFilterTextWrapper(value: string) {
    setFilterText(value);
  }
  
  // const [selectedParticipants, setSelectedParticipants] = useState<Array<string>>([]);

  function selectParticipant(selectedParticipant: ParticipantOption) {
    if(isNullOrUndefined(selectedFormation) || isNullOrUndefined(selectedSection) === null) return;

    var newParticipant: Participant = {
      id: crypto.randomUUID(),
      displayName: selectedParticipant.name,
      formationId: selectedFormation!.id,
      memberId: selectedParticipant.id
    }

    if (selectedParticipant.isPlaceholder) {
      newParticipant.displayName = `${selectedParticipant.name} ${participantList.length + 1}`;
    } else if (participantList.some(x => strEquals(x.memberId, selectedParticipant.id))) {
      var count = participantList.filter(x => strEquals(x.memberId, selectedParticipant.id)).length;
      newParticipant.displayName = `${selectedParticipant.name} ${count}`;
    }
    
    var position = marginPositions.participants[participantList.length % marginPositions.participants.length];
    var newPositions = currentSections.map(section => 
      {
        return {
          id: crypto.randomUUID().toString(),
          participantId: newParticipant.id,
          formationSceneId: section!.id,
          x: position[0],
          x2: position[0],
          y: position[1],
          y2: position[1],
          categoryId: categoryList[0].id,
          isSelected: false
        } as ParticipantPosition
      });
    updateFormationContext({participantList: [...participantList, newParticipant]});
    updatePositionState({participantPositions: [...participantPositions, ...newPositions]});
    dbController.upsertItem("participant", newParticipant);
    dbController.upsertList("participantPosition", newPositions);
  }

  var participantListDisplay = teamMembers
    .filter(x => x.name.toLowerCase().includes(filterText?.toLowerCase()))
    .sort((a, b) => a.isPlaceholder ? -100 : 0 || a.name.localeCompare(b.name));
  
  return (
    <ExpandableSection title="参加者">
      <ClearableTextInput text={filterText} placeholder="探す" onContentChange={(event) => setFilterTextWrapper(event.target?.value ?? "")}/>
      <div className="flex flex-row flex-wrap flex-1 gap-2 overflow-scroll max-h-28">
        {participantListDisplay
          .map(participant => 
            <ItemButton
            key={participant.id}
            item={participant}
            display={participant.name}
            //isDisabled={selectedParticipants.includes(participant.id)}
            onClick={() => selectParticipant(participant)}/>)} 
        {
          !isNullOrUndefinedOrBlank(filterText) &&
          <>
            <ItemButton
              item={{name: filterText} as ParticipantOption}
              display={`NEW: "${filterText}"`}
              //isDisabled={selectedParticipants.includes(participant.id)}
              onClick={() => selectParticipant({name: filterText} as ParticipantOption)}/> 
          </>
        }
      {/* todo: disable if used */}
      {/* todo: add undecided */}
      </div>
    </ExpandableSection>
  )
}