import React, { useContext } from "react";
import Divider from "../Divider.tsx";
import SwapMenu from "./SwapMenu.tsx";
import PositionMenu from "./PositionMenu.tsx";
import CategoryMenu from "./CategoryMenu.tsx";
import GridSettingsMenu from "./GridSettingsMenu.tsx";
import AnimationMenu from "./AnimationMenu.tsx";
import { UserContext } from "../../contexts/UserContext.tsx";

export default function FormationRightPanel () {
  const {selectedItem} = useContext(UserContext);

  return (
    <div className="right-0 flex flex-col h-full max-h-full p-5 overflow-y-auto border-l-2 border-teal-700 border-solid">
      {selectedItem !== null &&
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
      <GridSettingsMenu/>
      <Divider/>
      <AnimationMenu/>
    </div>
  )
}