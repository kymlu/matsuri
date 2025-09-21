import React, { useContext } from "react";
import ExpandableSection from "../ExpandableSection.tsx";
import { CompareMode, UserContext } from "../../contexts/UserContext.tsx";
import CustomToggleGroup from "../CustomToggleGroup.tsx";
import { isNullOrUndefinedOrBlank } from "../../helpers/GlobalHelper.ts";
import CustomSwitch from "../CustomSwitch.tsx";
import { SettingsContext } from "../../contexts/SettingsContext.tsx";
import { ICON } from "../../data/consts.ts";

export default function GridSettingsMenu() {
  const {compareMode, updateState} = useContext(UserContext);
  const {enableAnimation, enableGridSnap, updateSettingsContext} = useContext(SettingsContext);

  function onCompareModeChanged(value: string) {
    updateState({compareMode: value as CompareMode});
  }

  return (
    <ExpandableSection title="表示設定" defaultIsExpanded titleIcon={ICON.settingsBlack}>
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