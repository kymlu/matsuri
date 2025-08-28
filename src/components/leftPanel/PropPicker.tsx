import React, { useContext, useState } from "react";
import { propsList } from "../../data/ImaHitotabi.ts";
import ExpandableSection from "../ExpandableSection.tsx";
import ItemButton from "../ItemButton.tsx";
import { FormationStateContext } from "../../contexts/FormationEditorContext.tsx";
import { Prop } from "../../models/Prop.ts";
import { PropPosition } from "../../models/Position.ts";
import { objectColorSettings } from "../../themes/colours.ts";

export default function PropPicker () {
  const {propPositions, updateFormationState} = useContext(FormationStateContext);

  const [selectedProps, setSelectedProps] = useState<Array<string>>([]);

  function selectProp(newProp: Prop) {
    if (selectedProps.includes(newProp.id)) {
      setSelectedProps(prev => (prev.filter(id => id !== newProp.id)))
    } else {
      setSelectedProps(prev => ([...prev, newProp.id]));
      var newPosition: PropPosition = {
        id: crypto.randomUUID().toString(),
        prop: newProp,
        formationSceneId: "", // todo
        x: 0,
        x2: 0,
        y: 0,
        y2: 0,
        color: objectColorSettings.black
      };

        updateFormationState({propPositions: [...propPositions, newPosition]});
    }
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