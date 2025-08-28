import React from "react";
import Divider from "../Divider.tsx";
import SwapMenu from "./SwapMenu.tsx";
import PositionMenu from "./PositionMenu.tsx";
import CategoryMenu from "./CategoryMenu.tsx";
import GridSettingsMenu from "./GridSettingsMenu.tsx";
import AnimationMenu from "./AnimationMenu.tsx";

export default function FormationRightPanel () {

  return (
    <div className="right-0 flex flex-col h-full max-h-full p-5 overflow-y-auto border-l-2 border-teal-700 border-solid">
      {/* {selectedItem !== null &&  */
        <>
          <CategoryMenu/>
          <Divider/>
          <PositionMenu/>
          <Divider/>
          <SwapMenu/>
          <Divider/>
        </>
      }
      <GridSettingsMenu/>
      <Divider/>
      <AnimationMenu/>
    </div>
  )
}