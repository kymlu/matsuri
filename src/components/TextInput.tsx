import React, { useImperativeHandle } from "react";
import { isNullOrUndefinedOrBlank } from "../lib/helpers/GlobalHelper.ts";
import classNames from "classnames";
import { ICON } from "../lib/consts.ts";

export type TextInputProps = {
  name?: string,
  default?: string,
  onContentChange: (newContent: string) => void,
  placeholder?: string,
  clearable?: boolean,
  compact?: boolean,
  centered?: boolean,
  required?: boolean,
  disabled?: boolean,
  ref?: React.Ref<any>,
  maxLength?: number,
  showLength?: boolean,
}

export default function TextInput(props: TextInputProps) {
  const [value, setValue] = React.useState<string>(props.default ?? "");

  useImperativeHandle(props.ref, () => ({
    changeValue: (newValue: string) => {
      setValue(newValue);
    }
  }));

  function handleChange(newValue: string) {
    setValue(newValue);
    props.onContentChange(newValue);
  }

  function onClear() {
    props.onContentChange("");
  }

  var inputClasses = classNames(
    "w-full col-start-1 row-start-1 pl-2 pr-6 text-black border-2 border-gray-200 rounded-md focus-within:border-primary focus:outline-none",
    {
      "h-6": props.compact,
      "text-center": props.centered,
      "bg-grey-200": props.disabled,
      "border-primary bg-primary-lighter placeholder:text-primary-darker": props.required && isNullOrUndefinedOrBlank(value),
    },)

  var wrapperClasses = classNames(
    "grid items-center w-full grid-cols-1",
    {
      "h-6": props.compact,
      "mb-2": !props.compact,
    },)

  return (
    <div className={wrapperClasses}>
      <input
        disabled={props.disabled}
        type="text"
        name={props.name}
        maxLength={props.maxLength ?? 20}
        placeholder={props.placeholder ?? ""}
        value={value ?? ""}
        onInput={(event) => handleChange(event.currentTarget.value)}
        className={inputClasses}/>

      {
        props.clearable && !isNullOrUndefinedOrBlank(value) && 
        <button className="col-start-1 row-start-1 pr-2 ml-auto text-end" onClick={() => {onClear()}}>
          <img
            className="size-4"
            src={ICON.clear}
            alt="Clear text"/>
        </button>
      }

      {
        props.showLength &&
        <span className="text-sm text-end">{`${value.length}/${props.maxLength ?? 20}`}</span>
      }
    </div>
  )
}