import React, { useContext } from "react";
import { arrowPresets, propsList } from "../../../data/ImaHitotabi.ts";
import ExpandableSection from "../../ExpandableSection.tsx";
import ItemButton from "../../ItemButton.tsx";
import { PositionContext } from "../../../contexts/PositionContext.tsx";
import { Prop } from "../../../models/Prop.ts";
import { ArrowPosition, PropPosition } from "../../../models/Position.ts";
import { basePalette, objectColorSettings } from "../../../themes/colours.ts";
import { UserContext } from "../../../contexts/UserContext.tsx";
import { dbController } from "../../../data/DBProvider.tsx";
import { ICON } from "../../../data/consts.ts";
import { addItemToRecordArray } from "../../../helpers/GroupingHelper.ts";
import { ArrowPreset } from "../../../models/Arrow.ts";
import { FormationContext } from "../../../contexts/FormationContext.tsx";
import { isNullOrUndefined } from "../../../helpers/GlobalHelper.ts";

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
      color: objectColorSettings.purpleLight,
      isSelected: false,
      pointerLength: 1,
      pointerWidth: 1,
    } as ArrowPosition;

    var updatedPositions = addItemToRecordArray(arrowPositions, selectedSection!.id, newPosition);
    updatePositionContextState({arrowPositions: updatedPositions});

    dbController.upsertItem("arrowPosition", newPosition);
  }
  
  return (
    <ExpandableSection
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