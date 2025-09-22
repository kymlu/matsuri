import { Toggle, ToggleGroup } from "@base-ui-components/react";
import React from "react";
import { strEquals } from "../helpers/GlobalHelper.ts";

export interface ToggleProps {
  label: string,
  value: string,
}

export interface CustomToggleGroupProps {
  label: string, // TODO: add icon support
  defaultValue: string,
  options: Array<ToggleProps>,
  onChange?: (newValue: string) => void,
  currentValue?: string,
}

export default function CustomToggleGroup(props: CustomToggleGroupProps){
  return (
    <div className="flex flex-row items-center justify-between gap-2 my-2">
      <label>{props.label}</label>
      <ToggleGroup
        defaultValue={[props.defaultValue]} 
        onValueChange={(value) => props.onChange?.(value[0])}
        className="flex flex-row border-2 border-solid rounded-md border-primary">
          {
            props.options.map(option => 
              <Toggle
                key={option.value}
                value={option.value}
                disabled={strEquals(option.value, props.currentValue)}
                className="flex size-8 items-center justify-center rounded-sm text-black select-none lg:hover:bg-grey-100 focus-visible:bg-none focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-1 active:bg-grey-200 data-[pressed]:font-bold data-[pressed]:bg-grey-300">
                {option.label}
              </Toggle>
            )
          }
      </ToggleGroup>
    </div>
  )
}