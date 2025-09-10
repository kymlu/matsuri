import React, { useContext, useEffect, useState } from "react";
import Divider from "../Divider.tsx";
import CategoryMenu from "./CategoryMenu.tsx";
import GridSettingsMenu from "./GridSettingsMenu.tsx";
import AnimationMenu from "./AnimationMenu.tsx";
import { UserContext } from "../../contexts/UserContext.tsx";
import ColorPickerMenu from "./ColorPickerMenu.tsx";
import ActionMenu from "./ActionMenu.tsx";
import NameEditor from "./NameEditor.tsx";
import NoteEditor from "./NoteEditor.tsx";
import { PositionType } from "../../models/Position.ts";
import { FormationContext } from "../../contexts/FormationContext.tsx";
import ExportMenu from "./ExportMenu.tsx";

export type FormationRightPanelProps = {
  exportFunc?: (exportName: string) => void
}

export default function FormationRightPanel (props: FormationRightPanelProps) {
  const userContext = useContext(UserContext);
  const {selectedItems} = useContext(UserContext);
  const {participantList} = useContext(FormationContext);
  const [selectedPositionTypes, setSelectedPositionTypes] = useState<Set<PositionType>>();

  useEffect(() => {
    console.log(userContext.selectedItems);
    setSelectedPositionTypes(new Set(selectedItems.map(x => x.type)));
  }, [userContext.selectedItems])

  return (
    <div className="flex flex-col p-5 overflow-y-auto bg-white border-l-2 border-solid border-grey max-h-none w-80 max-w-80">
      { selectedItems.length > 0 &&
        <>
          <ActionMenu/>
          <Divider/>
        </>
      }
      { selectedItems.length > 0 &&
        selectedPositionTypes?.size === 1 &&
        selectedPositionTypes.has(PositionType.participant) && // Todo make sure nothing is selected if the selected items have different categories
        <>
          <CategoryMenu/>
          <Divider/>
          {/* <SwapMenu/>
          <Divider/> */}
        </>
      }
      { selectedItems.length > 0 &&
        !selectedPositionTypes?.has(PositionType.participant) &&
        <>
          <ColorPickerMenu/>
          <Divider/>
        </>
      }
      { selectedItems.length === 1 &&
        (selectedPositionTypes?.has(PositionType.prop) ||
          selectedPositionTypes?.has(PositionType.participant)) &&
        <>
          <NameEditor/>
          <Divider/>
        </>
      }
      { selectedItems.length === 1 &&
        selectedPositionTypes?.size === 1 &&
        selectedPositionTypes.has(PositionType.note) &&
        <>
          <NoteEditor/>
          <Divider/>
        </>
      }
      <GridSettingsMenu/>
      { false && participantList.length > 0 && 
        <>
          <Divider/>
          <AnimationMenu/>
        </>
      }
      <Divider/>
      <ExportMenu exportFunc={props.exportFunc}/>
    </div>
  )
}