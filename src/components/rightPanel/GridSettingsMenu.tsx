import React, { useContext } from "react";
import ExpandableSection from "../ExpandableSection.tsx";
import CustomSwitch from "../CustomSwitch.tsx";
import { UserContext } from "../../contexts/UserContext.tsx";

export default function GridSettingsMenu() {
  const {snapToGrid, updateState} = useContext(UserContext)

  function onChangeSnapToGrid (value: boolean) {
    updateState({snapToGrid: value})
  }

  return (
    <ExpandableSection title="表示設定">
      <CustomSwitch label="グリッドにスナップ" defaultChecked={snapToGrid} onChange={(checked) => onChangeSnapToGrid(checked)}/>
      <CustomSwitch label="前と比べる"/>
      <CustomSwitch label="次と比べる"/>
    </ExpandableSection>
  )
}