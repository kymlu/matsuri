import React, { useContext, useState } from "react";
import ExpandableSection from "../ExpandableSection.tsx";
import { UserContext } from "../../contexts/UserContext.tsx";

export interface TextEditorProps {
  onValueChanged?: (value: string) => void,
  initialValue?: string
}

export default function TextEditor(props: TextEditorProps) {
  const [inputValue, setInputValue] = useState(props.initialValue);

  const {selectedItem, updateState} = useContext(UserContext);
  
  const handleChange = (value) => {
    var newValue = value.target.value;
    setInputValue(newValue);
    props.onValueChanged?.(newValue);
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