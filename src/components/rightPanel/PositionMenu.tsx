import React from "react";
import ExpandableSection from "../ExpandableSection.tsx";
import NumberTextField from "../NumberTextField.tsx";

export default function PositionMenu() {
  return (
    <ExpandableSection title="隊列">
        <div className="flex flex-row gap-2">
          <NumberTextField label="X" default={1} min={-10} max={10}/>
          <NumberTextField label="Y" default={1} min={0} max={20}/>
      </div>
    </ExpandableSection>
  )
}