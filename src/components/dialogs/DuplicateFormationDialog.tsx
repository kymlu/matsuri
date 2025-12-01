import React, { useContext, useEffect } from "react";
import { UserContext } from "../../contexts/UserContext.tsx";
import { FormationContext } from "../../contexts/FormationContext.tsx";
import { strEquals } from "../../lib/helpers/GlobalHelper.ts";
import CustomDialog from "./CustomDialog.tsx";
import Button from "../Button.tsx";
import { Formation } from "../../models/Formation.ts";
import { GetAllForFormation } from "../../data/DataController.ts";
import { removeList, upsertItem, upsertList } from "../../data/DataRepository.ts";
import { PositionContext } from "../../contexts/PositionContext.tsx";
import { groupByKey, indexByKey } from "../../lib/helpers/GroupingHelper.ts";
import { EntitiesContext } from "../../contexts/EntitiesContext.tsx";
import { Dialog } from "@base-ui-components/react";
import { Festival } from "../../models/Festival.ts";

export function DuplicateFormationDialog() {
  const { selectedFestival, currentSections, updateState } = React.useContext(UserContext);
  const { selectedFormation, updateFormationContext } = React.useContext(FormationContext);
  const { placeholderList, updateEntitiesContext } = useContext(EntitiesContext);
  const { participantPositions, propPositions, notePositions, arrowPositions, placeholderPositions, updatePositionContextState } = React.useContext(PositionContext);
  const [ formationToDuplicate, setFormationToDuplicate ] = React.useState<Formation | null>(null);
  const [isConfirming, setIsConfirming] = React.useState<boolean>(false);
  const [ otherFormations, setOtherFormations ] = React.useState<Formation[]>([]);

  const confirmDuplication = (formationToDuplicate: Formation) => {
    setFormationToDuplicate(formationToDuplicate);
    setIsConfirming(true);
  }
    
  const duplicateFormation = async () => {
    if (selectedFestival == null || selectedFormation == null || formationToDuplicate == null) return;

    const oldSections = currentSections.map(x => x.id);
    const oldParticipantPositionIds = Object.values(participantPositions).flat().map(x => x.id);
    const oldPropPositionIds = Object.values(propPositions).flat().map(x => x.id);
    const oldNotePositionIds = Object.values(notePositions).flat().map(x => x.id);
    const oldArrowPositionIds = Object.values(arrowPositions).flat().map(x => x.id);
    const oldPlaceholderPositionIds = Object.values(placeholderPositions).flat().map(x => x.id);
    const oldPlaceholders = Object.values(placeholderList).filter(p => strEquals(p.formationId, selectedFormation.id)).map(p => p.id);

    await Promise.all([
      removeList("formationSection", oldSections),
      removeList("participantPosition", oldParticipantPositionIds),
      removeList("propPosition", oldPropPositionIds),
      removeList("notePosition", oldNotePositionIds),
      removeList("arrowPosition", oldArrowPositionIds),
      removeList("placeholderPosition", oldPlaceholderPositionIds),
      removeList("placeholder", oldPlaceholders),
    ]).then(async () => {
      await GetAllForFormation(selectedFestival.id, formationToDuplicate.id, 
        async (formationSections, participants, props, placeholders, participantPositions, propPositions, notePositions, arrowPositions, placeholderPositions) => {
          // overwrite the current formation's data with the duplicated formation's data
          const newFormation: Formation = {
            ...formationToDuplicate,
            id: selectedFormation.id,
            name: selectedFormation.name,
          };

          // update the festival's formation list
          const updatedFestival = {
            ...selectedFestival,
            formations: [...selectedFestival.formations.filter(f => !strEquals(f.id, selectedFormation.id)), newFormation],
          } as Festival;

          // overwrite each part of the selected formation
          const mapFormationIds: Record<string, string> = {};
          formationSections.forEach(section => {
            mapFormationIds[section.id] = crypto.randomUUID();
          });
          formationSections.forEach(section => {
            section.id = mapFormationIds[section.id];
            section.formationId = selectedFormation.id
          });
          const mapPlaceholderIds: Record<string, string> = {};
          placeholders.forEach(placeholder => {
            mapPlaceholderIds[placeholder.id] = crypto.randomUUID();
          });
          placeholders.forEach(placeholder => {
            placeholder.id = mapPlaceholderIds[placeholder.id];
            placeholder.formationId = selectedFormation.id;
          });
          participantPositions.forEach(pos => {
            pos.formationSectionId = mapFormationIds[pos.formationSectionId];
            pos.id = crypto.randomUUID();
          });
          propPositions.forEach(pos => {
            pos.formationSectionId = mapFormationIds[pos.formationSectionId];
            pos.id = crypto.randomUUID();
          });
          notePositions.forEach(pos => {
            pos.formationSectionId = mapFormationIds[pos.formationSectionId];
            pos.id = crypto.randomUUID();
          });
          arrowPositions.forEach(pos => {
            pos.formationSectionId = mapFormationIds[pos.formationSectionId];
            pos.id = crypto.randomUUID();
          });
          placeholderPositions.forEach(pos => {
            pos.formationSectionId = mapFormationIds[pos.formationSectionId];
            pos.id = crypto.randomUUID();
            pos.placeholderId = mapPlaceholderIds[pos.placeholderId];
          });

          // upsert all data
          await Promise.all([
            upsertItem("festival", updatedFestival),
            upsertList("formationSection", formationSections),
            upsertList("placeholder", placeholders),
            upsertList("participantPosition", participantPositions),
            upsertList("propPosition", propPositions),
            upsertList("notePosition", notePositions),
            upsertList("arrowPosition", arrowPositions),
            upsertList("placeholderPosition", placeholderPositions),
          ]);

          // update local state
          updateState({
            selectedFestival: updatedFestival,
            currentSections: formationSections,
            selectedSection: formationSections.sort((a, b) => a.order - b.order)[0],
          });
          updateFormationContext({
            selectedFormation: newFormation,
          });
          updateEntitiesContext({
            placeholderList: indexByKey(placeholders, "id"),
          });
          updatePositionContextState({
            participantPositions: groupByKey(participantPositions, "formationSectionId"),
            propPositions: groupByKey(propPositions, "formationSectionId"),
            notePositions: groupByKey(notePositions, "formationSectionId"),
            arrowPositions: groupByKey(arrowPositions, "formationSectionId"),
            placeholderPositions: groupByKey(placeholderPositions, "formationSectionId"),
          });
        }
      )
    })
  };

  useEffect(() => {
    setOtherFormations(
      selectedFestival?.formations
        .filter(f => !strEquals(selectedFormation?.id, f.id))
        .sort((a, b) => {
          const isSameSongA = strEquals(a.songId, selectedFormation?.songId) ? 1 : 0;
          const isSameSongb = strEquals(b.songId, selectedFormation?.songId) ? 1 : 0
          if (isSameSongA === isSameSongb) {
            return a.name.localeCompare(b.name);
          }
          
          return isSameSongb - isSameSongA;
        }) ?? []
    );
    setIsConfirming(false);
  }, [selectedFestival, selectedFormation]);

  return (
    <CustomDialog
      title="隊列を複製"
      hasX>
      {
        !isConfirming &&
        <div className="flex flex-col justify-center">
          {otherFormations.length === 0 && <div>この祭りは他の隊列がない。</div>}
          <div className="grid grid-cols-[1fr,1fr] items-center gap-2">
            { 
              otherFormations.map(formation =>
                <React.Fragment key={formation.id}>
                  <span className={strEquals(selectedFormation?.songId, formation.songId) ? "" : "opacity-50"}>{formation.name}</span>
                  <Button
                    disabled={!strEquals(selectedFormation?.songId, formation.songId)}
                    onClick={() => {confirmDuplication(formation)}}>
                      {strEquals(selectedFormation?.songId, formation.songId) ? "この隊列を複製する" : "複製できません"}
                    </Button>
                </React.Fragment>
              )
            }
          </div>
        </div>
      }
      {
        isConfirming && 
        <div className="flex flex-col items-center justify-center gap-4">
          本当に<b>「{formationToDuplicate?.name}」</b>の隊列データで上書きしますか？<br/>
          この操作は元に戻せません。
          <div className="flex flex-row gap-1">
            <Button onClick={() => setIsConfirming(false)}>キャンセル</Button>
            <Dialog.Close onClick={() => {duplicateFormation(); setIsConfirming(false);}}>
              <div className="px-3 py-1.5 border rounded-xl text-nowrap bg-primary text-white">
                上書きする
              </div>
            </Dialog.Close>
          </div>
        </div>
      }
    </CustomDialog>
  )
}