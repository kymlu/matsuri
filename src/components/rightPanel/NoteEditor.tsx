import React, { useContext, useEffect, useState } from "react";
import ExpandableSection from "../ExpandableSection.tsx";
import { UserContext } from "../../contexts/UserContext.tsx";
import { FormationContext } from "../../contexts/FormationContext.tsx";
import { dbController } from "../../data/DBProvider.tsx";
import { Participant } from "../../models/Participant.ts";
import { NotePosition, ParticipantPosition } from "../../models/Position.ts";
import { isNullOrUndefinedOrBlank, strEquals } from "../helpers/GlobalHelper.ts";
import ClearableTextInput from "../ClearableTextInput.tsx";

export default function NoteEditor() {
  const {selectedItem} = useContext(UserContext);

  const [label, setLabel] = useState("");
  const [text, setText] = useState("");
  const {noteList, updateFormationContext} = useContext(FormationContext);

  useEffect(() => {
    setLabel((selectedItem as NotePosition)?.label);
    setText((selectedItem as NotePosition)?.text);
  }, [selectedItem]);
  
  const handleContentChange = (value, type: "label" | "text") => {
    var newValue = value.target.value;
    if (type === "label") {
      setLabel(newValue);
    } else {
      setText(newValue);
    }
    
    var updatedNote = {...noteList.find(x => strEquals(x.id, (selectedItem as NotePosition)?.id))!};
    updatedNote.isSelected = false;
    if (type === "text") {
      updatedNote.text = newValue;
    } else {
      updatedNote.label = newValue;
    }
    updateFormationContext({noteList: [
      ...noteList.filter(x => !strEquals(x.id, (selectedItem as NotePosition)?.id)),
      updatedNote
    ]})
    dbController.upsertItem("notePosition", updatedNote);
  };

  function onClearLabel() {
    setLabel("");
    var updatedNote = {...noteList.find(x => strEquals(x.id, (selectedItem as NotePosition)?.id))!};
    updatedNote.isSelected = false;
    updatedNote.label = "";
    updateFormationContext({noteList: [
      ...noteList.filter(x => !strEquals(x.id, (selectedItem as NotePosition)?.id)),
      updatedNote
    ]})
    dbController.upsertItem("notePosition", updatedNote);
  }
  
  return (
    <ExpandableSection title="テキスト修正">
      <label>
        タイトル（任意）
      </label>
      <ClearableTextInput
        text={label}
        placeholder="タイトルを入力"
        onContentChange={(event) => handleContentChange(event, "label")}/>
      {/* <div className="grid items-center w-full h-8 grid-cols-1 mb-2">
        <input
          placeholder="タイトルを入力"
          value={label}
          onInput={(event) => handleContentChange(event, "label")}
          className="w-full col-start-1 row-start-1 px-2 border-2 border-gray-200 rounded-md focus-within:border-primary focus:outline-none"/>

       { !isNullOrUndefinedOrBlank(label) && 
        <button className="col-start-1 row-start-1 pr-2 text-end text-primary" onClick={() => {onClearLabel()}}>
            ✖︎
        </button>}
      </div> */}
        
      <label>
        内容
      </label>
      <textarea
        value={text}
        onInput={(event) => handleContentChange(event, "text")}
        className="w-full h-16 px-2 mb-2 border-2 border-gray-200 rounded-md focus-within:border-primary focus:outline-none"/>
    </ExpandableSection>
  )
}