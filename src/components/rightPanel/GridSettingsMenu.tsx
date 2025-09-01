import React, { useContext } from "react";
import ExpandableSection from "../ExpandableSection.tsx";
import CustomSwitch from "../CustomSwitch.tsx";
import { UserContext } from "../../contexts/UserContext.tsx";

export default function GridSettingsMenu() {
  const {snapToGrid, showPrevious, showNext, updateState} = useContext(UserContext)

  function onChangeSnapToGrid (value: boolean) {
    updateState({snapToGrid: value})
  }

  function onChangeShowPrevious (value: boolean) {
    updateState({showPrevious: value})
  }

  function onChangeShowNext (value: boolean) {
    updateState({showNext: value})
  }

  return (
    <ExpandableSection title="表示設定" defaultIsExpanded>
      <CustomSwitch label="グリッドにスナップ" defaultChecked={snapToGrid} onChange={(checked) => onChangeSnapToGrid(checked)}/>
      <CustomSwitch label="前と比べる" defaultChecked={showPrevious} onChange={(checked) => onChangeShowPrevious(checked)}/>
      <CustomSwitch label="次と比べる" defaultChecked={showNext} onChange={(checked) => onChangeShowNext(checked)}/>
    </ExpandableSection>
  )
}