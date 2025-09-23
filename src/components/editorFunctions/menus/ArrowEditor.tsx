import React, { useContext, useEffect, useState } from "react";
import ExpandableSection from "../../ExpandableSection.tsx";
import { UserContext } from "../../../contexts/UserContext.tsx";
import { ArrowPosition, getFromPositionType } from "../../../models/Position.ts";
import { PositionContext } from "../../../contexts/PositionContext.tsx";
import { ICON } from "../../../data/consts.ts";
import CustomSlider from "../../CustomSlider.tsx";
import { dbController } from "../../../data/DBProvider.tsx";
import { strEquals } from "../../../helpers/GlobalHelper.ts";

export default function ArrowEditor() {
  const {selectedItems, selectedSection} = useContext(UserContext);
  const {arrowPositions, updatePositionContextState} = useContext(PositionContext);
  const [arrow, setArrow] = useState<ArrowPosition | null>(null);
  const widthSliderRef = React.createRef<any>();
  const tensionSliderRef = React.createRef<any>();
  const pointerWidthRef = React.createRef<any>();
  const pointerLengthRef = React.createRef<any>();

  useContext(PositionContext);

  useEffect(() => {
    if (selectedItems.length === 0) return;
    
    var arrow = getFromPositionType(selectedItems[0]) as ArrowPosition;
    setArrow(arrow);
    widthSliderRef?.current?.changeValue(arrow.width);
    tensionSliderRef?.current?.changeValue(arrow.tension);
  }, [selectedItems]);

  const handleContentChange = (newValue: number, type: "width" | "tension" | "pointerWidth" | "pointerLength") => {
    var updatedRecord = {...arrowPositions};
    var updatedArrow = updatedRecord[selectedSection!.id].find(x => strEquals(x.id, arrow!.id))!;
    updatedArrow.isSelected = false;
    updatedArrow[type] = newValue;
    updatePositionContextState({arrowPositions: updatedRecord})
    dbController.upsertItem("arrowPosition", updatedArrow);
  };
  
  return (
    <ExpandableSection
      title="線修正"
      titleIcon={ICON.stylusNoteBlack}>
        {/**
         * todo
         * add color -> color menu
         * edit points -> arrow object. only enable if one arrow is selected
         */}
      {
        arrow &&
        <div className="grid grid-cols-[1fr,3fr] p-1 gap-3">
          <span>線の太さ</span>
          <CustomSlider
            ref={widthSliderRef}
            min={0.1}
            max={0.4}
            step={0.05}
            defaultValue={arrow!.width}
            setValue={(newValue) => {
              handleContentChange(newValue, "width")
            }}/>
          {
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
                  handleContentChange(newValue, "tension")
                }}/>
            </>
          }
          <span>先端</span>
          <div>
            <span>to add start changer</span>
            <span>to add end changer</span>
          </div>
          {
            (arrow.pointerAtBeginning || arrow.pointerAtEnding) && 
            <>
              <span>矢印の幅</span>
              <CustomSlider
                ref={pointerWidthRef}
                min={0.5}
                max={3}
                step={0.1}
                defaultValue={arrow!.pointerWidth}
                setValue={(newValue) => {
                  handleContentChange(newValue, "pointerWidth")
                }}/>
              <span>矢印の長さ</span>
              <CustomSlider
                ref={pointerLengthRef}
                min={0.2}
                max={2}
                step={0.1}
                defaultValue={arrow!.pointerLength}
                setValue={(newValue) => {
                  handleContentChange(newValue, "pointerLength")
                }}/>
            </>
          }
        </div>
      }
    </ExpandableSection>
  )
}