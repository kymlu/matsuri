import React, { useContext, useEffect, useMemo, useState } from "react";
import { songList } from "../../../data/ImaHitotabi.ts";
import { Participant, ParticipantPlaceholder } from "../../../models/Participant.ts";
import ExpandableSection from "../../ExpandableSection.tsx";
import ItemButton from "../../ItemButton.tsx";
import { ParticipantPosition } from "../../../models/Position.ts";
import { UserContext } from "../../../contexts/UserContext.tsx";
import { PositionContext } from "../../../contexts/PositionContext.tsx";
import { isNullOrUndefined, isNullOrUndefinedOrBlank } from "../../../lib/helpers/GlobalHelper.ts";
import { EntitiesContext } from "../../../contexts/EntitiesContext.tsx";
import TextInput from "../../TextInput.tsx";
import { ICON } from "../../../lib/consts.ts";
import { FormationContext } from "../../../contexts/FormationContext.tsx";
import { addItemsToRecordByKey, addItemToRecord } from "../../../lib/helpers/GroupingHelper.ts";
import { dbController } from "../../../lib/dataAccess/DBProvider.tsx";

export default function ParticipantPicker (props: {margins: number[][]}) {
  const [filterText, setFilterText] = useState<string>("");
  const {participantList, updateEntitiesContext} = useContext(EntitiesContext);
  const {selectedSection, selectedFestival, currentSections} = useContext(UserContext);
  const {selectedFormation} = useContext(FormationContext);
  const {participantPositions, updatePositionContextState} = useContext(PositionContext);
  const [participantsInFormation, setParticipantsInFormation] = useState<string[]>([]);

  function setFilterTextWrapper(value: string) {
    setFilterText(value);
  }

  useEffect(() => {
    setParticipantsInFormation(Object.values(participantPositions)[0]?.map(x => x.participantId));
  }, [selectedFormation]);
  
  function addParticipant(selectedParticipant: Participant) {
    if(isNullOrUndefined(selectedFormation) || isNullOrUndefined(selectedSection) === null) return;

    // var newParticipant: Participant = {
    //   id: crypto.randomUUID(),
    //   displayName: selectedParticipant.name,
    //   festivalId: selectedFestival!.id,
    //   isPlaceholder: selectedParticipant.isPlaceholder ?? false,
    //   placeholderNumber: Object.entries(participantList).length,
    //   memberId: selectedParticipant.id
    // }
    
    if (isNullOrUndefinedOrBlank(selectedParticipant.id)) {
      selectedParticipant.id = crypto.randomUUID();
      selectedParticipant.placeholderNumber = Math.max(...Object.values(participantList).map(x => x.placeholderNumber)) + 1;
    }

    setParticipantsInFormation(prev => prev ? [...prev, selectedParticipant.id] : [selectedParticipant.id]);
    
    var flattenedParticipants = Object.values(participantList);

    if (selectedParticipant.isPlaceholder) {
      selectedParticipant.displayName = `${selectedParticipant.displayName} ${flattenedParticipants.length + 1}`;
    }
    
    var position = props.margins[flattenedParticipants.length % props.margins.length];
    var newPositions = currentSections.map(section => 
      {
        return {
          id: crypto.randomUUID().toString(),
          participantId: selectedParticipant.id,
          formationSectionId: section!.id,
          x: position[0],
          y: position[1],
          categoryId: songList[selectedFormation!.songId].categories[0].id,
          isSelected: false
        } as ParticipantPosition
      });

    
    var updatedParticipants = addItemToRecord(participantList, selectedParticipant.id, selectedParticipant);
    updateEntitiesContext({participantList: updatedParticipants});
    
    var updatedPositions = addItemsToRecordByKey(participantPositions, newPositions, (item) => item.formationSectionId);
    console.log("updatedPositions", updatedPositions);
    updatePositionContextState({participantPositions: updatedPositions});
    
    dbController.upsertItem("participant", selectedParticipant);
    dbController.upsertList("participantPosition", newPositions);
  }

  function addPlaceholder(name: string, categoryId: string) {
    console.log("Todo: implement", name, categoryId);
	  var id = crypto.randomUUID();
	  var newPlaceholder: ParticipantPlaceholder = {
		  id: id,
		  displayName: `${name} ${}`, // TODO: add count
		  formationId: selectedFormation.id,
	  }
	  // todo: update db
	  // todo: create all placeholderPositions
	  // todo: update placeholderPositions in db
  }

  const participantListDisplay = useMemo(() => {
    console.log("reset", participantsInFormation, Object.values(participantList)
    .filter(x => !participantsInFormation.includes(x.id) && x.displayName.toLowerCase().includes(filterText?.toLowerCase()))
    .sort((a, b) => a.displayName.localeCompare(b.displayName)))
    return Object.values(participantList)
      .filter(x => !participantsInFormation.includes(x.id) && x.displayName.toLowerCase().includes(filterText?.toLowerCase()))
      .sort((a, b) => a.displayName.localeCompare(b.displayName));
  }, [filterText, participantsInFormation, participantList, participantPositions]);
  
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
        <ItemButton
          text="踊り子"
          onClick={() => addPlaceholder("踊り子", "0")}/>
        <ItemButton
          text="スタッフ"
          onClick={() => addPlaceholder("スタッフ", "1")}/>
        {participantListDisplay
          .map(participant => 
            <ItemButton
            key={participant.id}
            text={participant.displayName}
            //isDisabled={selectedParticipants.includes(participant.id)}
            onClick={() => addParticipant(participant)}/>)} 
        {
          !isNullOrUndefinedOrBlank(filterText) &&
          <>
            <ItemButton
              text={`NEW: "${filterText}"`}
              //isDisabled={selectedParticipants.includes(participant.id)}
              onClick={() => addParticipant({displayName: filterText} as Participant)}/> 
          </>
        }
      </div>
    </ExpandableSection>
  )
}
