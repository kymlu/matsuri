import React, { useContext, useState } from "react";
import { ICON } from "../../../data/consts.ts";
import { CustomToolbar, CustomToolbarButton, CustomToolbarGroup, CustomToolbarSeparator } from "../../CustomToolbar.tsx";
import { UserContext } from "../../../contexts/UserContext.tsx";
import { strEquals } from "../../../helpers/GlobalHelper.ts";
import { FormationSection } from "../../../models/FormationSection.ts";
import { ZoomToolbarGroup } from "./ZoomToolbarGroup.tsx";
import { NavigateToolbarGroup } from "./NavigateToolbarGroup.tsx";
import { AppModeContext } from "../../../contexts/AppModeContext.tsx";
import { ExportFormDialog } from "../../dialogs/ExportFormDialog.tsx";
import { Dialog } from "@base-ui-components/react";

export type FormationToolbarProps = {
  firstSectionId?: string,
  lastSectionId?: string,
  selectedSectionId?: string,
  changeSection?: (sectionId?: FormationSection, isNext?: boolean) => void,
  export?: (followingId?: string) => void,
  changeFollowing?: () => void,
}

export function FormationToolbar(props: FormationToolbarProps) {
  const userContext = useContext(UserContext);
  const {appMode} = useContext(AppModeContext);
  const {updateState, currentSections} = useContext(UserContext);
  const [showPrevious, setShowPrevious] = useState<boolean>(false);
  const [showExportDialog, setShowExportDialog] = useState<boolean>(false);

  return (
    <CustomToolbar>
      <NavigateToolbarGroup
        disablePrevious={strEquals(props.firstSectionId, props.selectedSectionId)}
        disableList={currentSections.length <= 1}
        disableNext={strEquals(props.lastSectionId, props.selectedSectionId)}
        onChange={props.changeSection}/>
      <CustomToolbarSeparator/>
      <ZoomToolbarGroup/>
      {
        appMode === "view" && <>
          <CustomToolbarSeparator/>
          <CustomToolbarGroup>
            <CustomToolbarButton
              isToggle
              text="メモ表示"
              iconFileName={ICON.noteStackBlack}
              isPressed={userContext.showNotes}
              onClick={() => updateState({showNotes: !userContext.showNotes})}/>
            <CustomToolbarButton isToggle
              text="前の隊列表示"
              iconFileName={ICON.footprintBlack}
              isPressed={showPrevious}
              onClick={() => {
                updateState({compareMode: showPrevious ? "none" : "previous"})
                setShowPrevious(prev => !prev);
              }}/>
          </CustomToolbarGroup>
          <CustomToolbarSeparator/>
          <CustomToolbarGroup>
            <Dialog.Root modal>
              <Dialog.Trigger>
                <CustomToolbarButton
                  text="エクスポート"
                  isDiv
                  iconFileName={ICON.downloadBlack}
                  onClick={() => {
                    setShowExportDialog(true);
                  }}/>
              </Dialog.Trigger>
              <ExportFormDialog 
                onConfirm={(followingId?: string) => {
                  props.export?.(followingId);
                  setShowExportDialog(false);
                  }}/>
            </Dialog.Root>
          </CustomToolbarGroup>
        </>
      }
    </CustomToolbar>
  )
}