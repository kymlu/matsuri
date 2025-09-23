import React, { useContext, useEffect, useState } from "react";
import Divider from "../../Divider.tsx";
import CategoryMenu from "../menus/CategoryMenu.tsx";
import GridSettingsMenu from "../menus/GridSettingsMenu.tsx";
import { UserContext } from "../../../contexts/UserContext.tsx";
import ColorPickerMenu from "../menus/ColorPickerMenu.tsx";
import ActionMenu from "../menus/ActionMenu.tsx";
import NameEditor from "../menus/NameEditor.tsx";
import NoteEditor from "../menus/NoteEditor.tsx";
import { PositionType } from "../../../models/Position.ts";
import ExportMenu from "../menus/ExportMenu.tsx";
import { Sidebar } from "./Sidebar.tsx";

export type FormationRightPanelProps = {
  exportFunc?: (exportName: string) => void
}

export default function FormationRightPanel (props: FormationRightPanelProps) {
  return (
    <Sidebar>
      <FormationEditorRightContent exportFunc={props.exportFunc}/>
    </Sidebar>
  );
}

export function FormationEditorRightContent (props: FormationRightPanelProps) {
  const userContext = useContext(UserContext);
  const {selectedItems} = useContext(UserContext);
  const [selectedPositionTypes, setSelectedPositionTypes] = useState<Set<PositionType>>();

  useEffect(() => {
    setSelectedPositionTypes(new Set(selectedItems.map(x => x.type)));
  }, [userContext.selectedItems])

  return <>
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
    <Divider/>
    <ExportMenu exportFunc={props.exportFunc}/>
  </>
}