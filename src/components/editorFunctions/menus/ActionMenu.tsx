import { useContext, useEffect, useState } from "react";
import ExpandableSection from "../../ExpandableSection.tsx";
import { UserContext } from "../../../contexts/UserContext.tsx";
import Button from "../../Button.tsx";
import { ArrowPosition, NotePosition, Position, PositionType, splitPositionsByType } from "../../../models/Position.ts";
import { EntitiesContext, EntitiesContextState } from "../../../contexts/EntitiesContext.tsx";
import { PositionContext, PositionContextState } from "../../../contexts/PositionContext.tsx";
import { CUSTOM_EVENT, ICON } from "../../../lib/consts.ts";
import { CategoryContext } from "../../../contexts/CategoryContext.tsx";
import { strEquals } from "../../../lib/helpers/GlobalHelper.ts";
import { ParticipantCategory } from "../../../models/ParticipantCategory.ts";
import { Participant } from "../../../models/Participant.ts";
import Divider from "../../Divider.tsx";
import { addItemsToRecordArray, removeItemsByCondition, replaceItemsFromDifferentSource, selectValuesByKeys } from "../../../lib/helpers/GroupingHelper.ts";
import { removeList, upsertList } from "../../../data/DataRepository.ts";

export default function ActionMenu() {
  const {participantList, updateEntitiesContext} = useContext(EntitiesContext);
  const userContext = useContext(UserContext);
  const {categories} = useContext(CategoryContext);
  const {selectedItems, currentSections, selectedSection, updateState} = useContext(UserContext);
  const {participantPositions, propPositions, notePositions, arrowPositions, placeholderPositions, updatePositionContextState} = useContext(PositionContext);
  
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

    var splitItems = splitPositionsByType(userContext.selectedItems);
    if (splitItems.participants.length >= 0 &&
      splitItems.placeholders.length >= 0 &&
      splitItems.arrows.length === 0 &&
      splitItems.notes.length === 0 &&
      splitItems.props.length === 0) {
      var currentCategories = new Set([...splitItems.participants.map(x => x.categoryId), ...splitItems.placeholders.map(x => x.categoryId)]);
      if (currentCategories.size === 1) {
        var catId = currentCategories.values().next().value;
        setSelectedCategory(catId ? categories[catId] ?? null : null);
      } else {
        setSelectedCategory(null);
      }
    } else {
      setSelectedCategory(null);
    }
  }, [userContext.selectedItems]);

  const swapParticipants = (mode: "current" | "currentOnwards" | "all") => {
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
    
    upsertList("participantPosition", updatedPositions);
  }

  const duplicate = () => {
    if (selectedItems.length === 0 || selectedSection === null) return;

    const {participants, props, notes, arrows, placeholders} = splitPositionsByType(selectedItems);

    const newArrows = arrows.map(arrow => ({
      ...arrow,
      id: crypto.randomUUID(),
      x: arrow.x + 0.5,
      y: arrow.y + 0.5
    }) as ArrowPosition);

    const newNotes = notes.map(note => ({
      ...note,
      id: crypto.randomUUID(),
      x: note.x + 0.5,
      y: note.y + 0.5,
    }) as NotePosition);

    upsertList("arrowPosition", newArrows);
    upsertList("notePosition", newNotes);

    var updatedArrowList = addItemsToRecordArray(arrowPositions, selectedSection.id, newArrows);
    var updatedNoteList = addItemsToRecordArray(notePositions, selectedSection.id, newNotes);

    updatePositionContextState({
      arrowPositions: updatedArrowList,
      notePositions: updatedNoteList,
    });
    
    updateState({selectedItems: [
      ...newArrows.map(arrow => ({arrow: arrow, type: PositionType.arrow}) as Position),
      ...newNotes.map(note => ({note: note, type: PositionType.note}) as Position)
    ]});
    
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const rerenderEvent = new CustomEvent(
          CUSTOM_EVENT.updateSelectionExternal, 
          {});
        window.dispatchEvent(rerenderEvent);
      })
    });
  }

  const selectAllFromCategory = () => {
    const selectAllEvent = new CustomEvent(
      CUSTOM_EVENT.selectAllFromCategory, 
      {
        detail: {
          categoryId: selectedCategory?.id,
        },
      });
    window.dispatchEvent(selectAllEvent);
  }

  const selectAllOfType = () => {
    const selectAllEvent = new CustomEvent(
      CUSTOM_EVENT.selectAllPositionType, 
      {
        detail: {
          positionType: selectedPositionType,
        },
      });
    window.dispatchEvent(selectAllEvent);
  }
  
  const deleteObjects = () => { // todo: update transformer
    if (selectedItems.length === 0) return;

    const {participants, props, notes, arrows, placeholders} = splitPositionsByType(selectedItems);

    var updatedPositions: Partial<PositionContextState> = {};
    var updatedEntities: Partial<EntitiesContextState> = {};

    if (participants.length > 0) {
      var selectedParticipantIds = new Set(participants.map(x => x.participantId));
      var positionsToRemove = new Set(Object.values(participantPositions).flat().filter(x => selectedParticipantIds.has(x.participantId)).map(x => x.id));
      removeList("participantPosition", [...positionsToRemove]);
      updatedPositions.participantPositions = removeItemsByCondition(participantPositions, (item) => positionsToRemove.has(item.id));
    }

    if (props.length > 0) {
      var selectedPropIds = new Set(props.map(x => x.uniquePropId));
      var positionsToRemove = new Set(Object.values(propPositions).flat().filter(x => selectedPropIds.has(x.uniquePropId)).map(x => x.id));
      removeList("propPosition", [...positionsToRemove]);
      updatedPositions.propPositions = removeItemsByCondition(propPositions, (item) => positionsToRemove.has(item.id));
    }

    if (notes.length > 0) {
      var positionsToRemove = new Set(notes.map(x => x.id));
      updatedPositions.notePositions = removeItemsByCondition(notePositions, (item) => positionsToRemove.has(item.id));
      removeList("notePosition", [...positionsToRemove]);
    }
    
    if (arrows.length > 0) {
      var positionsToRemove = new Set(arrows.map(x => x.id));
      updatedPositions.arrowPositions = removeItemsByCondition(arrowPositions, (item) => positionsToRemove.has(item.id));
      removeList("arrowPosition", [...positionsToRemove]);
    }

    if (placeholders.length > 0) {
      var selectedPlaceholderIds = new Set(placeholders.map(x => x.placeholderId));
      var positionsToRemove = new Set(Object.values(placeholderPositions).flat().filter(x => selectedPlaceholderIds.has(x.placeholderId)).map(x => x.id));
      updatedPositions.placeholderPositions = removeItemsByCondition(placeholderPositions, (item) => positionsToRemove.has(item.id));
      removeList("placeholderPosition", [...positionsToRemove]);
      removeList("placeholder", [...selectedPlaceholderIds]);
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
          (selectedPositionType === PositionType.note || selectedPositionType === PositionType.arrow) &&
          <Button
            full
            label="Duplicate"
            onClick={() => {duplicate()}}>
              重複
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