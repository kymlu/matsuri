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

  const classes = classNames("absolute flex max-w-[80svw] p-2 align-middle rounded-md bottom-3 outline outline-grey-800 bg-grey-50", {
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
  return <Toolbar.Separator orientation="vertical" className="w-px h-6 data-[orientation=vertical]:h-px data-[orientation=vertical]:w-full m-1 bg-gray-300"/>
}

export function CustomToolbarGroup(props: {children: React.ReactNode}) {
  return (
    <Toolbar.Group className="flex flex-row items-center flex-shrink-0 gap-1 data-[orientation=vertical]:flex-col w-full">
      {props.children}
    </Toolbar.Group>
  )
}