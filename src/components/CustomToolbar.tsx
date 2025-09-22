import { Toolbar } from "@base-ui-components/react";
import classNames from "classnames";
import React, { useContext, useEffect, useState } from "react";
import { CustomToolbarButton } from "./CustomToolbarButton.tsx";
import { ICON, GRID_SIZE_INCREMENT, MIN_GRID_SIZE, MAX_GRID_SIZE } from "../data/consts.ts";
import { VisualSettingsContext } from "../contexts/VisualSettingsContext.tsx";

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

  const classes = classNames("absolute flex max-w-[90svw] p-2 align-middle rounded-md bottom-3 outline outline-grey-800 bg-grey-50", {
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

export function ZoomToolbarGroup() {
  const {gridSize, updateVisualSettingsContext} = useContext(VisualSettingsContext);
  
  return (
    <CustomToolbarGroup reverseOnVertical>
      <CustomToolbarButton
        iconFileName={ICON.zoomOutBlack}
        onClick={() => {
          updateVisualSettingsContext({gridSize: gridSize - GRID_SIZE_INCREMENT});
        }}
        disabled={gridSize <= MIN_GRID_SIZE}/>
      <CustomToolbarButton
        iconFileName={ICON.zoomInBlack}
        onClick={() => {
          updateVisualSettingsContext({gridSize: gridSize + GRID_SIZE_INCREMENT});
        }}
        disabled={gridSize >= MAX_GRID_SIZE}/>
    </CustomToolbarGroup>
  )
}

export function NavigateToolbarGroup(props: {
  disablePrevious: boolean,
  disableNext: boolean,
  onChange?: (isNext: boolean) => void,
}) {
  return (
    <CustomToolbarGroup>
      <CustomToolbarButton
        iconLeft
        text="前へ"
        disabled={props.disablePrevious}
        iconFileName={ICON.chevronBackwardBlack}
        onClick={() => {props.onChange?.(false)}}/>
      <CustomToolbarButton
        text="次へ"
        disabled={props.disableNext}
        iconFileName={ICON.chevronForwardBlack}
        onClick={() => {props.onChange?.(true)}}/>
    </CustomToolbarGroup>
  )
}