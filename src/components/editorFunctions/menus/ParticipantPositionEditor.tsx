import React, { useContext, useEffect, useState } from "react";
import ExpandableSection from "../../ExpandableSection.tsx";
import { UserContext } from "../../../contexts/UserContext.tsx";
import { createPosition, ParticipantPosition, PlaceholderPosition, Position, PositionType, splitPositionsByType } from "../../../models/Position.ts";
import { PositionContext } from "../../../contexts/PositionContext.tsx";
import { DEFAULT_BOTTOM_MARGIN, DEFAULT_SIDE_MARGIN, ICON } from "../../../lib/consts.ts";
import { upsertList } from "../../../data/DataRepository.ts";
import NumberTextField from "../../NumberTextField.tsx";
import { FormationContext } from "../../../contexts/FormationContext.tsx";
import Button from "../../Button.tsx";
import { indexByKey } from "../../../lib/helpers/GroupingHelper.ts";
import { roundToTenth } from "../../../lib/helpers/GlobalHelper.ts";

export default function ParticipantPositionEditor() {
  const {selectedItems, selectedSection, updateState} = useContext(UserContext);
  const {selectedFormation} = useContext(FormationContext);
  const {participantPositions, placeholderPositions, updatePositionContextState} = useContext(PositionContext);

  const [items, setItems] = useState<(ParticipantPosition | PlaceholderPosition)[]>([]);
  const [xValues, setXValues] = useState<number[]>([]);
  const [yValues, setYValues] = useState<number[]>([]);

  const xRef = React.createRef<any>();
  const yRef = React.createRef<any>();

  useEffect(() => {
    var splitItems = splitPositionsByType(selectedItems);

    var items = [...splitItems.participants, ...splitItems.placeholders];
    var xList = Array.from(new Set(items.map(x => x.x)));
    var yList = Array.from(new Set(items.map(x => x.y)));

    setItems(items);
    setXValues(xList);
    setYValues(yList);

    if (xList.length === 1) {
      xRef.current?.changeValue?.(xList[0]);
    } else {
      xRef.current?.changeValue?.(null);
    }
    
    if (yList.length === 1) {
      yRef.current?.changeValue?.(yList[0]);
    } else {
      yRef.current?.changeValue?.(null);
    }
  }, [selectedItems]);

  const onValueChange = (newValue: number | null, type: "x" | "y") => {
    var positionByType = splitPositionsByType(selectedItems);
    
    var participants = positionByType.participants;
    var updatedPartPositions: ParticipantPosition[] = [];
    var ids = new Set(participants.map(x => x.id));
    var updatedPartRecord = {...participantPositions};
    updatedPartRecord[selectedSection!.id]
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
    updatePositionContextState({
      participantPositions: updatedPartRecord,
      placeholderPositions: updatedPlaceRecord,
    });
    upsertList("participantPosition", updatedPartPositions);
    upsertList("placeholderPosition", updatedPlacePositions);
  }

  const alignHorizontal = (type: "left" | "centre" | "right") => {
    var newValue: number = 0;
    switch (type) {
      case "left":
        newValue = Math.min(...xValues);
        break;
      case "centre":
        newValue = (Math.min(...xValues) + Math.max(...xValues))/2;
        break;
      case "right":
        newValue = Math.max(...xValues);
        break;
    }
    onValueChange(newValue, "x");
    setXValues([newValue]);
  }

  const alignVertical = (type: "top" | "centre" | "bottom") => {
    var newValue: number = 0;
    switch (type) {
      case "top":
        newValue = Math.min(...yValues);
        break;
      case "centre":
        newValue = (Math.min(...yValues) + Math.max(...yValues))/2;
        break;
      case "bottom":
        newValue = Math.max(...yValues);
        break;
    }
    onValueChange(newValue, "y");
    setYValues([newValue]);
  }

  const distribute = (type: "x" | "y") => {
    var sortedItems = items.sort((a, b) => {return a[type] - b[type]});
    var min = sortedItems[0][type];
    var max = sortedItems[sortedItems.length - 1][type]
    var interval = (max - min) / (sortedItems.length - 1);
    sortedItems.forEach((value, index) => {
      value[type] = roundToTenth(min + index * interval);
    });

    var updatedSelectedItems = sortedItems.map(x => createPosition(x));
    var splitPositions = splitPositionsByType(updatedSelectedItems);
    var indexedParticipants = indexByKey(splitPositions.participants, "id");
    var participantIds = new Set(Object.keys(indexedParticipants));
    var updatedPartRecord = {...participantPositions};
    var updatedPartPositions: ParticipantPosition[] = [];
    updatedPartRecord[selectedSection!.id]
      ?.filter(x => participantIds.has(x.id))
      ?.forEach(x => {
        x[type] = indexedParticipants[x.id][type];
        updatedPartPositions.push(x);
      });

    var indexedPlaceholders = indexByKey(splitPositions.placeholders, "id");
    var placeholdersIds = new Set(Object.keys(indexedPlaceholders));
    var updatedPlaceRecord = {...placeholderPositions};
    var updatedPlacePositions: PlaceholderPosition[] = [];
    updatedPlaceRecord[selectedSection!.id]
      ?.filter(x => placeholdersIds.has(x.id))
      ?.forEach(x => {
        x[type] = indexedPlaceholders[x.id][type];
        updatedPlacePositions.push(x);
      });

    updateState({selectedItems: updatedSelectedItems});
    updatePositionContextState({
      participantPositions: updatedPartRecord,
      placeholderPositions: updatedPlaceRecord,
    });
    upsertList("participantPosition", updatedPartPositions);
    upsertList("placeholderPosition", updatedPlacePositions);
  }
  
  return (
    <ExpandableSection
      title="位置"
      titleIcon={ICON.textFieldsAltBlack}>
      <div className="grid grid-cols-[1fr,4fr] gap-2 items-center">
        <label>横整列</label>
        <div className="flex flex-row gap-1">
          <Button
            onClick={() => alignHorizontal("left")}
            disabled={xValues.length <= 1}>
            <img className="size-6" alt="Align Left" src={ICON.alignHorizontalLeftBlack}/>
          </Button>
          <Button
            onClick={() => alignHorizontal("centre")}
            disabled={xValues.length <= 1}>
            <img className="size-6" alt="Align Centre" src={ICON.alignHorizontalCenterBlack}/>
          </Button>
          <Button
            onClick={() => alignHorizontal("right")}
            disabled={xValues.length <= 1}>
            <img className="size-6" alt="Align Right" src={ICON.alignHorizontalRightBlack}/>
          </Button>
        </div>
        <label>縦整列</label>
        <div className="flex flex-row gap-1">
          <Button
            onClick={() => alignVertical("top")}
            disabled={yValues.length <= 1}>
            <img className="size-6" alt="Align Top" src={ICON.alignVerticalTopBlack}/>
          </Button>
          <Button
            onClick={() => alignVertical("centre")}
            disabled={yValues.length <= 1}>
            <img className="size-6" alt="Align Center" src={ICON.alignVerticalCenterBlack}/>
          </Button>
          <Button
            onClick={() => alignVertical("bottom")}
            disabled={yValues.length <= 1}>
            <img className="size-6" alt="Align Right" src={ICON.alignVerticalBottomBlack}/>
          </Button>
        </div>
        <label>均等</label>
        <div className="flex flex-row gap-1">
          <Button
            onClick={() => distribute("x")}
            disabled={selectedItems.length < 3}>
            <img className="size-6" alt="Distribute horizontally" src={ICON.horizontalDistributeBlack}/>
          </Button>
          <Button
            onClick={() => distribute("y")}
            disabled={selectedItems.length < 3}>
            <img className="size-6" alt="Distribute vertically" src={ICON.verticalDistributeBlack}/>
          </Button>
        </div>
        <label>横</label>
        <NumberTextField
          name="横"
          default={0}
          min={-(selectedFormation!.width / 2 + (selectedFormation!.sideMargin ?? DEFAULT_SIDE_MARGIN) * 2)}
          max={selectedFormation!.width / 2 + (selectedFormation!.sideMargin ?? DEFAULT_SIDE_MARGIN) * 2}
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