import { Switch } from "@base-ui-components/react";
import React from "react";

export interface CustomSwitchProps {
  label: string
  defaultChecked?: boolean,
  onChange?: (checked: boolean) => void
}

export default function CustomSwitch(props: CustomSwitchProps){
  const [checked, setChecked] = React.useState<boolean>(props.defaultChecked ?? false);

  function handleChange(checked: boolean){
    setChecked(checked)
    props.onChange?.(checked)
  }

  return (
    <div className="grid grid-cols-[auto,1fr] gap-2 items-center my-2">
      <label>{props.label}</label>
      <Switch.Root
        checked={checked}
        defaultChecked={props.defaultChecked ?? false}
        onCheckedChange={(checked) => {handleChange(checked)}}
        className="relative flex h-4 w-10 rounded-full items-center bg-gradient-to-r from-primary from-35% to-grey-300 to-65% bg-[length:6.5rem_100%] bg-[100%_0%] bg-no-repeat transition-[background-position,box-shadow] duration-[125ms] ease-[cubic-bezier(0.26,0.75,0.38,0.45)] before:absolute before:rounded-full before:outline-offset-2 focus-visible:before:inset-0 focus-visible:before:outline focus-visible:before:outline-2 active:bg-primary-lighter data-[checked]:bg-[0%_0%] data-[checked]:active:bg-primary-lighter shadow-none">
        <Switch.Thumb className="aspect-square h-6 rounded-full bg-white shadow-none transition-all duration-150 data-[checked]:translate-x-4 border-2 border-grey-400 data-[checked]:border-primary"/>
      </Switch.Root>
    </div>
  )
}