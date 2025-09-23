import React, { useContext, useState } from "react";
import { categoryList, teamMembers } from "../../../data/ImaHitotabi.ts";
import { Participant, ParticipantOption } from "../../../models/Participant.ts";
import ExpandableSection from "../../ExpandableSection.tsx";
import ItemButton from "../../ItemButton.tsx";
import { ParticipantPosition } from "../../../models/Position.ts";
import { UserContext } from "../../../contexts/UserContext.tsx";
import { PositionContext } from "../../../contexts/PositionContext.tsx";
import { isNullOrUndefined, isNullOrUndefinedOrBlank, strEquals } from "../../../helpers/GlobalHelper.ts";
import { dbController } from "../../../data/DBProvider.tsx";
import { EntitiesContext } from "../../../contexts/EntitiesContext.tsx";
import TextInput from "../../TextInput.tsx";
import { ICON } from "../../../data/consts.ts";
import { FormationContext } from "../../../contexts/FormationContext.tsx";
import { addItemsToRecordByKey, addItemToRecord } from "../../../helpers/GroupingHelper.ts";

export default function ParticipantPicker (props: {margins: number[][]}) {
  const [filterText, setFilterText] = useState<string>("");
  const {participantList, updateEntitiesContext} = useContext(EntitiesContext);
  const {selectedSection, currentSections} = useContext(UserContext);
  const {selectedFormation} = useContext(FormationContext);
  const {participantPositions, updatePositionContextState} = useContext(PositionContext);

  function setFilterTextWrapper(value: string) {
    setFilterText(value);
  }
  
  // const [selectedParticipants, setSelectedParticipants] = useState<Array<string>>([]);

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
          categoryId: categoryList[0].id,
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
      title="参加者"
      titleIcon={ICON.groups2Black}>
      <TextInput
        clearable
        text={filterText}
        placeholder="探す"
        onContentChange={(newValue) => setFilterTextWrapper(newValue ?? "")}/>
      <div className="flex flex-row flex-wrap flex-1 gap-2 overflow-x-hidden overflow-y-scroll max-h-32">
        {participantListDisplay
          .map(participant => 
            <ItemButton
            key={participant.id}
            item={participant}
            display={participant.name}
            //isDisabled={selectedParticipants.includes(participant.id)}
            onClick={() => addParticipant(participant)}/>)} 
        {
          !isNullOrUndefinedOrBlank(filterText) &&
          <>
            <ItemButton
              item={{name: filterText} as ParticipantOption}
              display={`NEW: "${filterText}"`}
              //isDisabled={selectedParticipants.includes(participant.id)}
              onClick={() => addParticipant({name: filterText} as ParticipantOption)}/> 
          </>
        }
      </div>
    </ExpandableSection>
  )
}