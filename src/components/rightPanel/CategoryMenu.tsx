import React, { useContext, useEffect, useState } from "react";
import ExpandableSection from "../ExpandableSection.tsx";
import { Radio, RadioGroup } from "@base-ui-components/react";
import { ColorStyle } from "../../themes/colours.ts";
import { ParticipantCategory } from "../../models/ParticipantCategory.ts";
import ColorSwatch from "./ColorSwatch.tsx";
import { strEquals } from "../helpers/GlobalHelper.ts";
import { CategoryContext } from "../../contexts/CategoryContext.tsx";
import { dbController } from "../../data/DBProvider.tsx";
import { UserContext } from "../../contexts/UserContext.tsx";
import { ParticipantPosition } from "../../models/Position.ts";
import { PositionContext } from "../../contexts/PositionContext.tsx";
import ColorPicker from "./ColorPicker.tsx";

// bug: select participant, move, select colour, refresh. Will return to the original position but keep colour

export default function CategoryMenu() {
  const {selectedItem, updateState} = useContext(UserContext);
  const userContext = useContext(UserContext);
  const [editingId, setEditingId] = useState<string | undefined | null>(null);
  const {categories, updateCategoryContext} = useContext(CategoryContext);
  const [selectedCategory, setSelectedCategory] = useState<ParticipantCategory>(categories.find(x => strEquals(x.id, (selectedItem as ParticipantPosition).categoryId)) ?? categories[0]);
  const {participantPositions, updatePositionState} = useContext(PositionContext);

  useEffect(() => {
    if (selectedItem) {
      setSelectedCategory(categories.find(x => strEquals(x.id, (selectedItem as ParticipantPosition).categoryId))!);
    }
  }, [userContext.selectedItem]);

  function selectCategoryToEdit(id: string) {
    if (strEquals(editingId, id)){
      setEditingId(null);
    } else {
      setEditingId(id);
    }
  }

  function onChangeCategory(newCategoryId: string) {
    var newCategory = categories.find(x => strEquals(x.id, newCategoryId))!
    var newSelectedItem = {
      ...selectedItem,
      categoryId: newCategory.id,
    } as ParticipantPosition;
    setSelectedCategory(newCategory);
    updateState({selectedItem: newSelectedItem});
    updatePositionState({participantPositions: [...participantPositions.filter(x => !strEquals(x.id, selectedItem?.id!)), newSelectedItem]});
    dbController.upsertItem("participantPosition", newSelectedItem);
  }

  function selectColor(color: ColorStyle, category: ParticipantCategory) {
    var newCategory = {...category, color: color} as ParticipantCategory;
    dbController.upsertItem("category", newCategory);
    updateCategoryContext({categories: [...categories.filter(c => !strEquals(c.id, category.id)), newCategory]})
    setEditingId(null);
  }

  return (
    <ExpandableSection title="カテゴリー">
      <RadioGroup
        value={selectedCategory?.id ?? ""}
        onValueChange={(value) => onChangeCategory(value as string)}>
        <div className="flex flex-col gap-x-6">
          {
            categories.sort((a, b) => a.order - b.order).map(category => 
              <div key={category.id} className="flex flex-row items-center justify-between align-middle">
                <div className="flex flex-row items-center gap-2 align-middle">
                  <Radio.Root
                    value={category.id}
                    className="flex size-5 items-center justify-center rounded-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 data-[checked]:bg-primary data-[unchecked]:border data-[unchecked]:border-gray-300">
                    <Radio.Indicator className="flex before:size-2 before:rounded-full before:bg-gray-50 data-[unchecked]:hidden"/>
                  </Radio.Root>
                  {category.name}
                </div>
                <ColorSwatch onClick={() => selectCategoryToEdit(category.id)} tailwindColorClassName={category?.color?.twColor}/>
                {
                  strEquals(editingId, category.id) && 
                  <div className="absolute grid flex-wrap grid-cols-6 gap-1 p-3 bg-white border-2 border-solid mt-52 border-primary">
                    <ColorPicker selectColor={(color) => {selectColor(color, category)}}/>
                  </div>
                }
              </div>
            )
          }
        </div>
      </RadioGroup>
    </ExpandableSection>
  )
}