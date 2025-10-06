import React, { useImperativeHandle } from "react";
import { isNullOrUndefinedOrBlank } from "../lib/helpers/GlobalHelper.ts";
import classNames from "classnames";

export type DateInputProps = {
  name?: string,
  default?: string,
  onDateChange: (newDate: string) => void,
  compact?: boolean,
  centered?: boolean,
  required?: boolean,
  hasError?: boolean,
  ref?: React.Ref<any>,
}

export default function DateInput(props: DateInputProps) {
  const [value, setValue] = React.useState<string | undefined>(props.default ?? undefined);

  useImperativeHandle(props.ref, () => ({
    changeValue: (newValue: string) => {
      setValue(newValue);
    }
  }));

  function handleChange(newValue: string) {
    setValue(newValue);
    props.onDateChange(newValue);
  }

  var inputClasses = classNames(
    "w-full col-start-1 row-start-1 px-2 text-black border-2 border-gray-200 rounded-md focus-within:border-primary focus:outline-none",
    {
      "h-6": props.compact,
      "text-center": props.centered,
      "border-primary bg-primary-lighter text-primary-darker": props.required && isNullOrUndefinedOrBlank(value) || props.hasError,
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
        type="date"
        name={props.name}
        value={value}
        onInput={(event) => handleChange(event.currentTarget.value)}
        className={inputClasses}/>
    </div>
  )
}