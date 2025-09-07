import React, { useContext } from "react";
import ExpandableSection from "../ExpandableSection.tsx";
import { CompareMode, UserContext } from "../../contexts/UserContext.tsx";
import CustomToggleGroup from "../CustomToggleGroup.tsx";
import { isNullOrUndefinedOrBlank } from "../helpers/GlobalHelper.ts";

export default function GridSettingsMenu() {
  const {compareMode, gridSize, updateState} = useContext(UserContext)

  function onCompareModeChanged(value: string) {
    updateState({compareMode: value as CompareMode});
  }

  function onGridSizeChanged(value: number) {
    updateState({gridSize: value});
  }
  
  return (
    <ExpandableSection title="表示設定" defaultIsExpanded>
      <CustomToggleGroup
        label="セクション比較"
        options={[
          {label: "前", value: "previous"},
          {label: "無", value: "none"},
          {label: "後", value: "next"}
        ]}
        currentValue={compareMode?.toString()}
        defaultValue="none"
        onChange={(newValue: string) => {if(!isNullOrUndefinedOrBlank(newValue)){onCompareModeChanged(newValue)}}}/>
      <CustomToggleGroup
        label="Grid size (無効）"
        options={[
          {label: "小", value: "28"},
          {label: "中", value: "40"},
          {label: "大", value: "52"}
        ]}
        defaultValue="40"
        currentValue={gridSize?.toString()}
        onChange={(newValue: string) => {if(!isNullOrUndefinedOrBlank(newValue)){onGridSizeChanged(+newValue)}}}/>
    </ExpandableSection>
  )
}