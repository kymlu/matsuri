import React, { useContext, useEffect, useState } from "react";
import ExpandableSection from "../ExpandableSection.tsx";
import ColorPicker from "./ColorPicker.tsx";
import { UserContext } from "../../contexts/UserContext.tsx";
import { ColorStyle, objectColorSettings } from "../../themes/colours.ts";
import { dbController } from "../../data/DBProvider.tsx";
import { NotePosition, Position, PositionType, splitPositionsByType } from "../../models/Position.ts";
import { FormationContext } from "../../contexts/FormationContext.tsx";
import { Prop } from "../../models/Prop.ts";
import { strEquals } from "../helpers/GlobalHelper.ts";

export type ColorPickerMenuProps = {
}

export default function ColorPickerMenu() {
  const [selectedColor, setSelectedColor] = useState<any>();
  const userContext = useContext(UserContext);
  const {selectedItems, updateState} = useContext(UserContext);
  const {noteList, propList, updateFormationContext} = useContext(FormationContext);

  function selectColor(color: ColorStyle) {
    if (selectedItems.length === 0) return;

    var res = splitPositionsByType(selectedItems);
    var propIds = res.props.map(x => x.propId);

    var updatedProps = propList
      .slice()
      .filter(x => propIds.includes(x.id))
      .map(x => ({...x, color: color} as Prop));

    var updatedNotes = res.notes.map(x => ({...x, color: color} as NotePosition));
    
    var noteIds = res.notes.map(x => x.id);

    updateFormationContext({
      noteList: [
        ...noteList.filter(x => !noteIds.includes(x.id)),
        ...updatedNotes
      ],
      propList: [
        ...propList.filter(x => !propIds.includes(x.id)),
        ...updatedProps
      ],});

    updateState({selectedItems: [
      ...selectedItems.filter(x => x.type === PositionType.prop),
      ...updatedNotes.map(x => ({note: x, type: PositionType.note} as Position)),
    ]});

    Promise.all([
      dbController.upsertList("prop", updatedProps),
      dbController.upsertList("notePosition", updatedNotes),  
    ]);
  }

  useEffect(()=> {
    var res = splitPositionsByType(userContext.selectedItems);
    var propIds = res.props.map(x => x.propId);
    var allColors = new Set(propList.filter(x => propIds.includes(x.id))?.map(x => x.color?.twColor));
    
    (res.notes.map(x => x.color?.twColor) as Array<string>)
      .forEach(color => {
        if (color) {
          allColors.add(color);
        }
      });

    if (allColors.size === 1) {
      var color = allColors.values().next().value;
      setSelectedColor(Object.values(objectColorSettings).find(x => strEquals(x.twColor, color)));
    } else {
      setSelectedColor(null);
    }
  }, [userContext.selectedItems]);

  return (
    <ExpandableSection title="色">
      <ColorPicker
        selectColor={selectColor}
        selectedColor={selectedColor}/>
    </ExpandableSection>
  )
}