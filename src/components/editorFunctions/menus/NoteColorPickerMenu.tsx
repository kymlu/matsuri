import React, { useContext, useEffect, useState } from "react";
import ExpandableSection from "../../ExpandableSection.tsx";
import { UserContext } from "../../../contexts/UserContext.tsx";
import { basePalette, ColorStyle, objectColorSettings, objectPalette } from "../../../themes/colours.ts";
import { dbController } from "../../../data/DBProvider.tsx";
import { Position, PositionType, splitPositionsByType } from "../../../models/Position.ts";
import { strEquals } from "../../../helpers/GlobalHelper.ts";
import { PositionContext } from "../../../contexts/PositionContext.tsx";
import CustomSwitch from "../../CustomSwitch.tsx";
import { ICON } from "../../../data/consts.ts";
import { replaceItemsFromDifferentSource, selectValuesByKeys } from "../../../helpers/GroupingHelper.ts";
import ColorPresetPicker from "./ColorPresetPicker.tsx";
import ColorPalettePicker from "./ColorPalettePicker.tsx";

export type NoteColorPickerMenuProps = {
}

export default function NoteColorPickerMenu() {
  const [selectedColor, setSelectedColor] = useState<any>();
  const [selectedBgColor, setSelectedBgColor] = useState<string | null>();
  const [selectedBorderColor, setSelectedBorderColor] = useState<string | null>();
  const [selectedTextColor, setSelectedTextColor] = useState<string | null>();
  const userContext = useContext(UserContext);
  const {selectedItems, selectedSection, updateState} = useContext(UserContext);
  const {notePositions, updatePositionContextState} = useContext(PositionContext);

  const hasBgSwitchRef = React.createRef<any>();
  const hasBorderSwitchRef = React.createRef<any>();

  function setColor (color: string | undefined, type: "bgColour" | "borderColour" | "textColour") {
    var updatedNotes = splitPositionsByType(selectedItems).notes
      .map(x => {
        var colour = {...x.color};
        colour[type] = color;
        return {...x, color: colour as ColorStyle} ;
      });

    var updatedNoteIds = updatedNotes.map(x => x.id);
    var updatedNotePositions = replaceItemsFromDifferentSource(
      notePositions,
      updatedNoteIds,
      updatedNotes,
      (item) => item.formationSectionId,
      (item) => item.id);
    
    updatePositionContextState({
      notePositions: updatedNotePositions
    });


    updateState({selectedItems: [
      ...updatedNotes.map(x => ({note: x, type: PositionType.note} as Position)),
    ]});

    dbController.upsertList("notePosition", updatedNotes);
  }

  function selectColor(color: ColorStyle) {
    if (selectedItems.length === 0) return;

    var res = splitPositionsByType(selectedItems);
    
    var noteIds = new Set(res.notes.map(x => x.id));
    var updatedNotes = [...notePositions[selectedSection!.id] ?? []];
    noteIds.forEach(id => {
      var note = updatedNotes.find(x => strEquals(x.id, id));
      if (note) {
        note.color = color;
      }
    });

    var updatedNoteRecord = {
      ...notePositions,
      [selectedSection!.id]: updatedNotes,
    };

    updatePositionContextState({
      notePositions: updatedNoteRecord,
    });

    updateState({selectedItems: [
      ...updatedNotes.filter(x => noteIds.has(x.id)).map(x => ({note: x, type: PositionType.note} as Position)),
    ]});

    Promise.all([
      dbController.upsertList("notePosition", updatedNotes),  
    ]);
  }

  useEffect(()=> {
    var res = splitPositionsByType(userContext.selectedItems);
    var presets = new Set(res.notes?.map(x => x.color?.twColor));
    var bgColors = new Set(res.notes?.map(x => x.color?.bgColour));
    var borderColors = new Set(res.notes?.map(x => x.color?.borderColour));
    var textColors = new Set(res.notes?.map(x => x.color?.textColour));
    
    if (presets.size === 1) {
      var color = presets.values().next().value;
      setSelectedColor(Object.values(objectColorSettings).find(x => strEquals(x.twColor, color)));
    } else {
      setSelectedColor(null);
    }

    if (bgColors.size === 1) {
      var color = bgColors.values().next().value;
      setSelectedBgColor(color);
      hasBgSwitchRef.current?.changeChecked(color !== undefined);
      console.log(color)
    } else {
      setSelectedBgColor(null);
      hasBgSwitchRef.current?.changeChecked(false);
    }

    if (borderColors.size === 1) {
      var color = borderColors.values().next().value;
      setSelectedBorderColor(color);
      hasBorderSwitchRef.current?.changeChecked(color !== undefined);
    } else {
      setSelectedBorderColor(null);
      hasBorderSwitchRef.current?.changeChecked(false);
    }
    if (textColors.size === 1) {
      var color = textColors.values().next().value;
      setSelectedTextColor(color);
    } else {
      setSelectedTextColor(null);
    }
  }, [userContext.selectedItems]);

  return (
    <ExpandableSection
      title="色"
      titleIcon={ICON.colorsBlack}>
      <div className="flex flex-col gap-3">
        <ColorPresetPicker
          selectedColor={selectedColor}
          selectColor={(color) => selectColor(color)}/>
        <div className="grid grid-cols-[auto,auto,1fr] gap-2">
          <br></br>
          <label>テキスト</label>
          <ColorPalettePicker
            color={selectedTextColor ?? ""}
            onChange={(colour) => {
              setSelectedTextColor(colour);
              setColor(colour, "textColour");
            }}/>

          <CustomSwitch
            ref={hasBgSwitchRef}
            onChange={(newValue: boolean) => {
              setColor(newValue ? objectPalette.orange.main : undefined, "bgColour");
            }}/>
          <label>背景</label>
          <ColorPalettePicker
            color={selectedBgColor ?? ""}
            onChange={(colour) => {
              setSelectedBgColor(colour);
              hasBgSwitchRef.current?.changeChecked(true);
              setColor(colour, "bgColour");
            }}/>

          <CustomSwitch
            ref={hasBorderSwitchRef}
            onChange={(newValue: boolean) => {
              setColor(newValue ? basePalette.black : undefined, "borderColour");
            }}/>
          <label>アウトライン</label>
          <ColorPalettePicker
            color={selectedBorderColor ?? ""}
            onChange={(colour) => {
              setSelectedBorderColor(colour);
              hasBorderSwitchRef.current?.changeChecked(true);
              setColor(colour, "borderColour");
            }}/>
        </div>
      </div>
    </ExpandableSection>
  )
}