import React, { useContext, useEffect, useState } from "react";
import ExpandableSection from "../../ExpandableSection.tsx";
import { UserContext } from "../../../contexts/UserContext.tsx";
import { EntitiesContext } from "../../../contexts/EntitiesContext.tsx";
import { ParticipantPosition, PlaceholderPosition, splitPositionsByType } from "../../../models/Position.ts";
import { ICON } from "../../../lib/consts.ts";
import { removeItem, removeList, upsertList } from "../../../data/DataRepository.ts";
import CustomSelect from "../../CustomSelect.tsx";
import { PositionContext } from "../../../contexts/PositionContext.tsx";
import CustomDialog from "../../dialogs/CustomDialog.tsx";
import { Dialog } from "@base-ui-components/react";
import { strEquals } from "../../../lib/helpers/GlobalHelper.ts";
import { addItemsToRecordByKey, removeItemsByCondition, removeKeysFromRecord } from "../../../lib/helpers/GroupingHelper.ts";
import ActionDialog from "../../dialogs/ActionDialog.tsx";

export default function PlaceholderReplaceMenu() {
  const {selectedSection, selectedItems, updateState} = useContext(UserContext);
  const {participantList, placeholderList, updateEntitiesContext} = useContext(EntitiesContext);
  const {participantPositions, placeholderPositions, updatePositionContextState} = useContext(PositionContext);
  const [availableParticipants, setAvailableParticipants] = React.useState<Record<string, string>>({});
  const [selectedParticipant, setSelectedParticipant] = useState<string>("");
  const [selectedPlaceholder, setSelectedPlaceholder] = useState<PlaceholderPosition | undefined>(undefined);

  useEffect(() => {
    const record: Record<string, string> = {};
    var participants = participantPositions[selectedSection?.id ?? ""]?.map((pos: ParticipantPosition) => pos.participantId) ?? [];

    Object.entries(participantList).sort((a, b) => a[1].displayName.localeCompare(b[1].displayName)).forEach(([id, participant]) => {
      if (!participants.includes(id)) {
        record[id] = participant.displayName;
      }
    });

    setAvailableParticipants(record);
  }, [participantList, participantPositions]);

  useEffect(() => {
    setSelectedPlaceholder(splitPositionsByType(selectedItems).placeholders[0]);
  }, [selectedItems]);

  var exchangeButtonEnabled = selectedParticipant !== "" && selectedParticipant != null && selectedPlaceholder != null;

  const exchange = async () => {
    if (selectedPlaceholder == null) return;
    
    // get the key from available participants
    var participantId = Object.entries(availableParticipants).find(([key, value]) => value === selectedParticipant)?.[0];
    var placeholderId = selectedPlaceholder.placeholderId;
    var posToReplace: PlaceholderPosition[] = [];
    Object.entries(placeholderPositions).forEach(([sectionId, positions]) => {
      posToReplace.push(...positions.filter((pos) => strEquals(pos.placeholderId, placeholderId)));
    });

    var newPositions = posToReplace.map(position => ({
      id: crypto.randomUUID(),
      formationSectionId: position.formationSectionId,
      x: position.x,
      y: position.y,
      participantId: participantId,
      isSelected: false,
    } as ParticipantPosition));

    // update db
    upsertList("participantPosition", newPositions);
    removeList("placeholderPosition", posToReplace.map(pos => pos.id));
    removeItem("placeholder", selectedPlaceholder.placeholderId);

    // update local state
    var updatedParticipantPositionList = addItemsToRecordByKey(participantPositions, newPositions, (item) => item.formationSectionId);
    var updatedPlaceholderPositionList = removeItemsByCondition(placeholderPositions, (item) => strEquals(item.placeholderId, placeholderId));
    var updatedPlaceholderList = removeKeysFromRecord(placeholderList, new Set(placeholderId));
    
    updatePositionContextState({
      participantPositions: updatedParticipantPositionList,
      placeholderPositions: updatedPlaceholderPositionList,
    });

    updateEntitiesContext({
      placeholderList: updatedPlaceholderList,
    });

    updateState({
      selectedItems: [],
    })
  };

  return (
    <ExpandableSection title="切り替え" titleIcon={ICON.textFieldsAltBlack}>
      <div className="flex flex-row gap-2 my-2">
        <CustomSelect
          items={availableParticipants}
          defaultValue={selectedParticipant}
          setValue={(newParticipant) => setSelectedParticipant(newParticipant)}
          disabled={Object.values(availableParticipants).length === 0}/>
        <div className="flex-1">
          <Dialog.Root modal>
            <Dialog.Trigger>
              <div className={"px-3 py-1.5 border rounded-xl text-nowrap bg-primary text-white" + (!exchangeButtonEnabled ? " cursor-not-allowed opacity-50" : "")}>
                置換
              </div>
            </Dialog.Trigger>
            <ActionDialog
              title="置換確認"
              onConfirm={exchange}>
              {selectedParticipant} に置換しますか？
            </ActionDialog>
          </Dialog.Root>
        </div>
      </div>
    </ExpandableSection>
  )
}