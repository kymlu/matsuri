import React, { useContext } from "react";
import ExpandableSection from "../ExpandableSection.tsx";
import { UserContext } from "../../contexts/UserContext.tsx";
import { FormationSongSection } from "../../models/FormationSection.ts";
import { isNullOrUndefined, strEquals } from "../helpers/GlobalHelper.ts";
import { PositionContext } from "../../contexts/PositionContext.tsx";
import SectionOptionButton from "../SectionOptionButton.tsx";
import { dbController } from "../../data/DBProvider.tsx";
import { ParticipantPosition } from "../../models/Position.ts";

export default function SectionPicker () {
  const {selectedFormation, sections, currentSections, selectedSection, updateState, marginPositions} = useContext(UserContext);
  const {participantPositions, propPositions, updatePositionState} = useContext(PositionContext);

  function selectSection(section: FormationSongSection) {
    participantPositions.filter(x => x.isSelected).forEach(x => x.isSelected = false);
    propPositions.filter(x => x.isSelected).forEach(x => x.isSelected = false);
    updateState({selectedSection: section, selectedItem: null});
  }

  // TODO: apply to props
  function copyToCurrent(sourceSection: FormationSongSection) {
    if (isNullOrUndefined(selectedSection)) return;
    
    var copiedPositions = participantPositions
      .filter(position => strEquals(position.formationSceneId, sourceSection.id))
      .map(position => {
        return {
          ...position,
          formationSceneId: selectedSection!.id,
          id: crypto.randomUUID()
        } as ParticipantPosition});
    
    dbController.removeList("participantPosition",
      participantPositions
        .filter(position => strEquals(position.formationSceneId, selectedSection!.id)));

    dbController.upsertList("participantPosition", copiedPositions);
    dbController.getAll("participantPosition").then((participantPosition) => {
      try {
        var participantPositionList = participantPosition as Array<ParticipantPosition>;
        updatePositionState({
          participantPositions: participantPositionList,
        });
        participantPositions.forEach(p => { // todo: remove, probably
          p.x2 = p.x;
          p.y2 = p.y;
        });
      } catch (e) {
        console.error('Error parsing user from localStorage:', e);
      }});
    // var resetCanvas = new CustomEvent(CUSTOM_EVENT.resetCanvas.toString());
    // window.dispatchEvent(resetCanvas);
    // todo: currently needs to refresh page, figure out how to force canvas to reset
  }

  // TODO: apply to props
  function copyToFuture(sourceSection: FormationSongSection) {
    if (isNullOrUndefined(selectedSection)) return;
    
    const futureSections = currentSections.filter(section => section.songSection.order > selectedSection!.songSection.order);

    var copiedPositions = participantPositions
      .filter(position => strEquals(position.formationSceneId, sourceSection.id))
      .flatMap(position => futureSections.map(section => {
        return {
          ...position,
          formationSceneId: section.id,
          id: crypto.randomUUID()
        } as ParticipantPosition}));

    const futureSectionIds = new Set(futureSections.map(x => x.id));
    
    dbController.removeList("participantPosition",
      participantPositions
        .filter(position => futureSectionIds.has(position.formationSceneId)));

    dbController.upsertList("participantPosition", copiedPositions).then(() => {
      dbController.getAll("participantPosition").then((participantPosition) => {
        try {
          var participantPositionList = participantPosition as Array<ParticipantPosition>;
          updatePositionState({
            participantPositions: participantPositionList,
          });
          participantPositions.forEach(p => { // todo: remove, probably
            p.x2 = p.x;
            p.y2 = p.y;
          });
        } catch (e) {
          console.error('Error parsing user from localStorage:', e);
        }});
    });
    // var resetCanvas = new CustomEvent(CUSTOM_EVENT.resetCanvas.toString());
    // window.dispatchEvent(resetCanvas);
    // todo: currently needs to refresh page, figure out how to force canvas to reset
  }
  
  function createDerivitive(sourceSection: FormationSongSection) {
    console.log("Not yet implemented: derivatives")
  }
  
  // TODO: apply to props
  function resetPosition(sourceSection: FormationSongSection) {
    participantPositions
      .filter(position => strEquals(position.formationSceneId, sourceSection.id))
      .forEach((position, index) => {
        position.x = marginPositions[index][0];
        position.x2 = marginPositions[index][0];
        position.y = marginPositions[index][1];
        position.y2 = marginPositions[index][1];
        dbController.upsertItem("participantPosition", position);
      });
    dbController.upsertList("participantPosition", 
      participantPositions
        .filter(position => strEquals(position.formationSceneId, sourceSection.id)));

    dbController.getAll("participantPosition").then((participantPosition) => {
      try {
        var participantPositionList = participantPosition as Array<ParticipantPosition>;
        updatePositionState({
          participantPositions: participantPositionList,
        });
        participantPositions.forEach(p => { // todo: remove, probably
          p.x2 = p.x;
          p.y2 = p.y;
        });
      } catch (e) {
        console.error('Error parsing user from localStorage:', e);
      }});

    // todo: currently needs to refresh page, figure out how to force canvas to reset
  }

  return (
    <ExpandableSection title="セクション" defaultIsExpanded>
      <div className="flex flex-col">
        {currentSections
          .sort((a, b) => a.songSection.order - b.songSection.order)
          .map((section, index, array) => 
            <SectionOptionButton 
              key={section.id} 
              text={section.songSection.name}
              isSelected={strEquals(selectedSection?.id, section.id)}
              isBottom={index === array.length - 1}
              onClick={() => selectSection(section) }
              onCopyToCurrent={() => copyToCurrent(section) }
              onCopyToFuture={() => copyToFuture(section)}
              onCreateDerivitive={() => createDerivitive(section) }
              onResetPosition={() => resetPosition(section) }/>
        )}
      </div>
    </ExpandableSection>
  )
}