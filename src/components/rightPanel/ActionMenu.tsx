import React, { useContext, useEffect, useState } from "react";
import ExpandableSection from "../ExpandableSection.tsx";
import { UserContext } from "../../contexts/UserContext.tsx";
import Button from "../Button.tsx";
import { dbController } from "../../data/DBProvider.tsx";
import { PositionType, splitPositionsByType } from "../../models/Position.ts";
import { FormationContext } from "../../contexts/FormationContext.tsx";
import { PositionContext } from "../../contexts/PositionContext.tsx";
import { CUSTOM_EVENT, ICON } from "../../data/consts.ts";
import { CategoryContext } from "../../contexts/CategoryContext.tsx";
import { strEquals } from "../helpers/GlobalHelper.ts";
import { ParticipantCategory } from "../../models/ParticipantCategory.ts";
import { Participant } from "../../models/Participant.ts";
import Divider from "../Divider.tsx";

export default function ActionMenu() {
  const {participantList, propList, updateFormationContext} = useContext(FormationContext);
  const userContext = useContext(UserContext);
  const {categories} = useContext(CategoryContext);
  const {selectedItems, currentSections, selectedSection, updateState} = useContext(UserContext);
  const {participantPositions, propPositions, notePositions, updatePositionState} = useContext(PositionContext);
  const [selectedPositionType, setSelectedPositionType] = useState<PositionType | null>();
  const [selectedCategory, setSelectedCategory] = useState<ParticipantCategory | null>(null);
  const [swapMenuExpanded, setSwapMenuExpanded] = useState<boolean>(false);
  const [swappableParticipants, setSwappableParticipants] = useState<Participant[]>([])

  useEffect(() => {
    var currentPositionTypes = new Set(selectedItems.map(x => x.type));
    if (currentPositionTypes.size === 1) {
      setSelectedPositionType(currentPositionTypes.values().next().value);
      
      var positionType = currentPositionTypes.values().next().value;
      if (selectedItems.length === 2 && positionType === PositionType.participant) {
        var participantIds = selectedItems
          .filter(x => x.type === PositionType.participant)
          .map(x => x.participant.participantId);
        setSwappableParticipants(participantList
          .filter(x => participantIds.includes(x.id))
          .sort((a, b) => a.displayName.localeCompare(b.displayName)));
      } else {
        setSwappableParticipants([]);
      }
    } else {
      setSelectedPositionType(null);
      setSwappableParticipants([]);
    }
    
    setSwapMenuExpanded(false);

    var currentCategories = new Set(splitPositionsByType(userContext.selectedItems).participants.map(x => x.categoryId));
    if (currentCategories.size === 1) {
      var catId = currentCategories.values().next().value;
      setSelectedCategory(categories.find(x => strEquals(x.id, catId)) ?? null);
    } else {
      setSelectedCategory(null);
    }
  }, [userContext.selectedItems]);

  function swapParticipants(mode: "current" | "currentOnwards" | "all") {
    if (selectedSection == null) return
    var sectionIds: string[] = [];
    switch (mode) {
      case "current":
        sectionIds = [selectedSection.id];
        break;
      case "currentOnwards":
        sectionIds = currentSections.filter(x => x.order >= selectedSection.order).map(x => x.id);
        break;
      
      case "all":
        sectionIds = currentSections.map(x => x.id);
        break;
    }

    var updatedPositions = participantPositions
      .filter(x => sectionIds.includes(x.formationSectionId) &&
        (strEquals(x.participantId, swappableParticipants[0].id) ||
        strEquals(x.participantId, swappableParticipants[1].id)))
      .map(x => ({
        ...x,
        participantId: strEquals(x.participantId, swappableParticipants[0].id) ?
          swappableParticipants[1].id : swappableParticipants[0].id}));

    var updatedPositionIds = updatedPositions.map(x => x.id);

    updatePositionState({
      participantPositions: [
        ...participantPositions.filter(x => !updatedPositionIds.includes(x.id)),
        ...updatedPositions
      ],
    });
    
    dbController.upsertList("participantPosition", updatedPositions);
  }

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

    updateState({selectedItems: []});
  }
  
  return (
    <ExpandableSection
      title="アクション"
      defaultIsExpanded titleIcon={ICON.leftClickBlack}>
      <div className="flex flex-col gap-1">
        { 
          swappableParticipants.length === 2 && 
          <>
            <div 
              className="px-3 py-1.5 border rounded-xl flex flex-col gap-1 w-full">
                <button 
                  button-name="Swap participants"
                  className="flex flex-row justify-between w-full m-auto border-0"
                  onClick={() => {setSwapMenuExpanded(prev => !prev)}}>
                  <span>
                    {swappableParticipants[0].displayName}↔︎{swappableParticipants[1].displayName}位置交換
                  </span>
                  <img 
                    className="text-center size-6" 
                    src={swapMenuExpanded ? ICON.expandLessBlack : ICON.expandMoreBlack}
                    alt={swapMenuExpanded ? "Collapse icon": "Expand icon"}
                  />
              </button>
              {
                swapMenuExpanded && 
                <div className="flex flex-col gap-1 mx-6">
                  <button
                    className="hover:bg-grey-200"
                    onClick={() => swapParticipants("current")}
                    button-name="This section only">
                    当セクションのみ
                  </button>
                  <Divider compact/>
                  <button
                    className="hover:bg-grey-200"
                    onClick={() => swapParticipants("currentOnwards")}
                    button-name="This section and after">
                    以降のセクション
                  </button>
                  <Divider compact/>
                  <button
                    className="hover:bg-grey-200"
                    onClick={() => swapParticipants("all")}
                    button-name="All sections">
                    すべてのセクション
                  </button>
                </div>
              }
            </div>
          </>
        }
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