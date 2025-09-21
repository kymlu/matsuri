import React, { useContext, useState } from "react";
import { ICON } from "../../../data/consts.ts";
import { CustomToolbar, CustomToolbarGroup, CustomToolbarSeparator, ZoomToolbarGroup } from "../../CustomToolbar.tsx";
import { CustomToolbarButton } from "../../CustomToolbarButton.tsx";
import { UserContext } from "../../../contexts/UserContext.tsx";
import { strEquals } from "../../../helpers/GlobalHelper.ts";

export type FormationViewToolbarProps = {
  firstSectionId?: string,
  lastSectionId?: string,
  selectedSectionId?: string,
  changeSection?: (isNext: boolean) => void,
  export?: () => void,
}

export function FormationViewerToolbar(props: FormationViewToolbarProps) {
  const userContext = useContext(UserContext);
  const {updateState} = useContext(UserContext);
  const [showPrevious, setShowPrevious] = useState<boolean>(false);

  return (
    <CustomToolbar>
      <CustomToolbarGroup>
        <CustomToolbarButton
          iconLeft
          text="前へ"
          disabled={strEquals(props.firstSectionId, props.selectedSectionId)}
          iconFileName={ICON.chevronBackwardBlack}
          onClick={() => {props.changeSection?.(false)}}/>
        <CustomToolbarButton
          text="次へ"
          disabled={strEquals(props.lastSectionId, props.selectedSectionId)}
          iconFileName={ICON.chevronForwardBlack}
          onClick={() => {props.changeSection?.(true)}}/>
      </CustomToolbarGroup>
      <CustomToolbarSeparator/>
      <ZoomToolbarGroup/>
      { false && userContext.selectedItems.length > 0 &&  // todo implement
        <>
          <CustomToolbarSeparator/>
          <CustomToolbarGroup>
            <CustomToolbarButton
              text="フォーカス"
              iconFileName={ICON.familiarFaceAndZoneBlack}
              onClick={() => {}}/>
          </CustomToolbarGroup>
        </>
      }
      <CustomToolbarSeparator/>
      <CustomToolbarGroup>
        <CustomToolbarButton
          isToggle
          text="メモ表示"
          iconFileName={ICON.noteStackBlack}
          defaultValue={userContext.showNotes}
          onClick={() => updateState({showNotes: !userContext.showNotes})}/>
        <CustomToolbarButton isToggle
          text="前の隊列表示"
          iconFileName={ICON.footprintBlack}
          defaultValue={showPrevious}
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