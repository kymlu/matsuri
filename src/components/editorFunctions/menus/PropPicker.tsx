import React, { useContext } from "react";
import ExpandableSection from "../../ExpandableSection.tsx";
import ItemButton from "../../ItemButton.tsx";
import { PositionContext } from "../../../contexts/PositionContext.tsx";
import { Prop } from "../../../models/Prop.ts";
import { PropPosition } from "../../../models/Position.ts";
import { UserContext } from "../../../contexts/UserContext.tsx";
import { EntitiesContext } from "../../../contexts/EntitiesContext.tsx";
import { ICON } from "../../../lib/consts.ts";
import { addItemsToRecordByKey } from "../../../lib/helpers/GroupingHelper.ts";
import { upsertList } from "../../../data/DataRepository.ts";

export default function PropPicker (props: {margins: number[][]}) {
  const {propPositions, updatePositionContextState} = useContext(PositionContext);
  const {currentSections, selectedSection} = useContext(UserContext);
  const {propList} = useContext(EntitiesContext);

  const selectProp = (selectedProp: Prop) => {
    if(selectedSection === null) return;

    var position = props.margins[((selectedSection == null || propPositions[selectedSection.id] == null) ? 0 : Object.values(propPositions[selectedSection.id]).length) % props.margins.length]
    var uniquePropId = crypto.randomUUID();

    var newPositions: PropPosition[] = currentSections.map(section => {
      return {
        id: crypto.randomUUID().toString(),
        propId: selectedProp.id,
        formationSectionId: section.id,
        x: position[0],
        y: position[1],
        isSelected: false,
        angle: 0,
        uniquePropId: uniquePropId,
      } as PropPosition;
    });

    var updatedPositions = addItemsToRecordByKey(propPositions, newPositions, (item) => item.formationSectionId);
    updatePositionContextState({propPositions: updatedPositions});
    upsertList("propPosition", newPositions);
  }
  
  return (
    <ExpandableSection
			canExpand
      title="大道具"
      titleIcon={ICON.flagBlack}>
        <div className="flex flex-row flex-wrap gap-2">
        {
          Object.values(propList)
            .sort((a, b) => a.name.localeCompare(b.name))
            .map(prop => 
              <ItemButton
                key={prop.id}
                text={`${prop.name}(${prop.length}m)`}
                onClick={() => selectProp(prop)}/>)
        } 
        {
          Object.keys(propList).length === 0 && 
          <span>大道具はありません。</span>
        }
        </div>
      </ExpandableSection>
  )
}