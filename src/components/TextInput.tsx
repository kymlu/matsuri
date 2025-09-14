import React from "react";
import { isNullOrUndefinedOrBlank } from "./helpers/GlobalHelper.ts";
import classNames from "classnames";

export type TextInputProps = {
  text?: string,
  onContentChange: (newContent: string) => void,
  placeholder?: string,
  clearable?: boolean,
  compact?: boolean,
  centered?: boolean,
}

export default function TextInput(props: TextInputProps) {
  function handleChange(event: any) {
    props.onContentChange(event?.target?.value);
  }

  function onClear() {
    props.onContentChange("");
  }

  var inputClasses = classNames(
    "w-full col-start-1 row-start-1 pl-2 pr-6 text-black border-2 border-gray-200 rounded-md focus-within:border-primary focus:outline-none",
    {
      "h-6": props.compact,
      "text-center": props.centered,
    },)

  var wrapperClasses = classNames(
    "grid items-center w-full h-8 grid-cols-1",
    {
      "h-6": props.compact,
      "mb-2": !props.compact,
    },)

  return (
    <div className={wrapperClasses}>
      <input
        maxLength={20}
        placeholder={props.placeholder ?? ""}
        value={props.text ?? ""}
        onInput={(event) => handleChange(event)}
        className={inputClasses}/>

    { props.clearable && !isNullOrUndefinedOrBlank(props.text) && 
      <button className="col-start-1 row-start-1 pr-2 ml-auto text-end" onClick={() => {onClear()}}>
          <img
            className="size-4"
            src="icons/clear.svg"
            alt="Clear text"/>
      </button>}
    </div>
  )
}