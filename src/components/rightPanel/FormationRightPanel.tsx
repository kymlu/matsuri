import React, { useContext } from "react";
import Divider from "../Divider.tsx";
import SwapMenu from "./SwapMenu.tsx";
import CategoryMenu from "./CategoryMenu.tsx";
import GridSettingsMenu from "./GridSettingsMenu.tsx";
import AnimationMenu from "./AnimationMenu.tsx";
import { UserContext } from "../../contexts/UserContext.tsx";
import ColorPickerMenu from "./ColorPickerMenu.tsx";
import TextEditor from "./TextEditor.tsx";
import ActionMenu from "./ActionMenu.tsx";
import NameEditor from "./NameEditor.tsx";

export default function FormationRightPanel () {
  const {selectedItem} = useContext(UserContext);

  return (
    <div className="flex flex-col p-5 overflow-y-auto bg-white border-l-2 border-solid border-grey-700 max-h-none w-80 max-w-80">
      { selectedItem !== null &&
        <>
          <ActionMenu/>
          <Divider/>
        </>
      }
      { selectedItem !== null && "participantId" in selectedItem &&
        <>
          <CategoryMenu/>
          <Divider/>
          {/* <SwapMenu/>
          <Divider/> */}
        </>
      }
      { selectedItem !== null && "color" in selectedItem &&
        <>
          <ColorPickerMenu/>
          <Divider/>
        </>
      }
      { selectedItem !== null && ("participantId" in selectedItem || "propId" in selectedItem) &&
        <>
          <NameEditor/>
          <Divider/>
        </>
      }
      { selectedItem !== null && "text" in selectedItem &&
        <>
          <TextEditor/>
          <Divider/>
        </>
      }
      <GridSettingsMenu/>
      <Divider/>
      <AnimationMenu/>
    </div>
  )
}