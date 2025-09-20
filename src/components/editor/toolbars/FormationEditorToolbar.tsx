import React, { useContext } from "react";
import { ICON, GRID_SIZE_INCREMENT, MIN_GRID_SIZE, MAX_GRID_SIZE } from "../../../data/consts.ts";
import { CustomToolbar, CustomToolbarGroup } from "../../CustomToolbar.tsx";
import { CustomToolbarButton } from "../../CustomToolbarButton.tsx";
import { UserContext } from "../../../contexts/UserContext.tsx";

export function FormationEditorToolbar() {
  const userContext = useContext(UserContext);
  const {updateState} = useContext(UserContext);

  return (
    <CustomToolbar>
      <CustomToolbarGroup>
        <CustomToolbarButton
          iconFileName={ICON.zoomOutBlack}
          onClick={() => {
            updateState({gridSize: userContext.gridSize - GRID_SIZE_INCREMENT});
          }}
          disabled={userContext.gridSize <= MIN_GRID_SIZE}/>
        <CustomToolbarButton
          iconFileName={ICON.zoomInBlack}
          onClick={() => {
            updateState({gridSize: userContext.gridSize + GRID_SIZE_INCREMENT});
          }}
          disabled={userContext.gridSize >= MAX_GRID_SIZE}/>
      </CustomToolbarGroup>
    </CustomToolbar>
  )
}