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
  tall?: boolean,
  short?: boolean,
  centered?: boolean,
  required?: boolean,
  hasError?: boolean,
  errorMsg?: string,
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
    "w-full col-start-1 row-start-1 pl-2 text-black border border-grey-300 rounded-md focus-within:border-primary focus:outline-none",
    {
      "pr-6": props.clearable,
      "pr-2": !props.clearable,
      "h-10": props.tall,
      "h-6": props.short,
      "text-center": props.centered,
      "bg-grey-200": props.disabled,
      "border-primary bg-primary-lighter placeholder:text-primary-darker": props.required && isNullOrUndefinedOrBlank(value) || props.hasError,
    },)

  var wrapperClasses = classNames(
    "grid items-center w-full grid-cols-1",
    {
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