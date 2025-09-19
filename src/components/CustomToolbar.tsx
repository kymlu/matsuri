import { Toolbar } from "@base-ui-components/react";
import React from "react";

export type CustomToolbarProps = {
  children: React.ReactNode
}

export function CustomToolbar(props: CustomToolbarProps) {
  return (
    <Toolbar.Root orientation="horizontal" className="absolute flex p-2 mx-5 overflow-auto align-middle rounded-md outline outline-grey-800 bottom-3 bg-grey-50">
      {props.children}
    </Toolbar.Root>
  )
}

export function CustomToolbarSeparator() {
  return <Toolbar.Separator className="w-px h-6 m-1 bg-gray-300"/>
}

export function CustomToolbarGroup(props: {children: React.ReactNode}) {
  return (
    <Toolbar.Group className="flex flex-row items-center flex-shrink-0 gap-1">
      {props.children}
    </Toolbar.Group>
  )
}