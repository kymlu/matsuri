import React, { useContext, useState } from "react";
import ExpandableSection from "../ExpandableSection.tsx";
import { Radio, RadioGroup } from "@base-ui-components/react";
import { ColorStyle, objectColorSettings } from "../../themes/colours.ts";
import { ParticipantCategory } from "../../models/ParticipantCategory.ts";
import ColorSwatch from "./ColorSwatch.tsx";
import { strEquals } from "../helpers/GlobalHelper.ts";
import { CategoryContext } from "../../contexts/CategoryContext.tsx";
import { dbController } from "../../data/DBProvider.tsx";
import { UserContext } from "../../contexts/UserContext.tsx";
import { ParticipantPosition } from "../../models/Position.ts";
import { PositionContext } from "../../contexts/PositionContext.tsx";

export default function CategoryMenu() {
  const {selectedItem, updateState} = useContext(UserContext);
  const [editingId, setEditingId] = useState<string | undefined | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<ParticipantCategory>((selectedItem as ParticipantPosition).category!);
  const {participantPositions, updatePositionState} = useContext(PositionContext);
  const {categories, updateCategoryContext} = useContext(CategoryContext);
  console.log("Selected item", (selectedItem as ParticipantPosition).participant.name, (selectedItem as ParticipantPosition).category);
  function selectCategoryToEdit(id: string) {
    if (strEquals(editingId, id)){
      setEditingId(null);
    } else {
      setEditingId(id);
    }
  }

  function onChangeCategory(newCategoryId) {
    var newCategory = categories.find(x => strEquals(x.id, newCategoryId))!
    console.log("new", newCategory);
    var newSelectedItem = {...selectedItem, category: newCategory, categoryId: newCategory.id, x: selectedItem?.x2, y: selectedItem?.y2} as ParticipantPosition
    console.log("new", newSelectedItem);
    setSelectedCategory(newCategory);
    updateState({selectedItem: newSelectedItem});
    updatePositionState({participantPositions: [...participantPositions.filter(x => !strEquals(x.id, selectedItem?.id!), newSelectedItem)]});
    console.log("new", participantPositions);
  }

  function selectColor(color: ColorStyle, category: ParticipantCategory) {
    var newCategory = {...category, color: color} as ParticipantCategory
    dbController.upsertItem("category", newCategory);
    updateCategoryContext({categories: [...categories.filter(c => !strEquals(c.id, category.id)), newCategory]})
    setEditingId(null);
  }

  return (
    <ExpandableSection title="カテゴリー">
      <RadioGroup value={selectedCategory.id} onValueChange={(value) => onChangeCategory(value)}>
        <div className="grid grid-cols-2 gap-x-6">
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
                    {
                      Object.values(objectColorSettings).map(color => 
                        <ColorSwatch tailwindColorClassName={color.twColor} onClick={() => selectColor(color, category)}/>
                      )
                    }
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