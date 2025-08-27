import React, { useContext } from "react";
import { UserContext } from "../../contexts/UserContext.tsx";
import Button from "../Button.tsx";
import ExpandableSection from "../ExpandableSection.tsx";
import CustomSwitch from "../CustomSwitch.tsx";
import NumberTextField from "../NumberTextField.tsx";

export default function FormationRightPanel () {
  const {selectedItem, snapToGrid, updateState} = useContext(UserContext)

  function onChangeSnapToGrid (value: boolean) {
    updateState({snapToGrid: value})
  }

  return (
    <div className="right-0 flex flex-col gap-5 h-full p-5 border-l-2 border-teal-700 border-solid overflow-y-scroll">
      {selectedItem !== null && <ExpandableSection title="Edit participant/prop">
        <div>Select a participant/prop</div>
        <div className="flex flex-row gap-2">
          <NumberTextField label="X" default={1}/>
          <NumberTextField label="Y" default={1}/>
        </div>
        <Button>Categories here with edit button to change name/color</Button>
        <Button>Swap with another dancer or a placeholder (this section only, this section and after, all section)</Button>
      </ExpandableSection>}
      <ExpandableSection title="Visuals">
        <CustomSwitch label="グリッドにスナップ" defaultChecked={snapToGrid} onChange={(checked) => onChangeSnapToGrid(checked)}/>
        <CustomSwitch label="前と比べる"/>
        <CustomSwitch label="次と比べる"/>
      </ExpandableSection>
      <ExpandableSection title="Animations">
        <Button>Show transition from previous</Button>
        <Button>Show transition for all</Button>
      </ExpandableSection>
    </div>
  )
}