import React, { useContext } from "react";
import ExpandableSection from "../ExpandableSection.tsx";
import { UserContext } from "../../contexts/UserContext.tsx";
import { FormationSongSection } from "../../models/FormationSection.ts";
import { isNullOrUndefined, strEquals } from "../helpers/GlobalHelper.ts";
import { PositionContext } from "../../contexts/PositionContext.tsx";
import SectionOptionButton from "../SectionOptionButton.tsx";
import { dbController } from "../../data/DBProvider.tsx";
import { ParticipantPosition, PropPosition } from "../../models/Position.ts";

export default function SectionPicker () {
  const {currentSections, selectedSection, updateState, marginPositions} = useContext(UserContext);
  const {participantPositions, propPositions, updatePositionState} = useContext(PositionContext);

  function selectSection(section: FormationSongSection) {
    participantPositions.filter(x => x.isSelected).forEach(x => x.isSelected = false);
    propPositions.filter(x => x.isSelected).forEach(x => x.isSelected = false);
    updateState({selectedSection: section, selectedItem: null});
  }

  function copyPositions(
    sourceSection: FormationSongSection,
    targetSections: FormationSongSection | FormationSongSection[]
  ) {
    if (isNullOrUndefined(selectedSection)) return;
  
    // Ensure targetSections is always an array
    const targetSectionsArray = Array.isArray(targetSections) ? targetSections : [targetSections];
  
    // Copy participant positions
    const copiedParticipantPositions = participantPositions
      .filter(position => strEquals(position.formationSceneId, sourceSection.id))
      .flatMap(position =>
        targetSectionsArray.map(section => ({
          ...position,
          formationSceneId: section.id,
          id: crypto.randomUUID(),
        } as ParticipantPosition))
      );
  
    // Copy prop positions
    const copiedPropPositions = propPositions
      .filter(position => strEquals(position.formationSceneId, sourceSection.id))
      .flatMap(position =>
        targetSectionsArray.map(section => ({
          ...position,
          formationSceneId: section.id,
          id: crypto.randomUUID(),
        } as PropPosition))
      );
  
    const targetSectionIds = targetSectionsArray.map(x => x.id);

    dbController.removeList(
      "participantPosition",
      participantPositions
        .filter(position => targetSectionIds.includes(position.formationSceneId))
        .map(x => x.id)
    );

    dbController.removeList(
      "propPosition",
      propPositions
        .filter(position => targetSectionIds.includes(position.formationSceneId))
        .map(x => x.id)
    );
  
    // Upsert new positions
    dbController.upsertList("participantPosition", copiedParticipantPositions);
    dbController.upsertList("propPosition", copiedPropPositions);
  
    // Update state
    dbController.getAll("participantPosition").then(participantPosition => {
      try {
        const participantPositionList = participantPosition as Array<ParticipantPosition>;
        updatePositionState({
          participantPositions: participantPositionList,
        });
  
        dbController.getAll("propPosition").then(propPosition => {
          const propPositionList = propPosition as Array<PropPosition>;
          updatePositionState({
            propPositions: propPositionList,
          });
        });
      } catch (error) {
        console.error("Error updating positions:", error);
      }
    });
  }
  
  function copyToCurrent(sourceSection: FormationSongSection) {
    if (isNullOrUndefined(selectedSection)) return;
    copyPositions(sourceSection, selectedSection!);
  }
  
  function copyToFuture(sourceSection: FormationSongSection) {
    if (isNullOrUndefined(selectedSection)) return;
  
    const futureSections = currentSections.filter(
      section => section.songSection.order > selectedSection!.songSection.order
    );
  
    copyPositions(sourceSection, futureSections);
  }

  function createDerivitive(sourceSection: FormationSongSection) {
    console.log("Not yet implemented: derivatives")
  }
  
  function resetPosition(sourceSection: FormationSongSection) {
    participantPositions
      .filter(position => strEquals(position.formationSceneId, sourceSection.id))
      .forEach((position, index) => {
        position.x = marginPositions.participants[index][0];
        position.x2 = marginPositions.participants[index][0];
        position.y = marginPositions.participants[index][1];
        position.y2 = marginPositions.participants[index][1];
      });

    propPositions
      .filter(position => strEquals(position.formationSceneId, sourceSection.id))
      .forEach((position, index) => {
        position.x = marginPositions.props[index][0];
        position.x2 = marginPositions.props[index][0];
        position.y = marginPositions.props[index][1];
        position.y2 = marginPositions.props[index][1];
      });

    Promise.all([
      dbController.upsertList("participantPosition", 
        participantPositions
        .filter(position => strEquals(position.formationSceneId, sourceSection.id))),
      dbController.upsertList("propPosition",
        propPositions
        .filter(position => strEquals(position.formationSceneId, sourceSection.id)))
    ]).then(() => {
      Promise.all([
        dbController.getAll("participantPosition"),
        dbController.getAll("propPosition"),
      ]).then(([participantPosition, propPosition]) => {
        try {
          var participantPositionList = participantPosition as Array<ParticipantPosition>;
          var propPositionList = propPosition as Array<PropPosition>;
          updatePositionState({
            participantPositions: participantPositionList,
            propPositions: propPositionList
          });
          participantPositions.forEach(p => { // todo: remove, probably
            p.x2 = p.x;
            p.y2 = p.y;
          });
          propPositions.forEach(p => { // todo: remove, probably
            p.x2 = p.x;
            p.y2 = p.y;
          });
        } catch (e) {
          console.error('Error parsing user from localStorage:', e);
        }
      })
    });

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