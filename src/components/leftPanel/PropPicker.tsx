import React, { useContext } from "react";
import { propsList } from "../../data/ImaHitotabi.ts";
import ExpandableSection from "../ExpandableSection.tsx";
import ItemButton from "../ItemButton.tsx";
import { PositionContext } from "../../contexts/PositionContext.tsx";
import { Prop } from "../../models/Prop.ts";
import { PropPosition } from "../../models/Position.ts";
import { objectColorSettings } from "../../themes/colours.ts";
import { UserContext } from "../../contexts/UserContext.tsx";
import { FormationContext } from "../../contexts/FormationContext.tsx";
import { dbController } from "../../data/DBProvider.tsx";

export default function PropPicker () {
  const {propPositions, updatePositionState} = useContext(PositionContext);
  const {currentSections, selectedSection, marginPositions} = useContext(UserContext);
  const {propList, updateFormationContext} = useContext(FormationContext);

  function selectProp(selectedProp: Prop) {
    if(selectedSection === null) return;

    var newProp = {
      ...selectedProp,
      id: crypto.randomUUID(),
      color: selectedProp.color ?? objectColorSettings.grey3,
      formationId: selectedSection.formationId
    } as Prop;

    var position = marginPositions.props[propList.length % marginPositions.props.length]
    
    var newPositions: PropPosition[] = currentSections.map(section => {
      return {
        id: crypto.randomUUID().toString(),
        propId: newProp.id,
        formationSectionId: section.id,
        x: position[0],
        x2: position[0],
        y: position[1],
        y2: position[1],
        isSelected: false,
        angle: 0
      } as PropPosition;
    });

    updateFormationContext({propList: [...propList, newProp]});
    updatePositionState({propPositions: [...propPositions, ...newPositions]});

    dbController.upsertItem("prop", newProp);
    dbController.upsertList("propPosition", newPositions);
  }
  
  return (
    <ExpandableSection title="大道具">
        <div className="flex flex-row flex-wrap gap-2">
        {propsList
          .sort((a, b) => a.name.localeCompare(b.name))
          .map(prop => 
            <ItemButton
              key={prop.id}
              item={prop}
              display={`${prop.name}(${prop.length}m)`}
              onClick={() => selectProp(prop)}/>)} 
        </div>
      </ExpandableSection>
  )
}