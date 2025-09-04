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
  const {selectedFormation, currentSections, selectedSection} = useContext(UserContext);
  const {propList, updateFormationContext} = useContext(FormationContext);

  function selectProp(selectedProp: Prop) {
    if(selectedSection === null) return;

    var newProp = {...selectedProp, id: crypto.randomUUID()};
    
    var newPositions: PropPosition[] = currentSections.map(section => {
      return {
        id: crypto.randomUUID().toString(),
        propId: newProp.id,
        formationSceneId: section.id,
        x: selectedFormation?.width ? selectedFormation.width / 2 : 5,
        x2: selectedFormation?.width ? selectedFormation.width / 2 : 5,
        y: selectedFormation?.length ? selectedFormation.length / 2 : 5,
        y2: selectedFormation?.length ? selectedFormation.length / 2 : 5,
        color: objectColorSettings.grey3,
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
        <div className="flex flex-col gap-2">
        {propsList
          .sort((a, b) => a.name.localeCompare(b.name))
          .map(prop => 
            <ItemButton
              key={prop.id}
              item={prop}
              onClick={() => selectProp(prop)}/>)} 
        </div>
      </ExpandableSection>
  )
}