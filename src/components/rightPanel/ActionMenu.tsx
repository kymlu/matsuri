import React, { useContext } from "react";
import ExpandableSection from "../ExpandableSection.tsx";
import { UserContext } from "../../contexts/UserContext.tsx";
import Button from "../Button.tsx";
import { dbController } from "../../data/DBProvider.tsx";
import { Participant } from "../../models/Participant.ts";
import { isParticipant, ParticipantPosition, isProp, PropPosition, isNote } from "../../models/Position.ts";
import { Prop } from "../../models/Prop.ts";
import { strEquals } from "../helpers/GlobalHelper.ts";
import { FormationContext } from "../../contexts/FormationContext.tsx";
import { PositionContext } from "../../contexts/PositionContext.tsx";

export default function ActionMenu() {
  const {noteList, updateFormationContext} = useContext(FormationContext)
  const {selectedItem} = useContext(UserContext)
  const {participantPositions, propPositions, updatePositionState} = useContext(PositionContext);

  function deleteObject() {
    if (isParticipant(selectedItem!)) {
      Promise.all([
        dbController.removeItem("participant", selectedItem?.participantId),
        dbController.removeList(
          "participantPosition", 
          participantPositions
            .filter(x => strEquals(x.participantId, selectedItem.participantId))
            .map(x => x.id)
        )
      ]).then(() => {
        Promise.all([
          dbController.getAll("participantPosition"),
          dbController.getAll("participant"),
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
            participantPositionList.forEach(p => { // todo: remove, probably
              p.x2 = p.x;
              p.y2 = p.y;
            });
          } catch (e) {
            console.error('Error parsing user from localStorage:', e);
          }
        })
      });
    } else if (isProp(selectedItem!)) {
      Promise.all([
        dbController.removeItem("prop", selectedItem.propId),
        dbController.removeList(
          "propPosition",
          propPositions
            .filter(x => strEquals(x.propId, selectedItem.propId))
            .map(x => x.id)
        )
      ]).then(() => {
        Promise.all([
          dbController.getAll("propPosition"),
          dbController.getAll("prop"),
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
    } else if (isNote(selectedItem!)) {
      updateFormationContext({noteList: noteList.filter(x => !strEquals(x.id, selectedItem.id))});
      dbController.removeItem("notePosition", selectedItem.id);
    }
  }
  
  return (
    <ExpandableSection title="アクション" defaultIsExpanded>
      <Button>同カテゴリー選択（無効）</Button>
      <Button onClick={() => {deleteObject()}}>削除（無効）</Button>
    </ExpandableSection>
  )
}