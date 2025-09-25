import { Toolbar } from "@base-ui-components/react";
import classNames from "classnames";
import React from "react";
import { useIsLandscape } from "../helpers/GlobalHelper.ts";

export type CustomToolbarProps = {
  children: React.ReactNode
}

export function CustomToolbar(props: CustomToolbarProps) {
  const verticalToolbar = useIsLandscape();
  
  return (
    <Toolbar.Root
      orientation={verticalToolbar ? "vertical" : "horizontal"}
      className="landscape:absolute portrait:justify-between flex gap-2 max-h-[calc(100svh-80px)] landscape:px-2 portrait:px-5 py-2 align-middle landscape:rounded-md landscape:bottom-3 outline landscape:border-grey-800 portrait:outline-grey-200 bg-grey-50 
        landscape:right-3 landscape:flex-col landscape:overflow-y-auto landscape:overflow-x-hidden landscape:items-center
        portrait:overflow-x-auto portrait:overflow-y-hidden">
      {props.children}
    </Toolbar.Root> 
  )
}

export function CustomToolbarSeparator() {
  return <div className="flex landscape:w-full">
    <Toolbar.Separator
      className="w-px h-10 m-1 bg-gray-300 landscape:h-px landscape:w-full"/>
  </div>
}

export function CustomToolbarGroup(props: {children: React.ReactNode, reverseOnVertical?: boolean}) {
  var classnames = classNames("flex flex-row items-center flex-shrink-0 gap-2 landscape:flex-col", {
    "landscape:flex-col-reverse": props.reverseOnVertical
  })
  return (
    <Toolbar.Group className={classnames}>
      {props.children}
    </Toolbar.Group>
  )
}

export type CustomToolbarButtonProp = {
  iconFileName?: string,
  text?: string,
  onClick?: () => void,
  iconLeft?: boolean,
  isToggle?: boolean,
  isPressed?: boolean,
  disabled?: boolean,
  isDiv?: boolean,
  ref?: React.Ref<HTMLButtonElement>,
}

export function CustomToolbarButton(props: CustomToolbarButtonProp) {
  var className = classNames("group flex items-center gap-1 h-10 px-1 rounded-md flex-shrink-0", {
    "flex-row": props.iconLeft ?? false,
    "flex-row-reverse": !props.iconLeft,
    "opacity-30 cursor-default": props.disabled,
    "bg-grey-200": props.isPressed,
    "lg:hover:bg-grey-300 md:hover:bg-grey-300": !props.disabled,
  });

  return (
    <Toolbar.Button
      nativeButton={!props.isDiv}
      render={props.isDiv ? <div></div> : <button></button>}
      ref={props.ref}
      className={className}
      onClick={() => {if(!props.disabled) props.onClick?.()}}>
      {props.iconFileName && <img src={props.iconFileName} className="size-8"/>}
      {/* {props.text && <span className="text-nowrap group-data-[orientation=vertical]:hidden">{props.text}</span>} */}
    </Toolbar.Button>
  )
}