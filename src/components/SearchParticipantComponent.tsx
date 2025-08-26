import { Input } from "@base-ui-components/react";
import React, { useState } from "react";

export interface SearchParticipantComponentProps {
  onValueChanged?: (value: string) => void
}

export default function SearchParticipantComponent(props: SearchParticipantComponentProps) {
  const [inputValue, setInputValue] = useState('');

  const handleChange = (value) => {
    setInputValue(value);
    props.onValueChanged?.(value);
  };
  
  return (
    <Input
      value={inputValue}
      placeholder="探す"
      onValueChange={(event) => handleChange(event)}
      className="border-gray-200 border-2 focus-within:border-primary rounded-md focus:outline-none px-2 w-full mb-2 h-8"/>
  )
}