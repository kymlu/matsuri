import React, { useContext } from "react";
import ExpandableSection from "../ExpandableSection.tsx";
import ColorPicker from "./ColorPicker.tsx";
import { UserContext } from "../../contexts/UserContext.tsx";
import { ColorStyle } from "../../themes/colours.ts";
import { dbController } from "../../data/DBProvider.tsx";
import { NotePosition } from "../../models/Position.ts";
import { isNullOrUndefined, strEquals } from "../helpers/GlobalHelper.ts";
import { FormationContext } from "../../contexts/FormationContext.tsx";
import { Prop } from "../../models/Prop.ts";

export type ColorPickerMenuProps = {
}

export default function ColorPickerMenu() {
  const {selectedItem, updateState} = useContext(UserContext);
  const {noteList, propList, updateFormationContext} = useContext(FormationContext);

  function selectColor(color: ColorStyle) {
    if (isNullOrUndefined(selectedItem) || !("color" in selectedItem!)) return;

    if ("propId" in selectedItem!){
      var updatedProp = {...(propList.find(x => strEquals(x.id, selectedItem!.propId as string))), color: color} as Prop;
      updateFormationContext({propList: [...propList.filter(x => !strEquals(x.id, updatedProp.id)), updatedProp]});
      updateState({selectedItem: {...selectedItem, color: color}});
      dbController.upsertItem("prop", updatedProp);
    } else {
      var updatedNote = {...(selectedItem as NotePosition), color: color};
      updateFormationContext({noteList: [...noteList.filter(x => !strEquals(x.id, updatedNote.id)), updatedNote]});
      updateState({selectedItem: {...selectedItem, color: color}});
      dbController.upsertItem("notePosition", updatedNote);
    }
  }

  var selectedColor = selectedItem && 
    ("propId" in selectedItem ? 
      propList.find(x => strEquals(x.id, selectedItem.propId))?.color :
      (selectedItem as NotePosition).color);

  return (
    <ExpandableSection title="色">
      <ColorPicker
        selectColor={selectColor}
        selectedColor={selectedColor}/>
    </ExpandableSection>
  )
}