import React, { useContext } from "react";
import ExpandableSection from "../ExpandableSection.tsx";
import Button from "../Button.tsx";
import { UserContext } from "../../contexts/UserContext.tsx";
import { dbController } from "../../data/DBProvider.tsx";
import { NotePosition } from "../../models/Position.ts";
import { FormationContext } from "../../contexts/FormationContext.tsx";
import { notePresets } from "../../data/ImaHitotabi.ts";
import ItemButton from "../ItemButton.tsx";
import { Note } from "../../models/Note.ts";

export default function NotePicker () {
  const {selectedSection, updateState, marginPositions} = useContext(UserContext);
  const {noteList, updateFormationContext} = useContext(FormationContext);
  
  function selectPreset(selectedPreset: Note) {
    if(selectedSection === null) return;

    var position = marginPositions.notes[noteList.length % marginPositions.notes.length]

    var newNote = {
      id: crypto.randomUUID(),
      formationSectionId: selectedSection.id,
      x: position[0],
      x2: position[0],
      y: position[1],
      y2: position[1],
      label: selectedPreset.hasLabel ? "New Note" : "",
      text: selectedPreset.defaultContent,
      color: selectedPreset.color,
      width: selectedPreset.length,
      height: selectedPreset.height, // To do: make it resizable
      isSelected: false,
      borderRadius: selectedPreset.borderRadius,
      fontGridRatio: selectedPreset.fontGridRatio,
      alwaysBold: selectedPreset.alwaysBold || false,
    } as NotePosition;

    updateFormationContext({noteList: [...noteList, newNote]});
    updateState({selectedItem: null});

    dbController.upsertItem("notePosition", newNote);
  }

  return (
    <ExpandableSection title="メモ">
        <div className="flex flex-row flex-wrap gap-2">
        { notePresets.map((preset, index) => (
          <ItemButton
            key={index}
            onClick={() => selectPreset(preset)}
            item={preset}
            display={preset.label}/>
        ))}
        </div>
      </ExpandableSection>
  )
}