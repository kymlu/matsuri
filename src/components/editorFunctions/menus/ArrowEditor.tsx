import React, { useContext, useEffect, useState } from "react";
import ExpandableSection from "../../ExpandableSection.tsx";
import { UserContext } from "../../../contexts/UserContext.tsx";
import { ArrowPosition, getFromPositionType } from "../../../models/Position.ts";
import { PositionContext } from "../../../contexts/PositionContext.tsx";
import { ICON } from "../../../data/consts.ts";
import CustomSlider from "../../CustomSlider.tsx";
import { dbController } from "../../../data/DBProvider.tsx";
import { strEquals } from "../../../helpers/GlobalHelper.ts";
import CustomSelect from "../../CustomSelect.tsx";
import CustomSwitch from "../../CustomSwitch.tsx";
import ColorPalettePicker from "./ColorPalettePicker.tsx";

export default function ArrowEditor() {
  const {selectedItems, selectedSection} = useContext(UserContext);
  const {arrowPositions, updatePositionContextState} = useContext(PositionContext);
  const [arrow, setArrow] = useState<ArrowPosition | null>(null);
  const widthSliderRef = React.createRef<any>();
  const tensionSliderRef = React.createRef<any>();
  const pointerBeginningRef = React.createRef<any>();
  const pointerEndingRef = React.createRef<any>();
  const pointerWidthRef = React.createRef<any>();
  const pointerLengthRef = React.createRef<any>();
  const [isDotted, setIsDotted] = useState<boolean>(false);
  const isDottedRef = React.createRef<any>();

  useContext(PositionContext);

  useEffect(() => {
    if (selectedItems.length === 0) return;
    
    var arrow = getFromPositionType(selectedItems[0]) as ArrowPosition;
    setArrow(arrow);
    widthSliderRef?.current?.changeValue(arrow.width);
    tensionSliderRef?.current?.changeValue(arrow.tension);
    pointerBeginningRef?.current?.changeValue(arrow.pointerAtBeginning.valueOf.toString());
    pointerEndingRef?.current?.changeValue(arrow.pointerAtEnding.valueOf.toString());
    setIsDotted(arrow?.isDotted || false);
  }, [selectedItems]);

  const handleNumericValueChange = (newValue: number, type: "width" | "tension" | "pointerWidth" | "pointerLength") => {
    var updatedRecord = {...arrowPositions};
    var updatedArrow = updatedRecord[selectedSection!.id].find(x => strEquals(x.id, arrow!.id))!;
    updatedArrow.isSelected = false;
    updatedArrow[type] = newValue;
    updatePositionContextState({arrowPositions: updatedRecord});
    dbController.upsertItem("arrowPosition", updatedArrow);
  };
  
  const handleStringValueChange = (newValue: string, type: "color") => {
    var updatedRecord = {...arrowPositions};
    var updatedArrow = updatedRecord[selectedSection!.id].find(x => strEquals(x.id, arrow!.id))!;
    updatedArrow.isSelected = false;
    updatedArrow[type] = newValue;
    updatePositionContextState({arrowPositions: updatedRecord});
    dbController.upsertItem("arrowPosition", updatedArrow);
  };

  const handleBooleanValueChange = (newValue: boolean, type: "pointerAtBeginning" | "pointerAtEnding" | "isDotted") => {
    var updatedRecord = {...arrowPositions};
    var updatedArrow = updatedRecord[selectedSection!.id].find(x => strEquals(x.id, arrow!.id))!;
    updatedArrow.isSelected = false;
    updatedArrow[type] = newValue;
    updatePositionContextState({arrowPositions: updatedRecord});
    dbController.upsertItem("arrowPosition", updatedArrow);
  };
  
  return (
    <ExpandableSection
      title="線修正"
      titleIcon={ICON.stylusNoteBlack}>
      {
        arrow &&
        <div className="grid grid-cols-[2fr,3fr] p-1 gap-3 items-center">
          <span>色</span>
          <ColorPalettePicker
            color={arrow.color ?? ""}
            onChange={(color) => handleStringValueChange(color, "color")}/>
          <span>線の太さ</span>
          <CustomSlider
            ref={widthSliderRef}
            min={0.1}
            max={0.4}
            step={0.05}
            defaultValue={arrow!.width}
            setValue={(newValue) => {
              handleNumericValueChange(newValue, "width")
            }}/>
          {/* { // TODO: exports cannot handle tension so removing for now
            arrow?.points.length === 6 && 
            <>
              <span>角の丸さ</span>
              <CustomSlider
                ref={tensionSliderRef}
                min={0}
                max={1}
                step={0.1}
                defaultValue={arrow!.tension}
                setValue={(newValue) => {
                  handleNumericValueChange(newValue, "tension")
                }}/>
            </>
          } */}
          <div className="col-span-2">
            <CustomSwitch
              ref={isDottedRef}
              label="点線"
              onChange={e => handleBooleanValueChange(e, "isDotted")}
              defaultChecked={isDotted}/>
          </div>
          <span>先端</span>
          <div className="flex flex-row gap-3">
            <CustomSelect
              defaultValue={arrow.pointerAtBeginning ? ICON.lineStartArrowNotchBlack : ICON.lineStartBlack}
              setValue={(newValue) => handleBooleanValueChange(strEquals(newValue, ICON.lineStartArrowNotchBlack), "pointerAtBeginning")}
              isIcons
              items={{
                "true": ICON.lineStartArrowNotchBlack,
                "false": ICON.lineStartBlack,
                }}
              ref={pointerBeginningRef}
              />
            <CustomSelect
              defaultValue={arrow.pointerAtEnding ? ICON.lineEndArrowNotchBlack : ICON.lineEndBlack}
              setValue={(newValue) => {handleBooleanValueChange(strEquals(newValue, ICON.lineEndArrowNotchBlack), "pointerAtEnding")}}
              isIcons
              items={{
                "true": ICON.lineEndArrowNotchBlack,
                "false": ICON.lineEndBlack,
                }}
              ref={pointerEndingRef}
              />
          </div>
          {
            (arrow.pointerAtBeginning || arrow.pointerAtEnding) && 
            <>
              <span>矢印の幅</span>
              <CustomSlider
                ref={pointerWidthRef}
                min={1}
                max={3}
                step={0.1}
                defaultValue={arrow!.pointerWidth}
                setValue={(newValue) => {
                  handleNumericValueChange(newValue, "pointerWidth")
                }}/>
              <span>矢印の長さ</span>
              <CustomSlider
                ref={pointerLengthRef}
                min={1}
                max={3}
                step={0.1}
                defaultValue={arrow!.pointerLength}
                setValue={(newValue) => {
                  handleNumericValueChange(newValue, "pointerLength")
                }}/>
            </>
          }
        </div>
      }
    </ExpandableSection>
  )
}