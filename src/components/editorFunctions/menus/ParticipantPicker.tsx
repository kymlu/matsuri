import React, { useContext, useState } from "react";
import { songList, teamMembers } from "../../../data/ImaHitotabi.ts";
import { Participant, ParticipantOption } from "../../../models/Participant.ts";
import ExpandableSection from "../../ExpandableSection.tsx";
import ItemButton from "../../ItemButton.tsx";
import { ParticipantPosition } from "../../../models/Position.ts";
import { UserContext } from "../../../contexts/UserContext.tsx";
import { PositionContext } from "../../../contexts/PositionContext.tsx";
import { isNullOrUndefined, isNullOrUndefinedOrBlank, strEquals } from "../../../lib/helpers/GlobalHelper.ts";
import { EntitiesContext } from "../../../contexts/EntitiesContext.tsx";
import TextInput from "../../TextInput.tsx";
import { ICON } from "../../../lib/consts.ts";
import { FormationContext } from "../../../contexts/FormationContext.tsx";
import { addItemsToRecordByKey, addItemToRecord } from "../../../lib/helpers/GroupingHelper.ts";
import { dbController } from "../../../lib/dataAccess/DBProvider.tsx";

export default function ParticipantPicker (props: {margins: number[][]}) {
  const [filterText, setFilterText] = useState<string>("");
  const {participantList, updateEntitiesContext} = useContext(EntitiesContext);
  const {selectedSection, currentSections} = useContext(UserContext);
  const {selectedFormation} = useContext(FormationContext);
  const {participantPositions, updatePositionContextState} = useContext(PositionContext);

  function setFilterTextWrapper(value: string) {
    setFilterText(value);
  }
  
  function addParticipant(selectedParticipant: ParticipantOption) {
    if(isNullOrUndefined(selectedFormation) || isNullOrUndefined(selectedSection) === null) return;

    var newParticipant: Participant = {
      id: crypto.randomUUID(),
      displayName: selectedParticipant.name,
      formationId: selectedFormation!.id,
      memberId: selectedParticipant.id
    }

    var flattenedParticipants = Object.values(participantList);

    if (selectedParticipant.isPlaceholder) {
      newParticipant.displayName = `${selectedParticipant.name} ${flattenedParticipants.length + 1}`;
    } else if (flattenedParticipants.some(x => strEquals(x.memberId, selectedParticipant.id))) {
      var count = flattenedParticipants.filter(x => strEquals(x.memberId, selectedParticipant.id)).length;
      newParticipant.displayName = `${selectedParticipant.name} ${count}`;
    }
    
    var position = props.margins[flattenedParticipants.length % props.margins.length];
    var newPositions = currentSections.map(section => 
      {
        return {
          id: crypto.randomUUID().toString(),
          participantId: newParticipant.id,
          formationSectionId: section!.id,
          x: position[0],
          y: position[1],
          categoryId: songList[selectedFormation!.songId].categories[0].id,
          isSelected: false
        } as ParticipantPosition
      });

    
    var updatedParticipants = addItemToRecord(participantList, newParticipant.id, newParticipant);
    updateEntitiesContext({participantList: updatedParticipants});
    
    var updatedPositions = addItemsToRecordByKey(participantPositions, newPositions, (item) => item.formationSectionId);
    updatePositionContextState({participantPositions: updatedPositions});
    
    dbController.upsertItem("participant", newParticipant);
    dbController.upsertList("participantPosition", newPositions);
  }

  var participantListDisplay = teamMembers
    .filter(x => x.name.toLowerCase().includes(filterText?.toLowerCase()))
    .sort((a, b) => a.isPlaceholder ? -100 : 0 || a.name.localeCompare(b.name));
  
  return (
    <ExpandableSection
			canExpand
      title="参加者"
      titleIcon={ICON.groups2Black}>
      <TextInput
        clearable
        default={filterText}
        placeholder="探す"
        onContentChange={(newValue) => setFilterTextWrapper(newValue ?? "")}/>
      <div className="flex flex-row flex-wrap flex-1 gap-2 overflow-x-hidden overflow-y-scroll max-h-32">
        {participantListDisplay
          .map(participant => 
            <ItemButton
            key={participant.id}
            text={participant.name}
            //isDisabled={selectedParticipants.includes(participant.id)}
            onClick={() => addParticipant(participant)}/>)} 
        {
          !isNullOrUndefinedOrBlank(filterText) &&
          <>
            <ItemButton
              text={`NEW: "${filterText}"`}
              //isDisabled={selectedParticipants.includes(participant.id)}
              onClick={() => addParticipant({name: filterText} as ParticipantOption)}/> 
          </>
        }
      </div>
    </ExpandableSection>
  )
}