import React, { useContext } from "react";
import ExpandableSection from "../ExpandableSection.tsx";
import NumberTextField from "../NumberTextField.tsx";
import { UserContext } from "../../contexts/UserContext.tsx";
import { isNullOrUndefined, strEquals } from "../helpers/GlobalHelper.ts";
import { songList } from "../../data/ImaHitotabi.ts";

export default function PositionMenu() {
  const {selectedFormation, sections, selectedSection} = useContext(UserContext);
  var order = selectedSection?.songSection?.order;
  var songSections = songList.find(song => strEquals(song.id, selectedFormation?.songId))?.sections;
  var previousSectionName = "-";
  if (!isNullOrUndefined(order) && order! > 0) {
    previousSectionName = songList.find(song => strEquals(song.id, selectedFormation?.songId))?.sections.find(x => x.order === (order! - 1))?.name!
  }
  var nextSectionName = "-";
  if (!isNullOrUndefined(order) && order! < songSections?.map(x => x.order).filter(x => !isNullOrUndefined(order)).sort(x => -x)[0]!) {
    nextSectionName = songList.find(song => strEquals(song.id, selectedFormation?.songId))?.sections.find(x => x.order === (order! + 1))?.name!
  }

  return (
    <ExpandableSection title="隊列">
        <div className="grid grid-cols-[1fr,1fr,auto,auto,auto,1fr] justify-items-center items-center align-middle gap-2">
          <span></span>
          <span className="col-span-2 text-sm text-grey-500">{previousSectionName}</span>
          <span className="font-bold">{selectedSection?.songSection?.name}</span>
          <span className="col-span-2 text-sm text-grey-500">{nextSectionName}</span>
          <span className="font-bold">ヨこ</span>
          <span className="text-sm text-grey-500">9.5</span>
          <span className="text-grey-500">▶︎</span>
          <NumberTextField default={1} min={-10} max={10}/>
          <span className="text-grey-500">▶︎</span>
          <span className="text-sm text-grey-500">6</span>
          <span className="font-bold">タテ</span>
          <span className="text-sm text-grey-500">10</span>
          <span className="text-grey-500">▶︎</span>
          <NumberTextField default={1} min={0} max={20}/>
          <span className="text-grey-500">▶︎</span>
          <span className="text-sm text-grey-500">8</span>
          </div>
    </ExpandableSection>
  )
}