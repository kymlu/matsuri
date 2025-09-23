import React, { useContext } from "react";
import ExpandableSection from "../../ExpandableSection.tsx";
import { UserContext } from "../../../contexts/UserContext.tsx";
import { dbController } from "../../../data/DBProvider.tsx";
import { NotePosition } from "../../../models/Position.ts";
import { notePresets } from "../../../data/ImaHitotabi.ts";
import ItemButton from "../../ItemButton.tsx";
import { NotePreset } from "../../../models/Note.ts";
import { PositionContext } from "../../../contexts/PositionContext.tsx";
import { ICON } from "../../../data/consts.ts";
import { addItemToRecordArray } from "../../../helpers/GroupingHelper.ts";

export default function NotePicker (props: {margins: number[][]}) {
  const {selectedSection, updateState} = useContext(UserContext);
  const {notePositions, updatePositionContextState} = useContext(PositionContext);
  
  function addNote(selectedPreset: NotePreset) {
    if(selectedSection === null) return;

    var position = props.margins[(notePositions[selectedSection.id]?.length ?? 0) % props.margins.length]

    var newNote = {
      id: crypto.randomUUID(),
      formationSectionId: selectedSection.id,
      x: position[0],
      y: position[1],
      label: selectedPreset.hasLabel ? "New Note" : "",
      text: selectedPreset.defaultContent,
      color: selectedPreset.color,
      width: selectedPreset.length,
      height: selectedPreset.height, // To do: make it resizable
      isSelected: false,
      borderRadius: selectedPreset.borderRadius,
      fontGridRatio: selectedPreset.fontGridRatio,
      alwaysBold: selectedPreset.alwaysBold || false,
      showBackground: true, // todo: allow transparent
    } as NotePosition;

    var updatedNotePositions = addItemToRecordArray(notePositions, selectedSection.id, newNote);

    updatePositionContextState({notePositions: updatedNotePositions});
    updateState({selectedItems: []});

    dbController.upsertItem("notePosition", newNote);
  }

  return (
    <ExpandableSection
      title="メモ"
      titleIcon={ICON.noteStackBlack}>
        <div className="flex flex-row flex-wrap gap-2">
        { notePresets.map((preset, index) => (
          <ItemButton
            key={index}
            onClick={() => addNote(preset)}
            text={preset.label}/>
        ))}
        </div>
      </ExpandableSection>
  )
}