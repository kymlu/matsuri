import React, { useContext } from "react";
import ExpandableSection from "../ExpandableSection.tsx";
import NumberTextField from "../NumberTextField.tsx";
import { UserContext } from "../../contexts/UserContext.tsx";
import { isNullOrUndefined, strEquals } from "../helpers/GlobalHelper.ts";
import { songList } from "../../data/ImaHitotabi.ts";
import { PositionContext } from "../../contexts/PositionContext.tsx";
import Button from "../Button.tsx";
import { dbController } from "../../data/DBProvider.tsx";

export type PositionMenuProps = {
  canRotate?: boolean
}

export default function PositionMenu(props: PositionMenuProps) {
  const {selectedFormation, selectedSection, selectedItem, updateState} = useContext(UserContext);
  const {participantPositions, propPositions, updatePositionState} = useContext(PositionContext)

  var order = selectedSection?.songSection.order;
  var songSections = songList.find(song => strEquals(song.id, selectedFormation?.songId))?.sections;
  var previousSectionName = "";
  var hasPrevious = !isNullOrUndefined(order) && order! > 1
  var previousX = "5";
  var previousY = "7";
  if (hasPrevious) {
    previousSectionName = songList.find(song => strEquals(song.id, selectedFormation?.songId))?.sections.find(x => x.order === (order! - 1))?.name!
  }
  var nextX = "5";
  var nextY = "7";
  var nextSectionName = "";
  var hasNext = !isNullOrUndefined(order) && order! < songSections?.map(x => x.order).filter(x => !isNullOrUndefined(order)).sort(x => -x)[0]!;
  if (hasNext) {
    nextSectionName = songList.find(song => strEquals(song.id, selectedFormation?.songId))?.sections.find(x => x.order === (order! + 1))?.name!
  }

  return (
    <ExpandableSection title="隊列" defaultIsExpanded>
      <div className="grid grid-cols-[1fr,1fr,auto,auto,auto,1fr] justify-items-center items-center align-middle gap-2">
        <span></span>
        <span className="col-span-2 text-xs text-grey-500">{previousSectionName}</span>
        <span className="font-bold">{selectedSection?.songSection.name}</span>
        <span className="col-span-2 text-xs text-grey-500">{nextSectionName}</span>
        <span className="font-bold">ヨこ</span>
        <span className="text-xs text-grey-500">{hasPrevious ? previousX : ""}</span>
        <span className="text-xs text-grey-500">{hasPrevious ? "▶︎" : ""}</span>
        <NumberTextField default={selectedItem?.x ?? 0} value={selectedItem?.x ?? 0} min={-10} max={10}/>
        <span className="text-xs text-grey-500">{hasNext ? "▶︎" : ""}</span>
        <span className="text-xs text-grey-500">{hasNext ? nextX : ""}</span>

        <span className="font-bold">タテ</span>
        <span className="text-xs text-grey-500">{hasPrevious ? previousY : ""}</span>
        <span className="text-xs text-grey-500">{hasPrevious ? "▶︎" : ""}</span>
        <NumberTextField default={selectedItem?.y ?? 0} value={selectedItem?.y ?? 0} min={0} max={20}/>
        <span className="text-xs text-grey-500">{hasNext ? "▶︎" : ""}</span>
        <span className="text-xs text-grey-500">{hasNext ? nextY : ""}</span>
      </div>
      {props.canRotate && 
      <>
        {/* TODO: add rotation */}
      </>}
      <Button onClick={() => {
        if (selectedItem !== null) {
          updatePositionState({
            participantPositions: participantPositions.filter(x => !strEquals(x.id, selectedItem.id)),
            propPositions: propPositions.filter(x => !strEquals(x.id, selectedItem.id))
          });
          dbController.removeItem("participantPosition", selectedItem.id);
          dbController.removeItem("propPosition", selectedItem.id);
          updateState({selectedItem: null});
        }
      }}>削除</Button>
    </ExpandableSection>
  )
}