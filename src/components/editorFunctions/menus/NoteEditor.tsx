import React, { useContext, useEffect, useState } from "react";
import ExpandableSection from "../../ExpandableSection.tsx";
import { UserContext } from "../../../contexts/UserContext.tsx";
import { NotePosition, splitPositionsByType } from "../../../models/Position.ts";
import { strEquals } from "../../../lib/helpers/GlobalHelper.ts";
import TextInput from "../../TextInput.tsx";
import { PositionContext } from "../../../contexts/PositionContext.tsx";
import { ICON } from "../../../lib/consts.ts";
import { upsertItem, upsertList } from "../../../data/DataRepository.ts";
import CustomSlider from "../../CustomSlider.tsx";
import Button from "../../Button.tsx";

export default function NoteEditor() {
  const {selectedItems, selectedSection} = useContext(UserContext);

  const [notes, setNotes] = useState<NotePosition[]>([]);
  const [label, setLabel] = useState("");
  const [text, setText] = useState("");
  const [textSize, setTextSize] = useState(0.5);
  const {notePositions, updatePositionContextState} = useContext(PositionContext);
  const textSizeRef = React.createRef<any>();

  useEffect(() => {
    if (selectedItems.length === 0) return;
    var splitItems = splitPositionsByType(selectedItems);

    var notesList = splitItems.notes;
    if (notesList.length === 1) {
      setLabel(notesList[0]!.label);
      setText(notesList[0]!.text);
    } else {
      setLabel("");
      setText("");
    }

    setTextSize(notesList[0]?.fontGridRatio ?? 0.5);
    textSizeRef?.current?.changeValue(notesList[0]?.fontGridRatio ?? 0.5);
    setNotes(notesList);
  }, [selectedItems]);
  
  const handleContentChange = (newValue: string, type: "label" | "text") => {
    if (notes.length !== 1) return;
    
    if (type === "label") {
      setLabel(newValue);
    } else {
      setText(newValue);
    }
    
    var updatedRecord = {...notePositions};
    var updatedNote = updatedRecord[selectedSection!.id].find(x => strEquals(x.id, notes[0]!.id))!;
    updatedNote.isSelected = false;
    updatedNote[type] = newValue;
    
    updatePositionContextState({notePositions: updatedRecord})
    upsertItem("notePosition", updatedNote);
  };

  const handleTextAlignmentChange = (newValue: "left" | "center" | "right") => {
    var updatedRecord = {...notePositions};
    var noteIds = new Set(notes.map(x => x.id));
    console.log("Changing alignment to", newValue, noteIds);
    var updatedNotes = updatedRecord[selectedSection!.id].filter(x => noteIds.has(x.id))!;
    updatedNotes.forEach(x => {
      x.isSelected = false;
      x.textAlignment = newValue;
    })
    updatePositionContextState({notePositions: updatedRecord});
    upsertList("notePosition", updatedNotes);
  }


  const handleTextSizeChange = (newValue: number) => {
    var updatedRecord = {...notePositions};
    var noteIds = new Set(notes.map(x => x.id));
    console.log("Changing text size to", newValue, noteIds);
    var updatedNotes = updatedRecord[selectedSection!.id].filter(x => noteIds.has(x.id))!;
    updatedNotes.forEach(x => {
      x.isSelected = false;
      x.fontGridRatio = newValue;
    })
    updatePositionContextState({notePositions: updatedRecord});
    upsertList("notePosition", updatedNotes);
  };

  const handleBoldToggle = () => {
    var updatedRecord = {...notePositions};
    var noteIds = new Set(notes.map(x => x.id));
    var newValue = notes.some(x => !x.alwaysBold); // if any selected note is not bold, we set all to bold
    console.log("Toggling bold to", newValue, noteIds);
    var updatedNotes = updatedRecord[selectedSection!.id].filter(x => noteIds.has(x.id))!;
    updatedNotes.forEach(x => {
      x.isSelected = false;
      x.alwaysBold = newValue;
    })
    updatePositionContextState({notePositions: updatedRecord});
    upsertList("notePosition", updatedNotes);
  }
  
  return (
    <ExpandableSection
      title="テキスト修正"
      titleIcon={ICON.textFieldsAltBlack}>
      {
        notes && notes.length === 1 && <>
          <label>
            タイトル（任意）
          </label>
          <TextInput
            clearable
            default={label}
            placeholder="タイトルを入力"
            onContentChange={(event) => handleContentChange(event, "label")}/>
            
          <label>
            内容
          </label>
          <textarea
            value={text}
            onInput={(event: any) => handleContentChange(event?.target?.value, "text")}
            className="w-full h-16 px-2 mb-2 border-2 border-gray-200 rounded-md focus-within:border-primary focus:outline-none"/>
        </>
      }
      <label>テキスト揃え</label>
      <div className="flex flex-row gap-1">
        <Button
          onClick={() => handleTextAlignmentChange("left")}>
          <img className="size-6" alt="Distribute horizontally" src={ICON.formatAlignLeftBlack}/>
        </Button>
        <Button
          onClick={() => handleTextAlignmentChange("center")}>
          <img className="size-6" alt="Distribute vertically" src={ICON.formatAlignCenterBlack}/>
        </Button>
        <Button
          onClick={() => handleTextAlignmentChange("right")}>
          <img className="size-6" alt="Distribute vertically" src={ICON.formatAlignRightBlack}/>
        </Button>
      </div>
      <label>テキストサイズ</label>
      <div className="mx-2">
        <CustomSlider
          ref={textSizeRef}
          min={0.25}
          max={0.75}
          step={0.05}
          defaultValue={textSize}
          setValue={(newValue) => {
            handleTextSizeChange(newValue)
          }}/>
      </div>
      <label>テキストスタイル</label>
      <div className="mx-2">
        <Button
          onClick={() => handleBoldToggle()}>
          <img className="size-6" alt="Toggle bold" src={ICON.formatBoldBlack}/>
        </Button>
      </div>
    </ExpandableSection>
  )
}