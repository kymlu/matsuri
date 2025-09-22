import React, { useContext, useState } from "react";
import { ICON } from "../../../data/consts.ts";
import { CustomToolbar, CustomToolbarGroup, CustomToolbarSeparator, NavigateToolbarGroup, ZoomToolbarGroup } from "../../CustomToolbar.tsx";
import { CustomToolbarButton } from "../../CustomToolbarButton.tsx";
import { UserContext } from "../../../contexts/UserContext.tsx";
import { strEquals } from "../../../helpers/GlobalHelper.ts";

export type FormationViewToolbarProps = {
  firstSectionId?: string,
  lastSectionId?: string,
  selectedSectionId?: string,
  changeSection?: (isNext: boolean) => void,
  export?: () => void,
  changeFollowing?: () => void,
}

export function FormationViewToolbar(props: FormationViewToolbarProps) {
  const userContext = useContext(UserContext);
  const {updateState} = useContext(UserContext);
  const [showPrevious, setShowPrevious] = useState<boolean>(false);

  return (
    <CustomToolbar>
      <NavigateToolbarGroup
        disablePrevious={strEquals(props.firstSectionId, props.selectedSectionId)}
        disableNext={strEquals(props.lastSectionId, props.selectedSectionId)}
        onChange={props.changeSection}/>
      <CustomToolbarSeparator/>
      <ZoomToolbarGroup/>
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
        <CustomToolbarButton
          text="エクスポート"
          iconFileName={ICON.fileExportBlack}
          onClick={() => {
            props.export?.();
          }}/>
      </CustomToolbarGroup>
    </CustomToolbar>
  )
}