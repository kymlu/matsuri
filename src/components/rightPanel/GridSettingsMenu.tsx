import React, { useContext } from "react";
import ExpandableSection from "../ExpandableSection.tsx";
import { CompareMode, UserContext } from "../../contexts/UserContext.tsx";
import CustomToggleGroup from "../CustomToggleGroup.tsx";
import { isNullOrUndefinedOrBlank } from "../helpers/GlobalHelper.ts";
import CustomSwitch from "../CustomSwitch.tsx";
import { SettingsContext } from "../../contexts/SettingsContext.tsx";

export default function GridSettingsMenu() {
  const {compareMode, gridSize, updateState} = useContext(UserContext);
  const {enableAnimation, enableGridSnap, updateSettingsContext} = useContext(SettingsContext);

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
          {label: "次", value: "next"}
        ]}
        currentValue={compareMode?.toString()}
        defaultValue={compareMode ?? "none"}
        onChange={(newValue: string) => {if(!isNullOrUndefinedOrBlank(newValue)){onCompareModeChanged(newValue)}}}/>
      <CustomToggleGroup
        label="グリッドサイズ"
        options={[
          {label: "小", value: "28"},
          {label: "中", value: "40"},
          {label: "大", value: "52"}
        ]}
        defaultValue={gridSize?.toString() ?? "40"}
        currentValue={gridSize?.toString()}
        onChange={(newValue: string) => {if(!isNullOrUndefinedOrBlank(newValue)){onGridSizeChanged(+newValue)}}}/>
      <CustomSwitch
        label="遷移をアニメーション化する"
        defaultChecked={enableAnimation}
        onChange={(checked) => {updateSettingsContext({enableAnimation: checked})}}/>
      <CustomSwitch
        label="グリッドスナップ"
        defaultChecked={enableGridSnap}
        onChange={(checked) => {updateSettingsContext({enableGridSnap: checked})}}/>
      {/* {todo: add option to change color of section title -> formation level ??} */}
    </ExpandableSection>
  )
}