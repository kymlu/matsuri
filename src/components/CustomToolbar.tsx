import { Toolbar } from "@base-ui-components/react";
import classNames from "classnames";
import React, { useEffect, useState } from "react";

export type CustomToolbarProps = {
  children: React.ReactNode
}

export function CustomToolbar(props: CustomToolbarProps) {
  const [isLandscape, setIsLandScape] = useState<boolean>(true);
  const [height, setHeight] = useState<number>(window.innerHeight);

  function handleWindowSizeChange() {
    setHeight(window.innerHeight);
  }

  useEffect(() => {
    window.matchMedia("(orientation: landscape)").addEventListener("change", e => {
      setIsLandScape(e.matches);
    });

    window.addEventListener('resize', handleWindowSizeChange);
    return () => {
        window.removeEventListener('resize', handleWindowSizeChange);
    }
  }, []);

  const verticalToolbar = isLandscape && height <= 768;

  const classes = classNames("absolute flex max-w-[90svw] max-h-[calc(100svh-80px)] p-2 align-middle rounded-md bottom-3 outline outline-grey-800 bg-grey-50", {
    "right-3 flex-col overflow-y-auto overflow-x-hidden items-center": verticalToolbar,
    "left-1/2 translate-x-[-50%] overflow-x-auto overflow-y-hidden": !verticalToolbar,
  })

  return (
    <Toolbar.Root
      orientation={verticalToolbar ? "vertical" : "horizontal"}
      className={classes}>
      {props.children}
    </Toolbar.Root> 
  )
}

export function CustomToolbarSeparator() {
  return <div className="flex w-full">
    <Toolbar.Separator
      className="w-px h-6 data-[orientation=horizontal]:h-px data-[orientation=horizontal]:w-full m-1 bg-gray-300"/>
  </div>
}

export function CustomToolbarGroup(props: {children: React.ReactNode, reverseOnVertical?: boolean}) {
  var classnames = classNames("flex flex-row items-center flex-shrink-0 gap-1 data-[orientation=vertical]:flex-col", {
    "data-[orientation=vertical]:flex-col-reverse": props.reverseOnVertical
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
  var className = classNames("group flex items-center gap-1 h-8 px-1 rounded-md flex-shrink-0", {
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
      {props.iconFileName && <img src={props.iconFileName} className="size-6"/>}
      {props.text && <span className="text-nowrap group-data-[orientation=vertical]:hidden">{props.text}</span>}
    </Toolbar.Button>
  )
}