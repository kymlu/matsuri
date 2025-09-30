import React, { useContext, useState } from "react";
import Divider from "../../Divider.tsx";
import CategoryMenu from "../menus/CategoryMenu.tsx";
import GridSettingsMenu from "../menus/GridSettingsMenu.tsx";
import { UserContext } from "../../../contexts/UserContext.tsx";
import NoteColorPresetPickerMenu from "../menus/NoteColorPickerMenu.tsx";
import ActionMenu from "../menus/ActionMenu.tsx";
import NameEditor from "../menus/NameEditor.tsx";
import NoteEditor from "../menus/NoteEditor.tsx";
import { PositionType } from "../../../models/Position.ts";
import ExportMenu from "../menus/ExportMenu.tsx";
import { Sidebar } from "./Sidebar.tsx";
import ArrowEditor from "../menus/ArrowEditor.tsx";

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

  const selectedTypes = new Set(selectedItems.map(x => x.type));
  // console.log(selectedTypes);
  // useEffect(() => {
  //   setSelectedPositionTypes(new Set(selectedItems.map(x => x.type)));
  // }, [userContext.selectedItems]);

  return <>
    { selectedItems.length > 0 &&
      <>
        <ActionMenu/>
        <Divider/>
      </>
    }
    { selectedItems.length > 0 &&
      selectedTypes?.size === 1 &&
      selectedItems[0].type === PositionType.participant && // Todo make sure nothing is selected if the selected items have different categories
      <>
        <CategoryMenu/>
        <Divider/>
      </>
    }
    { selectedItems.length > 0 &&
      selectedTypes?.size === 1 &&
      selectedItems[0].type === PositionType.note &&
      <>
        <NoteColorPresetPickerMenu/>
        <Divider/>
      </>
    }
    { selectedItems.length === 1 &&
      (selectedItems[0].type === PositionType.prop ||
        selectedItems[0].type === PositionType.participant) &&
      <>
        <NameEditor/>
        <Divider/>
      </>
    }
    { selectedItems.length === 1 &&
      selectedItems[0].type === PositionType.arrow &&
      <>
        <ArrowEditor/>
        <Divider/>
      </>
    }
    { selectedItems.length === 1 &&
      selectedTypes?.size === 1 &&
      selectedItems[0].type === PositionType.note &&
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