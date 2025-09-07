import React from "react";
import { isNullOrUndefinedOrBlank } from "./helpers/GlobalHelper.ts";

export type ClearableTextInputProps = {
  text?: string,
  onContentChange: (event: any) => void,
  placeholder?: string,
}

export default function ClearableTextInput(props: ClearableTextInputProps) {
  function handleChange(event: any) {
    props.onContentChange(event);
  }

  function onClear() {
    props.onContentChange("");
  }

  return (
    <div className="grid items-center w-full h-8 grid-cols-1 mb-2">
      <input
        placeholder={props.placeholder ?? ""}
        value={props.text ?? ""}
        onInput={(event) => handleChange(event)}
        className="w-full col-start-1 row-start-1 px-2 border-2 border-gray-200 rounded-md focus-within:border-primary focus:outline-none"/>

    { !isNullOrUndefinedOrBlank(props.text) && 
      <button className="col-start-1 row-start-1 pr-2 text-end text-primary" onClick={() => {onClear()}}>
          ✖︎
      </button>}
    </div>
  )
}