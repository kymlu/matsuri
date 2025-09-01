import React, { useContext } from "react";
import ExpandableSection from "../ExpandableSection.tsx";
import CustomSwitch from "../CustomSwitch.tsx";
import { CompareMode, UserContext } from "../../contexts/UserContext.tsx";
import CustomToggleGroup from "../CustomToggleGroup.tsx";

export default function GridSettingsMenu() {
  const {snapToGrid, updateState} = useContext(UserContext)

  function onChangeSnapToGrid (value: boolean) {
    updateState({snapToGrid: value})
  }

  function onCompareModeChanged(value: string) {
    updateState({compareMode: value as CompareMode});
  }
  
  return (
    <ExpandableSection title="表示設定" defaultIsExpanded>
      <CustomSwitch label="グリッドにスナップ" defaultChecked={snapToGrid} onChange={(checked) => onChangeSnapToGrid(checked)}/>
      <CustomToggleGroup
        label="セクション比較"
        options={[
          {label: "前", value: "previous"},
          {label: "無", value: "none"},
          {label: "後", value: "next"}]}
        onChange={(newValue: string) => {onCompareModeChanged(newValue)}}/>
    </ExpandableSection>
  )
}