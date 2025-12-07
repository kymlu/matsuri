import React, { useContext, useEffect } from "react";
import ExpandableSection from "../../ExpandableSection.tsx";
import { UserContext } from "../../../contexts/UserContext.tsx";
import { createPosition, ParticipantPosition, PlaceholderPosition, PositionType, splitPositionsByType } from "../../../models/Position.ts";
import { PositionContext } from "../../../contexts/PositionContext.tsx";
import { DEFAULT_BOTTOM_MARGIN, DEFAULT_SIDE_MARGIN, ICON } from "../../../lib/consts.ts";
import { upsertList } from "../../../data/DataRepository.ts";
import NumberTextField from "../../NumberTextField.tsx";
import { FormationContext } from "../../../contexts/FormationContext.tsx";

// Todo: add alignment, arrangement functions
export default function ParticipantPositionEditor() {
  const {selectedItems, selectedSection, updateState} = useContext(UserContext);
  const {selectedFormation} = useContext(FormationContext);

  const {participantPositions, placeholderPositions, updatePositionContextState} = useContext(PositionContext);
  const xRef = React.createRef<any>();
  const yRef = React.createRef<any>();

  useEffect(() => {
    var splitItems = splitPositionsByType(selectedItems);

    var items = [...splitItems.participants, ...splitItems.placeholders];
    var x = Array.from(new Set(items.map(x => x.x)));
    var y = Array.from(new Set(items.map(x => x.y)));

    if (x.length === 1) {
      xRef.current?.changeValue?.(x[0]);
    } else {
      xRef.current?.changeValue?.(null);
    }
    if (y.length === 1) {
      yRef.current?.changeValue?.(y[0]);
    } else {
      yRef.current?.changeValue?.(null);
    }
  }, [selectedItems]);

  const onValueChange = (newValue: number | null, type: "x" | "y") => {
    var positionByType = splitPositionsByType(selectedItems);
    
    var participants = positionByType.participants;
    var updatedPartPositions: ParticipantPosition[] = [];
    var ids = new Set(participants.map(x => x.id));
    var updatePartRecord = {...participantPositions};
    updatePartRecord[selectedSection!.id]
      ?.filter(x => ids.has(x.id))
      ?.forEach(x => {
        x[type] = newValue ?? 0;
        updatedPartPositions.push(x);
      });

    var placeholders = positionByType.placeholders;
    var updatedPlacePositions: PlaceholderPosition[] = [];
    var ids = new Set(placeholders.map(x => x.id));
    var updatedPlaceRecord = {...placeholderPositions};
    updatedPlaceRecord[selectedSection!.id]
      ?.filter(x => ids.has(x.id))
      ?.forEach(x => {
        x[type] = newValue ?? 0;
        updatedPlacePositions.push(x);
      });
    
    var updatedSelectedItems = [...updatedPartPositions.map(x => createPosition(x, PositionType.participant)), ...updatedPlacePositions.map(x => createPosition(x, PositionType.placeholder))];
    updateState({selectedItems: updatedSelectedItems});
    updatePositionContextState({participantPositions: updatePartRecord, placeholderPositions: updatedPlaceRecord});
    upsertList("participantPosition", updatedPartPositions);
    upsertList("placeholderPosition", updatedPlacePositions);
  }
  
  return (
    <ExpandableSection
      title="位置"
      titleIcon={ICON.textFieldsAltBlack}>
      <div className="grid grid-cols-[1fr,4fr] gap-2 items-center">
        <label>横</label>
        <NumberTextField
          name="横"
          default={0}
          min={-(selectedFormation!.width / 2 + (selectedFormation!.sideMargin ?? DEFAULT_SIDE_MARGIN))}
          max={selectedFormation!.width / 2 + (selectedFormation!.sideMargin ?? DEFAULT_SIDE_MARGIN)}
          step={0.01}
          buttonStep={0.1}
          onChange={(value) => {onValueChange(value, "x")}}
          ref={xRef}
        />
        <label>縦</label>
        <NumberTextField
          name="縦"
          default={0}
          min={0}
          max={selectedFormation!.length + (selectedFormation!.bottomMargin ?? DEFAULT_BOTTOM_MARGIN)}
          step={0.01}
          buttonStep={0.1}
          onChange={(value) => {onValueChange(value, "y")}}
          ref={yRef}
        />
      </div>
    </ExpandableSection>
  )
}