import React, { useContext, useEffect, useState } from "react";
import ExpandableSection from "../ExpandableSection.tsx";
import { Radio, RadioGroup } from "@base-ui-components/react";
import { ColorStyle, objectColorSettings } from "../../themes/colours.ts";
import { db } from "../../App.tsx";
import { ParticipantCategory } from "../../models/ParticipantCategory.ts";
import { FormationStateContext } from "../../contexts/FormationEditorContext.tsx";
import ColorSwatch from "./ColorSwatch.tsx";
import { strEquals } from "../helpers/GlobalHelper.ts";

export default function CategoryMenu() {
  const [editingId, setEditingId] = useState<string | undefined | null>(null)
  const {categories, updateFormationState} = useContext(FormationStateContext);
  const [dbInitialized, setDbInitialized] = useState(false)

  useEffect(() => {
    console.log("useEffect", dbInitialized)
    if (db === null && !dbInitialized){
      setDbInitialized(true);
      window.addEventListener("dbInitialized", () => { init() }, {once: true});
    } else if (!dbInitialized) {
      setDbInitialized(true);
      init();
    }
  }, [])

  function init () {
    console.log("init category menu");
    db.getAll("category").then((categoryList) => {
      try {
        updateFormationState({
          categories: categoryList as Array<ParticipantCategory>
        });
      } catch (e) {
        console.error('Error parsing user from localStorage:', e);
      }
    });
  }

  function selectCategoryToEdit(id: string) {
    if (strEquals(editingId, id)){
      setEditingId(null);
    } else {
      setEditingId(id);
    }
  }

  function selectColor(color: ColorStyle, category: ParticipantCategory) {
    var newCategory = {...category, color: color} as ParticipantCategory
    db.upsertItem("category", newCategory);
    updateFormationState({categories: [...categories.filter(c => strEquals(c.id, category.id)), newCategory]})
  }

  return (
    <ExpandableSection title="カテゴリー">
      <RadioGroup>
        <div className="grid grid-cols-2 gap-x-6">
          {
            categories.sort((a, b) => a.order - b.order).map(category => 
              <div key={category.id} className="flex flex-row items-center justify-between align-middle">
                <div className="flex flex-row items-center gap-2 align-middle">
                  <Radio.Root
                    value={category}
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