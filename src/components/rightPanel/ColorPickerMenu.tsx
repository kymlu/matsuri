import React, { useContext } from "react";
import ExpandableSection from "../ExpandableSection.tsx";
import ColorPicker from "./ColorPicker.tsx";
import { UserContext } from "../../contexts/UserContext.tsx";
import { ColorStyle } from "../../themes/colours.ts";
import { dbController } from "../../data/DBProvider.tsx";
import { PropPosition } from "../../models/Position.ts";
import { PositionContext } from "../../contexts/PositionContext.tsx";
import { strEquals } from "../helpers/GlobalHelper.ts";

export type ColorPickerMenuProps = {
}

export default function ColorPickerMenu() {
  const {selectedItem, updateState} = useContext(UserContext);
  const {propPositions, updatePositionState} = useContext(PositionContext)

  function selectColor(color: ColorStyle) {
    if (selectedItem && "color" in selectedItem){
      var newItem = {...selectedItem, color: color} as PropPosition;
      updatePositionState({propPositions: propPositions.filter(x => !strEquals(x.id, selectedItem.id), newItem)});
      dbController.upsertItem("propPosition", newItem);
    }
  }

  return (
    <ExpandableSection title="色">
      <ColorPicker selectColor={selectColor}/>
    </ExpandableSection>
  )
}