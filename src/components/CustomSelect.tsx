import { Select } from "@base-ui-components/react";
import React, { useState } from "react";
import { useImperativeHandle } from "react";
import { ICON } from "../lib/consts.ts";

export type CustomSelectProps = {
  items: Record<string, string>,
  isIcons?: boolean,
  defaultValue: string,
  setValue?: (newValue: string) => void,
  ref?: React.Ref<any>,
}

export default function CustomSelect(props: CustomSelectProps) {
  const [value, setValue] = useState<string>(props.defaultValue);

  useImperativeHandle(props.ref, () => ({
    changeValue: (newValue: string) => {
      setValue(newValue);
    }
  }));

  return (
    <Select.Root
      value={value}
      items={props.items}
      onValueChange={(newValue) => {
        props.setValue?.(newValue);
        setValue(newValue);
      }}>
      <Select.Trigger className="flex flex-row items-center justify-between w-full p-2 rounded-md outline outline-1 outline-grey-300">
        <Select.Value>
          {props.isIcons ? <img className="size-8" src={value}/> : value}
        </Select.Value>
        <Select.Icon className="flex align-middle">
          <img className="size-4" src={ICON.expandMoreBlack}/>
        </Select.Icon>
      </Select.Trigger>
      <Select.Portal>
        <Select.Positioner className="z-10 bg-white rounded-md select-none outline outline-1 outline-grey-300">
          <Select.Popup className="flex flex-col gap-1 p-2">
            { Object.entries(props.items).map(([label, value]) => (
              <Select.Item
                key={label}
                value={value}
                className="flex p-2 hover:bg-grey-200"
              >
                {props.isIcons ? <img className="size-8" src={value}/> : value}
              </Select.Item>
            ))}
          </Select.Popup>
        </Select.Positioner>
      </Select.Portal>
    </Select.Root>
  )
}