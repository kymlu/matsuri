import React, { useContext, useState } from "react";
import ExpandableSection from "../ExpandableSection.tsx";
import { Input, Radio, RadioGroup } from "@base-ui-components/react";
import { ColorStyle } from "../../themes/colours.ts";
import { ParticipantCategory } from "../../models/ParticipantCategory.ts";
import ColorSwatch from "./ColorSwatch.tsx";
import { strEquals } from "../helpers/GlobalHelper.ts";
import { CategoryContext } from "../../contexts/CategoryContext.tsx";
import { dbController } from "../../data/DBProvider.tsx";
import { UserContext } from "../../contexts/UserContext.tsx";
import { ParticipantPosition } from "../../models/Position.ts";
import { PositionContext } from "../../contexts/PositionContext.tsx";
import ColorPicker from "./ColorPicker.tsx";

export interface TextEditorProps {
  onValueChanged?: (value: string) => void,
  initialValue?: string
}

export default function TextEditor(props: TextEditorProps) {
  const [inputValue, setInputValue] = useState(props.initialValue);

  const {selectedItem, updateState} = useContext(UserContext);
  
  const handleChange = (value) => {
    setInputValue(value.value);
    props.onValueChanged?.(value.value);
  };
  
  return (
    <ExpandableSection title="テキスト修正">
      <textarea
        value={inputValue}
        onInput={(event) => handleChange(event)}
        className="w-full h-16 px-2 mb-2 border-2 border-gray-200 rounded-md focus-within:border-primary focus:outline-none"/>
    </ExpandableSection>
  )
}