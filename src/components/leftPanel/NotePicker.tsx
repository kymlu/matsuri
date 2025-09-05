import React, { useContext } from "react";
import ExpandableSection from "../ExpandableSection.tsx";
import { NOTE_PRESETS } from "../../data/consts.ts";
import Button from "../Button.tsx";
import { UserContext } from "../../contexts/UserContext.tsx";
import { dbController } from "../../data/DBProvider.tsx";
import { NotePosition } from "../../models/Position.ts";
import { FormationContext } from "../../contexts/FormationContext.tsx";

export default function NotePicker () {
  const {selectedSection, updateState, marginPositions} = useContext(UserContext);
  const {noteList, updateFormationContext} = useContext(FormationContext);
  
  function selectPreset(selectedPreset: any) {
    if(selectedSection === null) return;

    var position = marginPositions.notes[noteList.length % marginPositions.notes.length]

    var newNote = {
      id: crypto.randomUUID(),
      formationSceneId: selectedSection.id,
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
      fontSize: selectedPreset.fontSize,
    } as NotePosition;

    updateFormationContext({noteList: [...noteList, newNote]});
    updateState({selectedItem: null});

    dbController.upsertItem("notePosition", newNote);
  }

  return (
    <ExpandableSection title="メモ">
        <div className="flex flex-col gap-2">
        { Object.entries(NOTE_PRESETS).map(([key, preset]) => (
          <Button
            key={key}
            onClick={() => selectPreset(preset)}>
            {preset.label}
          </Button>
        ))}
        </div>
      </ExpandableSection>
  )
}