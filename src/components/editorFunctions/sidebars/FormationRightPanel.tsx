import React, { useContext, useEffect, useState } from "react";
import Divider from "../../Divider.tsx";
import CategoryMenu from "../menus/CategoryMenu.tsx";
import GridSettingsMenu from "../menus/GridSettingsMenu.tsx";
import { UserContext } from "../../../contexts/UserContext.tsx";
import NoteColorPresetPickerMenu from "../menus/NoteColorPickerMenu.tsx";
import ActionMenu from "../menus/ActionMenu.tsx";
import NoteEditor from "../menus/NoteEditor.tsx";
import { PositionType } from "../../../models/Position.ts";
import ExportMenu from "../menus/ExportMenu.tsx";
import { Sidebar } from "./Sidebar.tsx";
import ArrowEditor from "../menus/ArrowEditor.tsx";
import PlacementNameEditor from "../menus/PlacementNameEditor.tsx";

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
  const {selectedItems} = useContext(UserContext);

  if (!selectedItems || selectedItems.length === 0) {
    return (
      <>
        <GridSettingsMenu />
        <Divider />
        <ExportMenu exportFunc={props.exportFunc} />
      </>
    );
  }
  
  const firstItem = selectedItems[0];
  const isSingleSelection = selectedItems.length === 1;
  const allSameType = selectedItems.every(item => item.type === firstItem.type);

  const participantAndPlaceholder = new Set([
    PositionType.participant,
    PositionType.placeholder,
  ]);

  const onlyParticipantOrPlaceholderSelected =
    selectedItems.length > 0 &&
    selectedItems.every(item => participantAndPlaceholder.has(item.type));
  
  const onlyNotesSelected =
    selectedItems.length > 0 &&
    allSameType &&
    firstItem.type === PositionType.note;

  return (
    <>
      <ActionMenu />
      <Divider />

      {onlyParticipantOrPlaceholderSelected && (
        <>
          <CategoryMenu />
          <Divider />
        </>
      )}

      {onlyNotesSelected && (
        <>
          <NoteColorPresetPickerMenu />
          <Divider />
        </>
      )}

      {isSingleSelection && firstItem.type === PositionType.arrow && (
        <>
          <ArrowEditor />
          <Divider />
        </>
      )}

      {isSingleSelection && firstItem.type === PositionType.note && (
        <>
          <NoteEditor />
          <Divider />
        </>
      )}
      {isSingleSelection && firstItem.type === PositionType.placeholder && (
        <>
          <PlacementNameEditor />
          <Divider />
        </>
      )}

      <GridSettingsMenu />
      <Divider />
      <ExportMenu exportFunc={props.exportFunc} />
    </>
  );
}
