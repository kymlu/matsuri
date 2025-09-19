import { Toggle, Toolbar } from "@base-ui-components/react";
import classNames from "classnames";
import React from "react";

export type CustomToolbarButtonProp = {
  iconFileName?: string,
  text?: string,
  onClick?: () => void,
  iconLeft?: boolean,
  isToggle?: boolean,
  defaultValue?: boolean,
  disabled?: boolean
}

export function CustomToolbarButton(props: CustomToolbarButtonProp) {
  var className = classNames("flex items-center gap-1 h-8 px-1 rounded-md flex-shrink-0", {
    "flex-row": props.iconLeft ?? false,
    "flex-row-reverse": !props.iconLeft,
    "opacity-30 cursor-default": props.disabled,
    "hover:bg-grey-300 hover:data-[pressed]:bg-grey-300 data-[pressed]:bg-grey-200": !props.disabled,
  })

  return (
    <Toolbar.Button
      render={props.isToggle ?
         <Toggle
          pressed={props.defaultValue ?? false}/> : 
         <button/>} 
      className={className}
      onClick={() => {if(!props.disabled) props.onClick?.()}}>
      {props.iconFileName && <img src={props.iconFileName} className="size-6"/>}
      {props.text && <span className="text-nowrap">{props.text}</span>}
    </Toolbar.Button>
  )
}