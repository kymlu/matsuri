import React, { useContext, useEffect, useState } from "react";
import ExpandableSection from "../../ExpandableSection.tsx";
import { UserContext } from "../../../contexts/UserContext.tsx";
import Button from "../../Button.tsx";
import { dbController } from "../../../lib/dataAccess/DBProvider.tsx";
import { PositionType, splitPositionsByType } from "../../../models/Position.ts";
import { EntitiesContext, EntitiesContextState } from "../../../contexts/EntitiesContext.tsx";
import { PositionContext, PositionContextState } from "../../../contexts/PositionContext.tsx";
import { CUSTOM_EVENT, ICON } from "../../../lib/consts.ts";
import { CategoryContext } from "../../../contexts/CategoryContext.tsx";
import { strEquals } from "../../../lib/helpers/GlobalHelper.ts";
import { ParticipantCategory } from "../../../models/ParticipantCategory.ts";
import { Participant } from "../../../models/Participant.ts";
import Divider from "../../Divider.tsx";
import { removeItemsByCondition, removeKeysFromRecord, replaceItemsFromDifferentSource, selectValuesByKeys } from "../../../lib/helpers/GroupingHelper.ts";

export default function ActionMenu() {
  const {participantList, propList, updateEntitiesContext} = useContext(EntitiesContext);
  const userContext = useContext(UserContext);
  const {categories} = useContext(CategoryContext);
  const {selectedItems, currentSections, selectedSection, updateState} = useContext(UserContext);
  const {participantPositions, propPositions, notePositions, arrowPositions, updatePositionContextState} = useContext(PositionContext);
  
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
        setSwappableParticipants(selectValuesByKeys(participantList, participantIds)
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
      setSelectedCategory(categories[catId] ?? null);
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

    var updatedPositions = selectValuesByKeys(participantPositions, sectionIds)
      .flat()
      .filter(x =>
        (strEquals(x.participantId, swappableParticipants[0].id) ||
        strEquals(x.participantId, swappableParticipants[1].id)))
      .map(x => ({
        ...x,
        participantId: strEquals(x.participantId, swappableParticipants[0].id) ?
          swappableParticipants[1].id : swappableParticipants[0].id}));

    var updatedPositionIds = updatedPositions.map(x => x.id);

    var updatedParticipantPositions = replaceItemsFromDifferentSource(
      participantPositions,
      updatedPositionIds,
      updatedPositions,
      (item) => item.formationSectionId,
      (item) => item.id);

    updatePositionContextState({
      participantPositions: updatedParticipantPositions,
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
  
  function deleteObjects() { // todo: update transformer
    if (selectedItems.length === 0) return;

    const {participants, props, notes, arrows} = splitPositionsByType(selectedItems);

    var updatedPositions: Partial<PositionContextState> = {};
    var updatedEntities: Partial<EntitiesContextState> = {};

    if (participants.length > 0) {
      var selectedParticipantIds = new Set(participants.map(x => x.participantId));
      var positionsToRemove = new Set(Object.values(participantPositions).flat().filter(x => selectedParticipantIds.has(x.participantId)).map(x => x.id));
      dbController.removeList("participant", [...selectedParticipantIds]);
      dbController.removeList("participantPosition", [...positionsToRemove]);
      updatedPositions.participantPositions = removeItemsByCondition(participantPositions, (item) => positionsToRemove.has(item.id));
      updatedEntities.participantList = removeKeysFromRecord(participantList, selectedParticipantIds);
    }

    if (props.length > 0) {
      var selectedPropIds = new Set(props.map(x => x.propId));
      var positionsToRemove = new Set(Object.values(propPositions).flat().filter(x => selectedPropIds.has(x.propId)).map(x => x.id));
      dbController.removeList("prop", [...selectedPropIds]);
      dbController.removeList("propPosition", [...positionsToRemove]);
      updatedPositions.propPositions = removeItemsByCondition(propPositions, (item) => positionsToRemove.has(item.id));
      updatedEntities.propList = removeKeysFromRecord(propList, selectedPropIds);
    }

    if (notes.length > 0) {
      var positionsToRemove = new Set(notes.map(x => x.id));
      updatedPositions.notePositions = removeItemsByCondition(notePositions, (item) => positionsToRemove.has(item.id));
      dbController.removeList("notePosition", [...positionsToRemove]);
    }
    
    if (arrows.length > 0) {
      var positionsToRemove = new Set(arrows.map(x => x.id));
      updatedPositions.arrowPositions = removeItemsByCondition(arrowPositions, (item) => positionsToRemove.has(item.id));
      dbController.removeList("arrowPosition", [...positionsToRemove]);
    }
    updateEntitiesContext(updatedEntities);
    updatePositionContextState(updatedPositions);
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
                  className="flex flex-row items-center justify-between w-full m-auto border-0"
                  onClick={() => {setSwapMenuExpanded(prev => !prev)}}>
                  <span>
                    {swappableParticipants[0].displayName}↔︎{swappableParticipants[1].displayName}位置交換
                  </span>
                  <img 
                    className="text-center size-8" 
                    src={swapMenuExpanded ? ICON.expandLessBlack : ICON.expandMoreBlack}
                    alt={swapMenuExpanded ? "Collapse icon": "Expand icon"}
                  />
              </button>
              {
                swapMenuExpanded && 
                <div className="flex flex-col gap-1 mx-6">
                  <button
                    className="lg:hover:bg-grey-200"
                    onClick={() => swapParticipants("current")}
                    button-name="This section only">
                    当セクションのみ
                  </button>
                  <Divider compact/>
                  <button
                    className="lg:hover:bg-grey-200"
                    onClick={() => swapParticipants("currentOnwards")}
                    button-name="This section and after">
                    以降のセクション
                  </button>
                  <Divider compact/>
                  <button
                    className="lg:hover:bg-grey-200"
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
          onClick={() => {deleteObjects()}}>
          削除
        </Button>
      </div>
    </ExpandableSection>
  )
}