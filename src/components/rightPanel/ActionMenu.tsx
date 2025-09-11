import React, { useContext, useEffect, useState } from "react";
import ExpandableSection from "../ExpandableSection.tsx";
import { UserContext } from "../../contexts/UserContext.tsx";
import Button from "../Button.tsx";
import { dbController } from "../../data/DBProvider.tsx";
import { Participant } from "../../models/Participant.ts";
import { ParticipantPosition, PropPosition, PositionType, getFromPositionType, splitPositionsByType } from "../../models/Position.ts";
import { Prop } from "../../models/Prop.ts";
import { FormationContext } from "../../contexts/FormationContext.tsx";
import { PositionContext } from "../../contexts/PositionContext.tsx";

export default function ActionMenu() {
  const {noteList, participantList, propList, updateFormationContext} = useContext(FormationContext)
  const userContext = useContext(UserContext)
  const {selectedItems, selectedSection, selectedFormation} = useContext(UserContext)
  const {participantPositions, propPositions, updatePositionState} = useContext(PositionContext);
  const [selectedPositionTypes, setSelectedPositionTypes] = useState<Set<PositionType>>();

  useEffect(() => {
    setSelectedPositionTypes(new Set(selectedItems.map(x => x.type)));
  }, [userContext.selectedItems]);

  function deleteObject() {
    if (selectedItems.length === 0) return;

    const {participants, props, notes} = splitPositionsByType(selectedItems);

    if (participants.length > 0) {
      var selectedParticipantIds = participants
        .map(x => x.participantId);
      var participantsToRemove = participantPositions.filter(x => selectedParticipantIds.includes(x.participantId)).map(x => x.id);
      Promise.all([
        dbController.removeList("participant", selectedParticipantIds),
        dbController.removeList("participantPosition", participantsToRemove)
      ]).then(() => {
        try {
          updatePositionState({
            participantPositions: participantPositions.filter(x => !participantsToRemove.includes(x.id)),
          });
          updateFormationContext({
            participantList: participantList.filter(x => !selectedParticipantIds.includes(x.id))
          });
        } catch (e) {
          console.error('Error parsing user from localStorage:', e);
        }
      });
    }

    if (props.length > 0) {
      var selectedPropIds = props
        .map(x => x.propId);
      var propsToRemove = propPositions.filter(x => selectedPropIds.includes(x.propId)).map(x => x.id);
      Promise.all([
        dbController.removeList("prop", selectedPropIds),
        dbController.removeList("propPosition", propsToRemove)
      ]).then(() => {
        try {
          updatePositionState({
            propPositions: propPositions.filter(x => !propsToRemove.includes(x.id)),
          });
          updateFormationContext({
            propList: propList.filter(x => !selectedPropIds.includes(x.id))
          });
        } catch (e) {
          console.error('Error parsing user from localStorage:', e);
        }
      });
    }

    if (notes.length > 0) {
      var selectedItemIds = notes
        .map(x => x.id);
      updateFormationContext({noteList: noteList.filter(x => !selectedItemIds.includes(x.id))});
      dbController.removeList("notePosition", selectedItemIds);
    }
  }
  
  return (
    <ExpandableSection title="アクション" defaultIsExpanded>
      { 
        selectedItems.length > 0 && 
        selectedPositionTypes?.size === 1 && 
        selectedPositionTypes.entries[0] === PositionType.participant && 
        <Button label="Select same category">同カテゴリー選択（無効）</Button>
      }

      <Button label="Delete item" onClick={() => {deleteObject()}}>削除</Button>
    </ExpandableSection>
  )
}