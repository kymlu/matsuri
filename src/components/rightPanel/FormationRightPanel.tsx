import React, { useContext } from "react";
import Divider from "../Divider.tsx";
import CategoryMenu from "./CategoryMenu.tsx";
import GridSettingsMenu from "./GridSettingsMenu.tsx";
import AnimationMenu from "./AnimationMenu.tsx";
import { UserContext } from "../../contexts/UserContext.tsx";
import ColorPickerMenu from "./ColorPickerMenu.tsx";
import ActionMenu from "./ActionMenu.tsx";
import NameEditor from "./NameEditor.tsx";
import NoteEditor from "./NoteEditor.tsx";
import { isNote, isParticipant, isProp } from "../../models/Position.ts";
import { FormationContext } from "../../contexts/FormationContext.tsx";

export default function FormationRightPanel () {
  const {selectedItem} = useContext(UserContext);
  const {participantList} = useContext(FormationContext);

  return (
    <div className="flex flex-col p-5 overflow-y-auto bg-white border-l-2 border-solid border-grey max-h-none w-80 max-w-80">
      { selectedItem !== null &&
        <>
          <ActionMenu/>
          <Divider/>
        </>
      }
      { selectedItem !== null && isParticipant(selectedItem) &&
        <>
          <CategoryMenu/>
          <Divider/>
          {/* <SwapMenu/>
          <Divider/> */}
        </>
      }
      { selectedItem !== null && (isProp(selectedItem) || isNote(selectedItem)) &&
        <>
          <ColorPickerMenu/>
          <Divider/>
        </>
      }
      { selectedItem !== null && (isParticipant(selectedItem) || isProp(selectedItem)) &&
        <>
          <NameEditor/>
          <Divider/>
        </>
      }
      { selectedItem !== null && isNote(selectedItem) &&
        <>
          <NoteEditor/>
          <Divider/>
        </>
      }
      <GridSettingsMenu/>
      <Divider/>
      { participantList.length > 0 && <AnimationMenu/> }
    </div>
  )
}