import React, { useContext } from "react";
import { arrowPresets } from "../../../data/ImaHitotabi.ts";
import ExpandableSection from "../../ExpandableSection.tsx";
import ItemButton from "../../ItemButton.tsx";
import { PositionContext } from "../../../contexts/PositionContext.tsx";
import { ArrowPosition } from "../../../models/Position.ts";
import { objectPalette } from "../../../themes/colours.ts";
import { UserContext } from "../../../contexts/UserContext.tsx";
import { ICON } from "../../../lib/consts.ts";
import { addItemToRecordArray } from "../../../lib/helpers/GroupingHelper.ts";
import { ArrowPreset } from "../../../models/Arrow.ts";
import { FormationContext } from "../../../contexts/FormationContext.tsx";
import { isNullOrUndefined } from "../../../lib/helpers/GlobalHelper.ts";
import { upsertItem } from "../../../data/DataRepository.ts";

export default function ArrowPicker (props: {margins: number[][]}) {
  const {arrowPositions, updatePositionContextState} = useContext(PositionContext);
  const {selectedSection} = useContext(UserContext);
  const {selectedFormation} = useContext(FormationContext);

  function addArrow(arrow: ArrowPreset) {
    if(isNullOrUndefined(selectedSection) || isNullOrUndefined(selectedFormation)) return;
    
    var newPosition: ArrowPosition = {
      id: crypto.randomUUID().toString(),
      formationSectionId: selectedSection!.id,
      x: selectedFormation!.width / 4,
      y: selectedFormation!.length * 0.25,
      points: arrow.points,
      tension: arrow.tension,
      pointerAtBeginning: arrow.pointerAtBeginning,
      pointerAtEnding: arrow.pointerAtEnding,
      width: 0.1,
      color: objectPalette.purple.light,
      isSelected: false,
      pointerLength: 1,
      pointerWidth: 1,
    } as ArrowPosition;

    var updatedPositions = addItemToRecordArray(arrowPositions, selectedSection!.id, newPosition);
    updatePositionContextState({arrowPositions: updatedPositions});

    upsertItem("arrowPosition", newPosition);
  }
  
  return (
    <ExpandableSection
			canExpand
      title="線"
      titleIcon={ICON.arrowRightAltBlack}>
        <div className="flex flex-row flex-wrap gap-2">
        {arrowPresets
          .map(arrow => 
            <ItemButton
              key={arrow.iconFileName}
              icon={arrow.iconFileName}
              onClick={() => addArrow(arrow)}/>
          )}
        </div>
      </ExpandableSection>
  )
}