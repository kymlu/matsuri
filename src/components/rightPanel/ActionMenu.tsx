import React, { useContext, useEffect, useState } from "react";
import ExpandableSection from "../ExpandableSection.tsx";
import { UserContext } from "../../contexts/UserContext.tsx";
import Button from "../Button.tsx";
import { dbController } from "../../data/DBProvider.tsx";
import { PositionType, splitPositionsByType } from "../../models/Position.ts";
import { FormationContext } from "../../contexts/FormationContext.tsx";
import { PositionContext } from "../../contexts/PositionContext.tsx";
import { CUSTOM_EVENT } from "../../data/consts.ts";
import { CategoryContext } from "../../contexts/CategoryContext.tsx";
import { strEquals } from "../helpers/GlobalHelper.ts";
import { ParticipantCategory } from "../../models/ParticipantCategory.ts";

export default function ActionMenu() {
  const {participantList, propList, updateFormationContext} = useContext(FormationContext);
  const userContext = useContext(UserContext);
  const {categories} = useContext(CategoryContext);
  const {selectedItems} = useContext(UserContext);
  const {participantPositions, propPositions, notePositions, updatePositionState} = useContext(PositionContext);
  const [selectedPositionType, setSelectedPositionType] = useState<PositionType | null>();
  const [selectedCategory, setSelectedCategory] = useState<ParticipantCategory | null>(null);

  useEffect(() => {
    var currentPositionTypes = new Set(selectedItems.map(x => x.type));
    if (currentPositionTypes.size == 1) {
      setSelectedPositionType(currentPositionTypes.values().next().value);
    } else {
      setSelectedPositionType(null);
    }

    var currentCategories = new Set(splitPositionsByType(userContext.selectedItems).participants.map(x => x.categoryId));
    if (currentCategories.size == 1) {
      var catId = currentCategories.values().next().value;
      setSelectedCategory(categories.find(x => strEquals(x.id, catId)) ?? null);
    } else {
      setSelectedCategory(null);
    }
  }, [userContext.selectedItems]);

  function selectAllFromCategory() {
    const selectAllEvent = new CustomEvent(
      CUSTOM_EVENT.selectAllFromCategory, 
      {
        detail: {
          categoryId: selectedCategory?.id,
        },
      });
    window.dispatchEvent(selectAllEvent);
  }

  function selectAllOfType() {
    const selectAllEvent = new CustomEvent(
      CUSTOM_EVENT.selectAllPositionType, 
      {
        detail: {
          positionType: selectedPositionType,
        },
      });
    window.dispatchEvent(selectAllEvent);
  }
  
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
      updatePositionState({notePositions: notePositions.filter(x => !selectedItemIds.includes(x.id))});
      dbController.removeList("notePosition", selectedItemIds);
    }
  }
  
  return (
    <ExpandableSection title="アクション" defaultIsExpanded>
      <div className="flex flex-col gap-1">
        { 
          selectedCategory && 
          <Button full
            label="Select all from same category"
            onClick={() => {selectAllFromCategory()}}>
            全ての{selectedCategory.name}を選択
          </Button>
        }
        { 
          selectedPositionType && 
          <Button full
            label="Select all from same position type"
            onClick={() => {selectAllOfType()}}>
            全ての{selectedPositionType}を選択
          </Button>
        }
        <Button full
          label="Delete item"
          onClick={() => {deleteObject()}}>
          削除
        </Button>
      </div>
    </ExpandableSection>
  )
}