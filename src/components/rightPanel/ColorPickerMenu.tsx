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
import { PositionContext } from "../../contexts/PositionContext.tsx";
import CustomSwitch from "../CustomSwitch.tsx";
import { ICON } from "../../data/consts.ts";

export type ColorPickerMenuProps = {
}

export default function ColorPickerMenu() {
  const [selectedColor, setSelectedColor] = useState<any>();
  const [showTransparentOption, setShowTransparentOption] = useState<boolean>(false);
  const [isBgShown, setIsBgShown] = useState<boolean>(false);
  const userContext = useContext(UserContext);
  const {selectedItems, updateState} = useContext(UserContext);
  const {propList, updateFormationContext} = useContext(FormationContext);
  const {notePositions, updatePositionState} = useContext(PositionContext);

  const showBgSwitchRef = React.createRef<any>();

  function setBg(newShowBg: boolean) {
    setIsBgShown(newShowBg);
    var updatedNotes = splitPositionsByType(selectedItems).notes
      .map(x => ({...x, showBackground: newShowBg}));
    
    var updatedNoteIds = updatedNotes.map(x => x.id);
    
    updatePositionState({
      notePositions: [
        ...notePositions.filter(x => !updatedNoteIds.includes(x.id)),
        ...updatedNotes
      ]
    });
    dbController.upsertList("notePosition", updatedNotes);
  }

  function selectColor(color: ColorStyle) {
    if (selectedItems.length === 0) return;

    var res = splitPositionsByType(selectedItems);
    var propIds = res.props.map(x => x.propId);

    var updatedProps = propList
      .slice()
      .filter(x => propIds.includes(x.id))
      .map(x => ({...x, color: color} as Prop));

    var updatedNotes = res.notes.map(x => ({...x, color: color, showBackground: true} as NotePosition));
    
    var noteIds = res.notes.map(x => x.id);

    updateFormationContext({
      propList: [
        ...propList.filter(x => !propIds.includes(x.id)),
        ...updatedProps
      ]
    });
    updatePositionState({
      notePositions: [
        ...notePositions.filter(x => !noteIds.includes(x.id)),
        ...updatedNotes
      ]
    })

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

    if (res.props.length === 0 && res.notes.length > 0) {
      setShowTransparentOption(true);
      var showBackground = [...new Set(res.notes.map(x => x.showBackground))].includes(true);
      setIsBgShown(showBackground);
      showBgSwitchRef.current?.changeChecked(showBackground);
    } else {
      setShowTransparentOption(false);
      setIsBgShown(false);
    }
  }, [userContext.selectedItems]);

  return (
    <ExpandableSection
      title="色"
      titleIcon={ICON.colorsBlack}>
      <div className="flex flex-col gap-2">
      {
        showTransparentOption && 
        <CustomSwitch
          ref={showBgSwitchRef}
          label="背景表示"
          defaultChecked={isBgShown}
          onChange={(newValue: boolean) => {setBg(newValue)}}/>
      }
      {
        isBgShown && 
        <ColorPicker
          selectColor={selectColor}
          selectedColor={selectedColor}/>
      }
      </div>
    </ExpandableSection>
  )
}