import React, { useContext, useState } from "react";
import { categoryList, participantsList } from "../../data/ImaHitotabi.ts";
import { Participant } from "../../models/Participant.ts";
import ExpandableSection from "../ExpandableSection.tsx";
import ItemButton from "../ItemButton.tsx";
import SearchParticipantComponent from "../SearchParticipantComponent.tsx";
import { ParticipantPosition } from "../../models/Position.ts";
import { UserContext } from "../../contexts/UserContext.tsx";
import { PositionContext } from "../../contexts/PositionContext.tsx";
import { isNullOrUndefinedOrBlank, strEquals } from "../helpers/GlobalHelper.ts";
import { dbController } from "../../data/DBProvider.tsx";
import { DEFAULT_WIDTH } from "../../data/consts.ts";

export default function ParticipantPicker () {
  const [filterText, setFilterText] = useState<string>("");
  const {selectedSection, currentSections, currentMarginPosition, marginPositions, updateState} = useContext(UserContext);
  const {participantPositions, updatePositionState} = useContext(PositionContext);

  function setFilterTextWrapper(value: string) {
    setFilterText(value);
  }
  

  // const [selectedParticipants, setSelectedParticipants] = useState<Array<string>>([]);

  function selectParticipant(newParticipant: Participant) {
    if(selectedSection === null) return;

    // todo base multiples on name instead of id
    // todo remove id from hard coded participant list
    if (newParticipant.isPlaceholder) {
      // For dancer and staff, allow multiple
      var count = participantPositions.filter(x => x.participant.isPlaceholder && strEquals(x.formationScene.id, selectedSection.id)).length;
      newParticipant = {...newParticipant, id: `${newParticipant.id}-${count + 1}`, name: `${newParticipant.name} ${count + 1}`};
    } else if (participantPositions.some(x => strEquals(x.participant.id, newParticipant.id) && strEquals(x.formationScene!.id, selectedSection?.id))) {
      var count = participantPositions.filter(x => strEquals(x.participant.id, newParticipant.id) && strEquals(x.formationScene.id, selectedSection.id)).length;
      newParticipant = {...newParticipant, name: `${newParticipant.name} ${count}`};
    }
    
    var position = marginPositions[currentMarginPosition % marginPositions.length];
    updateState({currentMarginPosition: currentMarginPosition + 1});

    var newPositions = currentSections.map(section => 
      {
        return {
        id: crypto.randomUUID().toString(),
        participant: newParticipant,
        formationScene: section!,
        x: position[0],
        x2: position[0],
        y: position[1],
        y2: position[1],
        category: participantPositions.filter(x => strEquals(x.participant.id, newParticipant.id))?.[0]?.category ?? categoryList[0],
        isSelected: false
    } as ParticipantPosition});
    updatePositionState({participantPositions: [...participantPositions, ...newPositions]});
    dbController.upsertList("participantPosition", newPositions);
  }

  var participantListDisplay = participantsList
    .filter(x => x.name.toLowerCase().includes(filterText.toLowerCase()))
    .sort((a, b) => a.isPlaceholder ? -100 : 0 || a.name.localeCompare(b.name));
  
  return (
    <ExpandableSection title="参加者">
      <SearchParticipantComponent onValueChanged={(value) => setFilterTextWrapper(value)}/>
      <div className="flex flex-row flex-wrap flex-1 gap-2 overflow-scroll max-h-28">
        {participantListDisplay
          .map(participant => 
            <ItemButton
            key={participant.id}
            item={participant}
            //isDisabled={selectedParticipants.includes(participant.id)}
            onClick={() => selectParticipant(participant)}/>)} 
        {
          !isNullOrUndefinedOrBlank(filterText) &&
          <>
            <ItemButton
              item={{name: filterText} as Participant}
              //isDisabled={selectedParticipants.includes(participant.id)}
              onClick={() => selectParticipant({name: filterText} as Participant)}/> 
          </>
        }
      {/* todo: disable if used */}
      {/* todo: add undecided */}
      </div>
    </ExpandableSection>
  )
}