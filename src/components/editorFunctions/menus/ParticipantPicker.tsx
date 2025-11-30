import React, { useContext, useEffect, useMemo, useState } from "react";
import { songList } from "../../../data/ImaHitotabi.ts";
import { Participant, ParticipantPlaceholder } from "../../../models/Participant.ts";
import ExpandableSection from "../../ExpandableSection.tsx";
import ItemButton from "../../ItemButton.tsx";
import { ParticipantPosition, PlaceholderPosition } from "../../../models/Position.ts";
import { UserContext } from "../../../contexts/UserContext.tsx";
import { PositionContext } from "../../../contexts/PositionContext.tsx";
import { isNullOrUndefined, isNullOrUndefinedOrBlank } from "../../../lib/helpers/GlobalHelper.ts";
import { EntitiesContext } from "../../../contexts/EntitiesContext.tsx";
import TextInput from "../../TextInput.tsx";
import { ICON } from "../../../lib/consts.ts";
import { FormationContext } from "../../../contexts/FormationContext.tsx";
import { addItemsToRecordByKey, addItemToRecord } from "../../../lib/helpers/GroupingHelper.ts";
import { upsertItem, upsertList } from "../../../data/DataRepository.ts";
import { CategoryContext } from "../../../contexts/CategoryContext.tsx";

export default function ParticipantPicker (props: {margins: number[][]}) {
  const [filterText, setFilterText] = useState<string>("");
  const {participantList, placeholderList, updateEntitiesContext} = useContext(EntitiesContext);
  const {selectedSection, currentSections} = useContext(UserContext);
  const {selectedFormation} = useContext(FormationContext);
  const {categories} = useContext(CategoryContext);
  const {participantPositions, updatePositionContextState, placeholderPositions} = useContext(PositionContext);
  const [participantsInFormation, setParticipantsInFormation] = useState<string[]>([]);

  const songCategories = useMemo(() => 
    Object.values(categories).sort((a, b) => a.order - b.order), 
    [categories]);

  const setFilterTextWrapper = (value: string) => {
    setFilterText(value);
  }

  useEffect(() => {
    setParticipantsInFormation(Object.values(participantPositions)[0]?.map(x => x.participantId) ?? []);
  }, [selectedFormation, participantPositions]);
  
  const addParticipant = (selectedParticipant: Participant) => {
    if(isNullOrUndefined(selectedFormation) || isNullOrUndefined(selectedSection) === null) return;
    
    if (isNullOrUndefinedOrBlank(selectedParticipant.id)) {
      selectedParticipant.id = crypto.randomUUID();
    }

    setParticipantsInFormation(prev => prev ? [...prev, selectedParticipant.id] : [selectedParticipant.id]);

    var position = props.margins[getNextMarginIndex()];
    var newPositions = currentSections.map(section => 
      {
        return {
          id: crypto.randomUUID().toString(),
          participantId: selectedParticipant.id,
          formationSectionId: section!.id,
          x: position[0],
          y: position[1],
          categoryId: songCategories[0].id,
          isSelected: false
        } as ParticipantPosition
      });
    
    var updatedParticipants = addItemToRecord(participantList, selectedParticipant.id, selectedParticipant);
    updateEntitiesContext({participantList: updatedParticipants});
    
    var updatedPositions = addItemsToRecordByKey(participantPositions, newPositions, (item) => item.formationSectionId);
    console.log("updatedPositions", updatedPositions);
    updatePositionContextState({participantPositions: updatedPositions});
    
    upsertItem("participant", selectedParticipant);
    upsertList("participantPosition", newPositions);
  }

  const getNextMarginIndex = () => {
    return (((selectedSection == null || participantPositions[selectedSection.id] == null) ? 0 : Object.values(participantPositions[selectedSection.id]).length) + Object.values(placeholderList).length) % props.margins.length;
  }

  const addPlaceholder = (name: string, categoryId: string) => {
    var id = crypto.randomUUID();
	  var newPlaceholder: ParticipantPlaceholder = {
		  id: id,
		  displayName: `${name} ${Object.keys(placeholderList).length}`, // TODO: add count
		  formationId: selectedFormation!.id,
	  }
    upsertItem("placeholder", newPlaceholder);
    var updatedPlaceholders = addItemToRecord(placeholderList, newPlaceholder.id, newPlaceholder);
    updateEntitiesContext({placeholderList: updatedPlaceholders})

    var position = props.margins[getNextMarginIndex()];
    var newPositions: PlaceholderPosition[] = currentSections.map(x => ({
      id: crypto.randomUUID(),
      placeholderId: id, 
      categoryId: categoryId,
      x: position[0],
      y: position[1],
      formationSectionId: x.id,
    } as PlaceholderPosition));
    
    var updatedPositions = addItemsToRecordByKey(placeholderPositions, newPositions, (item) => item.formationSectionId);
    updatePositionContextState({placeholderPositions: updatedPositions})
    upsertList("placeholderPosition", newPositions);
  }

  const participantListDisplay = useMemo(() => {
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
