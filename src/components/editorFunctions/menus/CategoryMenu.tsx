import React, { useContext, useEffect, useRef, useState } from "react";
import ExpandableSection from "../../ExpandableSection.tsx";
import { basePalette, ColorStyle } from "../../../themes/colours.ts";
import { ParticipantCategory } from "../../../models/ParticipantCategory.ts";
import { strEquals } from "../../../helpers/GlobalHelper.ts";
import { CategoryContext } from "../../../contexts/CategoryContext.tsx";
import { dbController } from "../../../data/DBProvider.tsx";
import { UserContext } from "../../../contexts/UserContext.tsx";
import { createPosition, ParticipantPosition, PositionType, splitPositionsByType } from "../../../models/Position.ts";
import { PositionContext } from "../../../contexts/PositionContext.tsx";
import Button from "../../Button.tsx";
import { ICON } from "../../../data/consts.ts";

export default function CategoryMenu() {
  const {selectedItems, updateState, selectedSection} = useContext(UserContext);
  const userContext = useContext(UserContext);
  const [editingId, setEditingId] = useState<string | undefined | null>(null);
  const {categories, updateCategoryContext} = useContext(CategoryContext);
  const [selectedCategory, setSelectedCategory] = useState<ParticipantCategory | null>(null);
  const {participantPositions, updatePositionContextState} = useContext(PositionContext);

	const categoryOptionRef = useRef<React.RefObject<HTMLDivElement | null>[]>([]);

  useEffect(() => {
    Object.values(categories)
      .forEach((_, index) => 
        categoryOptionRef.current[index] = React.createRef<HTMLDivElement>()
      );
  }, [categories])

  useEffect(() => {
    if (selectedItems.length > 0) {
      var selectedCategories = selectedItems
        .filter(x => x.type === PositionType.participant)
        .map(x => x.participant.categoryId);
        
      if (new Set(selectedCategories).size === 1) {
        var category = categories[selectedCategories[0]!];
        setSelectedCategory(category);
      } else {
        setSelectedCategory(null);
      }
      scrollToCategory();
    }
  }, [userContext.selectedItems]);

  function scrollToCategory() {
    if (selectedCategory){
      categoryOptionRef.current?.[selectedCategory.order - 1]?.current?.scrollIntoView({
        behavior: "smooth",
        block: "center"
      });
    }
  }

  function onChangeCategory(newCategoryId: string) {
    var participants = splitPositionsByType(selectedItems).participants;
    var updatedPositions: ParticipantPosition[] = [];
    var ids = new Set(participants.map(x => x.id));
    var updatedRecord = {...participantPositions};
    updatedRecord[selectedSection!.id]
      .filter(x => ids.has(x.id))
      .forEach(x => {
        x.categoryId = newCategoryId
        updatedPositions.push(x);
      });
    
    var newCategory = categories[newCategoryId]!;

    setSelectedCategory(newCategory);
    updateState({selectedItems: updatedPositions.map(x => createPosition(x, PositionType.participant))});
    updatePositionContextState({participantPositions: updatedRecord});
    dbController.upsertList("participantPosition", updatedPositions);
  }

  async function onSetAllToCategory() {
    var participantIds = new Set(splitPositionsByType(selectedItems).participants.map(x => x.participantId));
    
    var updatedRecord = {...participantPositions};
    var updatedPositions: ParticipantPosition[] = [];
    Object.keys(updatedRecord).forEach(key => {
      updatedRecord[key]
        .filter(x => participantIds.has(x.participantId))
        .forEach(x => {
          x.categoryId = selectedCategory!.id;
          updatedPositions.push(x);
        });
    });
    
    dbController.upsertList("participantPosition", updatedPositions);
    updatePositionContextState({participantPositions: updatedRecord});
  }

  return (
    <ExpandableSection
      title="カテゴリー"
      titleIcon={ICON.categoryBlack}
      onToggle={() => scrollToCategory()}>
      <div className="flex flex-row mb-2 flex-wrap gap-1.5 overflow-x-hidden overflow-y-auto">
        {
          Object.values(categories)
            .sort((a, b) => a.order - b.order)
            .map((category) => 
              <button
                onClick={() => onChangeCategory(category.id)}
                className="flex items-center justify-center h-8 p-2 font-bold border-2 rounded-lg cursor-pointer"
                style={{
                  backgroundColor: category.color.bgColour ?? "",
                  borderColor: category.color.borderColour ?? "",
                  color: category.color.textColour ?? ""
              }}>
              <div className="flex gap-1">
                {
                  selectedCategory?.id === category.id &&
                  <img
                  src={strEquals(category.color.textColour, basePalette.white) ?
                    ICON.checkWhite : ICON.checkBlack}
                    className="size-6"/>
                }
              {category.name}
              </div>
            </button>
          )
        }
      </div>
      {selectedCategory && 
        <Button onClick={() => onSetAllToCategory()} full>
          すべてのセクションに適用
        </Button>}
    </ExpandableSection>
  )
}