import React, { useContext } from "react";
import Divider from "../Divider.tsx";
import SwapMenu from "./SwapMenu.tsx";
import PositionMenu from "./PositionMenu.tsx";
import CategoryMenu from "./CategoryMenu.tsx";
import GridSettingsMenu from "./GridSettingsMenu.tsx";
import AnimationMenu from "./AnimationMenu.tsx";
import { UserContext } from "../../contexts/UserContext.tsx";
import ColorPickerMenu from "./ColorPickerMenu.tsx";

export default function FormationRightPanel () {
  const {selectedItem} = useContext(UserContext);

  return (
    <div className="flex flex-col p-5 overflow-y-auto bg-white border-l-2 border-solid max-h-none border-primary w-80 max-w-80">
      { selectedItem !== null && "participant" in selectedItem &&
        <>
          {/* { "name" in selectedItem && todo: make this work */
            <>
              <CategoryMenu/>
              <Divider/>
            </>
          }
          <PositionMenu/>
          <Divider/>
          <SwapMenu/>
          <Divider/>
        </>
      }
      { selectedItem !== null && "color" in selectedItem &&
        <>
          <ColorPickerMenu/>
          <Divider/>
        </>
      }
      <GridSettingsMenu/>
      <Divider/>
      <AnimationMenu/>
    </div>
  )
}