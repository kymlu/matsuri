import React, { useContext, useState } from "react";
import { propsList } from "../../data/ImaHitotabi.ts";
import ExpandableSection from "../ExpandableSection.tsx";
import ItemButton from "../ItemButton.tsx";
import { PositionContext } from "../../contexts/PositionContext.tsx";
import { Prop } from "../../models/Prop.ts";
import { PropPosition } from "../../models/Position.ts";
import { objectColorSettings } from "../../themes/colours.ts";
import { UserContext } from "../../contexts/UserContext.tsx";

export default function PropPicker () {
  const {propPositions, updatePositionState} = useContext(PositionContext);
  const {selectedFormation, selectedSection} = useContext(UserContext);

  const [selectedProps, setSelectedProps] = useState<Array<string>>([]);

  function selectProp(newProp: Prop) {
    if(selectedSection === null) return;
    
    setSelectedProps(prev => ([...prev, newProp.id]));
    var newPosition: PropPosition = {
      id: crypto.randomUUID().toString(),
      prop: newProp,
      formationScene: selectedSection!,
      x: selectedFormation?.width ? selectedFormation.width / 2 : 5,
      x2: selectedFormation?.width ? selectedFormation.width / 2 : 5,
      y: selectedFormation?.length ? selectedFormation.length / 2 : 5,
      y2: selectedFormation?.length ? selectedFormation.length / 2 : 5,
      color: objectColorSettings.black,
      isSelected: false
    };

      updatePositionState({propPositions: [...propPositions, newPosition]});
  }
  
  return (
    <ExpandableSection title="大道具">
        <div className="flex flex-col gap-2">
        {propsList
          .sort((a, b) => a.name.localeCompare(b.name))
          .map(prop => 
            <ItemButton
              key={prop.id}
              item={prop}
              isDisabled={selectedProps.includes(prop.id)}
              onClick={() => selectProp(prop)}/>)} 
        </div>
      </ExpandableSection>
  )
}