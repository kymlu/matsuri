import React, { useContext, useEffect, useRef, useState } from "react";
import ExpandableSection from "../ExpandableSection.tsx";
import { Radio, RadioGroup } from "@base-ui-components/react";
import { ColorStyle } from "../../themes/colours.ts";
import { ParticipantCategory } from "../../models/ParticipantCategory.ts";
import ColorSwatch from "./ColorSwatch.tsx";
import { strEquals } from "../helpers/GlobalHelper.ts";
import { CategoryContext } from "../../contexts/CategoryContext.tsx";
import { dbController } from "../../data/DBProvider.tsx";
import { UserContext } from "../../contexts/UserContext.tsx";
import { createPosition, ParticipantPosition, PositionType, splitPositionsByType } from "../../models/Position.ts";
import { PositionContext } from "../../contexts/PositionContext.tsx";
import ColorPicker from "./ColorPicker.tsx";
import CustomMenu from "../CustomMenu.tsx";
import Button from "../Button.tsx";

// todo: bug: select participant, move, select colour, refresh. Will return to the original position but keep colour

export default function CategoryMenu() {
  const {selectedItems, updateState} = useContext(UserContext);
  const userContext = useContext(UserContext);
  const [editingId, setEditingId] = useState<string | undefined | null>(null);
  const {categories, updateCategoryContext} = useContext(CategoryContext);
  const [selectedCategory, setSelectedCategory] = useState<ParticipantCategory | null>(null);
  const {participantPositions, updatePositionState} = useContext(PositionContext);

	const categoryOptionRef = useRef<React.RefObject<HTMLDivElement | null>[]>([]);

  useEffect(() => {
    categories
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
        var category = categories.find(x => strEquals(x.id, selectedCategories[0]))!;
        setSelectedCategory(category);
      } else {
        setSelectedCategory(null);
      }
      scrollToCategory();
    }
  }, [userContext.selectedItems]);

  // todo: doesn't scroll properly when selecting a different participant
  function scrollToCategory() {
    if (selectedCategory){
      categoryOptionRef.current?.[selectedCategory.order - 1]?.current?.scrollIntoView({
        behavior: "smooth",
        block: "center"
      });
    }
  }

  function selectCategoryToEdit(id: string) {
    if (strEquals(editingId, id)){
      setEditingId(null);
    } else {
      setEditingId(id);
    }
  }

  function onChangeCategory(newCategoryId: string) {
    var newCategory = categories.find(x => strEquals(x.id, newCategoryId))!;
    var updatedPositions = splitPositionsByType(selectedItems).participants.map(x => ({...x, categoryId: newCategoryId}));
    var positionIds = updatedPositions.map(x => x.id);

    setSelectedCategory(newCategory);
    updateState({selectedItems: updatedPositions.map(x => createPosition(x, PositionType.participant))});
    updatePositionState({participantPositions: [
      ...participantPositions.filter(x => !positionIds.includes(x.id)),
      ...updatedPositions
    ]});
    dbController.upsertList("participantPosition", updatedPositions);
  }

  async function onSetAllToCategory() {
    var participantIds = splitPositionsByType(selectedItems).participants.map(x => x.participantId);
    var updatedPositions = participantPositions
      .filter(x => participantIds.includes(x.participantId))
      .map(x => ({
        ...x as ParticipantPosition,
        categoryId: selectedCategory!.id
      } as ParticipantPosition));
    
    dbController.upsertList("participantPosition", updatedPositions);
    updatePositionState({participantPositions: [
      ...participantPositions.filter(x => !participantIds.includes(x.participantId)),
      ...updatedPositions
    ]})
  }

  function selectColor(color: ColorStyle, category: ParticipantCategory) {
    var newCategory = {...category, color: color} as ParticipantCategory;
    dbController.upsertItem("category", newCategory);
    updateCategoryContext({categories: [...categories.filter(c => !strEquals(c.id, category.id)), newCategory]})
    setEditingId(null);
  }

  return (
    <ExpandableSection
      title="カテゴリー"
      onToggle={() => scrollToCategory()}>
      <RadioGroup
        value={selectedCategory?.id ?? ""}
        onValueChange={(value) => onChangeCategory(value as string)}>
        <div className="flex flex-col overflow-x-hidden overflow-y-auto gap-x-6 max-h-32">
          {
            categories
              .sort((a, b) => a.order - b.order)
              .map((category, index) => 
              <div
                key={category.id}
                ref={categoryOptionRef.current[index]}
                className="flex flex-row items-center justify-between align-middle">
                <div className="flex flex-row items-center gap-2 align-middle">
                  <Radio.Root
                    value={category.id}
                    className="flex size-5 items-center justify-center rounded-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 data-[checked]:bg-primary data-[unchecked]:border data-[unchecked]:border-gray-300">
                    <Radio.Indicator className="flex before:size-2 before:rounded-full before:bg-gray-50 data-[unchecked]:hidden"/>
                  </Radio.Root>
                  {category.name}
                </div>
                <CustomMenu
                  trigger={
                    <ColorSwatch
                      onClick={() => selectCategoryToEdit(category.id)}
                      tailwindColorClassName={category?.color?.twColor}/>
                  }>
                    <ColorPicker
                      selectColor={(color) => {selectColor(color, category)}}
                      selectedColor={category?.color}/>
                </CustomMenu>
              </div>
            )
          }
        </div>
      </RadioGroup>
      {selectedCategory && 
        <Button onClick={() => onSetAllToCategory()} full>
          すべてのセクションに適用
        </Button>}
    </ExpandableSection>
  )
}