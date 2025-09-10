import React, { useContext, useEffect, useState } from "react";
import ExpandableSection from "../ExpandableSection.tsx";
import { UserContext } from "../../contexts/UserContext.tsx";
import Button from "../Button.tsx";
import { dbController } from "../../data/DBProvider.tsx";
import { Participant } from "../../models/Participant.ts";
import { ParticipantPosition, PropPosition, PositionType, getFromPositionType } from "../../models/Position.ts";
import { Prop } from "../../models/Prop.ts";
import { FormationContext } from "../../contexts/FormationContext.tsx";
import { PositionContext } from "../../contexts/PositionContext.tsx";

export default function ActionMenu() {
  const {noteList, updateFormationContext} = useContext(FormationContext)
  const userContext = useContext(UserContext)
  const {selectedItems, selectedSection, selectedFormation} = useContext(UserContext)
  const {participantPositions, propPositions, updatePositionState} = useContext(PositionContext);
  const [selectedPositionTypes, setSelectedPositionTypes] = useState<Set<PositionType>>();

  useEffect(() => {
    setSelectedPositionTypes(new Set(selectedItems.map(x => x.type)));
  }, [userContext.selectedItems]);

  function deleteObject() {
    if (selectedItems.length === 0) return;

    var participants = selectedItems.filter(x => x.type === PositionType.participant).map(x => x.participant);
    var props = selectedItems.filter(x => x.type === PositionType.prop).map(x => x.prop);
    var notes = selectedItems.filter(x => x.type === PositionType.note).map(x => x.note);

    if (participants.length > 0) {
      var selectedParticipantIds = participants
        .map(x => x.participantId);
      dbController.getAll("participantPosition").then((p) => {
        Promise.all([
          dbController.removeList("participant", selectedParticipantIds),
          dbController.removeList(
            "participantPosition", 
            (p as Array<ParticipantPosition>)
              .filter(x => selectedParticipantIds.includes(x.participantId))
              .map(x => x.id)
          )
        ]).then(() => {
          Promise.all([
            dbController.getByFormationSectionId("participantPosition", selectedSection!.id),
            dbController.getByFormationId("participant", selectedFormation!.id),
          ]).then(([participantPosition, participant]) => {
            try {
              var participantPositionList = participantPosition as Array<ParticipantPosition>;
              var participantList = participant as Array<Participant>;
              updatePositionState({
                participantPositions: participantPositionList,
              });
              updateFormationContext({
                participantList: participantList
              })
              participantPositions.forEach(p => { // todo: remove, probably
                p.x2 = p.x;
                p.y2 = p.y;
              });
            } catch (e) {
              console.error('Error parsing user from localStorage:', e);
            }
          })
        });
      })
    }

    if (props.length > 0) {
      var selectedPropIds = props
        .map(x => x.propId);
      dbController.getAll("propPosition").then((p) => {
        Promise.all([
          dbController.removeList("prop", selectedPropIds),
          dbController.removeList(
            "propPosition",
            (p as Array<PropPosition>)
              .filter(x => selectedPropIds.includes(x.propId))
              .map(x => x.id)
          )
        ]).then(() => {
          Promise.all([
            dbController.getByFormationSectionId("propPosition", selectedSection!.id),
            dbController.getByFormationId("prop", selectedFormation!.id),
          ]).then(([propPosition, prop]) => {
            try {
              var propPositionList = propPosition as Array<PropPosition>;
              var propList = prop as Array<Prop>;
              updatePositionState({
                propPositions: propPositionList,
              });
              updateFormationContext({
                propList: propList
              })
              propPositions.forEach(p => { // todo: remove, probably
                p.x2 = p.x;
                p.y2 = p.y;
              });
            } catch (e) {
              console.error('Error parsing user from localStorage:', e);
            }
          })
        });
      });
    }

    if (notes.length > 0) {
      var selectedItemIds = notes
        .map(x => x.id);
      updateFormationContext({noteList: noteList.filter(x => !selectedItemIds.includes(x.id))});
      dbController.removeList("notePosition", selectedItemIds);
    }
  }
  
  return (
    <ExpandableSection title="アクション" defaultIsExpanded>
      { 
        selectedItems.length > 0 && 
        selectedPositionTypes?.size === 1 && 
        selectedPositionTypes.entries[0] === PositionType.participant && 
        <Button label="Select same category">同カテゴリー選択（無効）</Button>
      }

      <Button label="Delete item" onClick={() => {deleteObject()}}>削除</Button>
    </ExpandableSection>
  )
}