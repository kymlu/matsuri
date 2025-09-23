import React, { useContext, useEffect, useState } from "react";
import ExpandableSection from "../../ExpandableSection.tsx";
import { UserContext } from "../../../contexts/UserContext.tsx";
import { getFromPositionType, NotePosition } from "../../../models/Position.ts";
import { PositionContext } from "../../../contexts/PositionContext.tsx";
import { ICON } from "../../../data/consts.ts";

export default function ArrowEditor() {
  const {selectedItems, selectedSection} = useContext(UserContext);

  useContext(PositionContext);

  // useEffect(() => {
  //   if (selectedItems.length === 0) return;
  //   var note = getFromPositionType(selectedItems[0]) as NotePosition;
  //   setLabel(note!.label);
  //   setText(note!.text);
  //   setNote(note);
  // }, [selectedItems]);
  
  return (
    <ExpandableSection
      title="線修正"
      titleIcon={ICON.textFieldsAltBlack}>
        {/**
         * todo
         * add color -> color menu
         * edit points -> arrow object. only enable if one arrow is selected
         */}
      <div className="grid grid-cols-2">
        <label>太さ</label>
        <span>to add size slider</span>
        <label>まるさ(only if bendy)</label>
        <span>to add roundness slider</span>
        <label>endpoints</label>
        <div>
          <span>to add start changer</span>
          <span>to add end changer</span>
        </div>
      </div>
    </ExpandableSection>
  )
}