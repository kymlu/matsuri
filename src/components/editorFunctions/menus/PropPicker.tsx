import React, { useContext } from "react";
import { propsList } from "../../../data/ImaHitotabi.ts";
import ExpandableSection from "../../ExpandableSection.tsx";
import ItemButton from "../../ItemButton.tsx";
import { PositionContext } from "../../../contexts/PositionContext.tsx";
import { Prop } from "../../../models/Prop.ts";
import { PropPosition } from "../../../models/Position.ts";
import { objectColorSettings } from "../../../themes/colours.ts";
import { UserContext } from "../../../contexts/UserContext.tsx";
import { EntitiesContext } from "../../../contexts/EntitiesContext.tsx";
import { dbController } from "../../../data/DBProvider.tsx";
import { ICON } from "../../../data/consts.ts";
import { addItemsToRecordByKey, addItemToRecord } from "../../../helpers/GroupingHelper.ts";

export default function PropPicker (props: {margins: number[][]}) {
  const {propPositions, updatePositionContextState} = useContext(PositionContext);
  const {currentSections, selectedSection} = useContext(UserContext);
  const {propList, updateEntitiesContext} = useContext(EntitiesContext);

  function selectProp(selectedProp: Prop) {
    if(selectedSection === null) return;

    var newProp = {
      ...selectedProp,
      id: crypto.randomUUID(),
      color: selectedProp.color ?? objectColorSettings.grey3,
      formationId: selectedSection.formationId
    } as Prop;

    var position = props.margins[Object.values(propList).length % props.margins.length]
    
    var newPositions: PropPosition[] = currentSections.map(section => {
      return {
        id: crypto.randomUUID().toString(),
        propId: newProp.id,
        formationSectionId: section.id,
        x: position[0],
        y: position[1],
        isSelected: false,
        angle: 0
      } as PropPosition;
    });

    var updatedProps = addItemToRecord(propList, newProp.id, newProp);
    updateEntitiesContext({propList: updatedProps});

    var updatedPositions = addItemsToRecordByKey(propPositions, newPositions, (item) => item.formationSectionId);
    updatePositionContextState({propPositions: updatedPositions});

    dbController.upsertItem("prop", newProp);
    dbController.upsertList("propPosition", newPositions);
  }
  
  return (
    <ExpandableSection
			canExpand
      title="大道具"
      titleIcon={ICON.flagBlack}>
        <div className="flex flex-row flex-wrap gap-2">
        {propsList
          .sort((a, b) => a.name.localeCompare(b.name))
          .map(prop => 
            <ItemButton
              key={prop.id}
              text={`${prop.name}(${prop.length}m)`}
              onClick={() => selectProp(prop)}/>)} 
        </div>
      </ExpandableSection>
  )
}