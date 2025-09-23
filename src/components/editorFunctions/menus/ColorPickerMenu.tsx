import React, { useContext, useEffect, useState } from "react";
import ExpandableSection from "../../ExpandableSection.tsx";
import ColorPicker from "./ColorPicker.tsx";
import { UserContext } from "../../../contexts/UserContext.tsx";
import { ColorStyle, objectColorSettings } from "../../../themes/colours.ts";
import { dbController } from "../../../data/DBProvider.tsx";
import { Position, PositionType, splitPositionsByType } from "../../../models/Position.ts";
import { EntitiesContext } from "../../../contexts/EntitiesContext.tsx";
import { strEquals } from "../../../helpers/GlobalHelper.ts";
import { PositionContext } from "../../../contexts/PositionContext.tsx";
import CustomSwitch from "../../CustomSwitch.tsx";
import { ICON } from "../../../data/consts.ts";
import { replaceItemsFromDifferentSource, selectValuesByKeys } from "../../../helpers/GroupingHelper.ts";

export type ColorPickerMenuProps = {
}

export default function ColorPickerMenu() {
  const [selectedColor, setSelectedColor] = useState<any>();
  const [showTransparentOption, setShowTransparentOption] = useState<boolean>(false);
  const [isBgShown, setIsBgShown] = useState<boolean>(false);
  const userContext = useContext(UserContext);
  const {selectedItems, selectedSection, updateState} = useContext(UserContext);
  const {propList, updateEntitiesContext} = useContext(EntitiesContext);
  const {notePositions, arrowPositions, updatePositionContextState} = useContext(PositionContext);

  const showBgSwitchRef = React.createRef<any>();

  function setBg(newShowBg: boolean) {
    setIsBgShown(newShowBg);
    var updatedNotes = splitPositionsByType(selectedItems).notes
      .map(x => ({...x, showBackground: newShowBg}));
    
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
    dbController.upsertList("notePosition", updatedNotes);
  }

  function selectColor(color: ColorStyle) {
    if (selectedItems.length === 0) return;

    var res = splitPositionsByType(selectedItems);
    var propIds = res.props.map(x => x.propId);

    var updatedProps = {...propList};
    propIds.forEach(id => {
      updatedProps[id].color = color;
    })
    updateEntitiesContext({propList: updatedProps});
    
    var noteIds = new Set(res.notes.map(x => x.id));
    var updatedNotes = [...notePositions[selectedSection!.id]];
    noteIds.forEach(id => {
      var note = updatedNotes.find(x => strEquals(x.id, id));
      if (note) {
        note.color = color;
      }
    });
    
    updatePositionContextState({
      notePositions: {
        ...notePositions,
        [selectedSection!.id]: updatedNotes,
      }
    });

    var arrowIds = new Set(res.arrows.map(x => x.id));
    var updatedArrows = [...arrowPositions[selectedSection!.id]];
    arrowIds.forEach(id => {
      updatedArrows[id].color = color;
    });
    
    updatePositionContextState({
      arrowPositions: {
        ...arrowPositions,
        [selectedSection!.id]: updatedArrows,
      }
    });

    updateState({selectedItems: [
      ...selectedItems.filter(x => x.type === PositionType.prop),
      ...updatedNotes.filter(x => noteIds.has(x.id)).map(x => ({note: x, type: PositionType.note} as Position)),
      ...updatedArrows.filter(x => arrowIds.has(x.id)).map(x => ({arrow: x, type: PositionType.arrow} as Position)),
    ]});

    Promise.all([
      dbController.upsertList("prop", selectValuesByKeys(updatedProps, propIds)),
      dbController.upsertList("notePosition", updatedNotes),  
      dbController.upsertList("arrowPosition", updatedArrows),  
    ]);
  }

  useEffect(()=> {
    var res = splitPositionsByType(userContext.selectedItems);
    var propIds = res.props.map(x => x.propId);
    var allColors = new Set(selectValuesByKeys(propList, propIds)?.map(x => x.color?.twColor));
    
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

    if (res.props.length === 0 && res.arrows.length === 0 && res.notes.length > 0) {
      setShowTransparentOption(true);
      var showBackground = [...new Set(res.notes.map(x => x.showBackground))].includes(true);
      setIsBgShown(showBackground);
      showBgSwitchRef.current?.changeChecked(showBackground);
    } else {
      setShowTransparentOption(false);
      setIsBgShown(true);
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