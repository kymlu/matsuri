import React, { useContext } from "react";
import { VisualSettingsContext } from "../../../contexts/VisualSettingsContext.tsx";
import { ICON, GRID_SIZE_INCREMENT, MIN_GRID_SIZE, MAX_GRID_SIZE } from "../../../data/consts.ts";
import { CustomToolbarGroup, CustomToolbarButton } from "../../CustomToolbar.tsx";

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