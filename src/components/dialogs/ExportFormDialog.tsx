import React, { useContext, useEffect } from "react";
import CustomDialog from "./CustomDialog.tsx";
import { Dialog } from "@base-ui-components/react";
import CustomSelect from "../CustomSelect.tsx";
import { EntitiesContext } from "../../contexts/EntitiesContext.tsx";
import { VisualSettingsContext } from "../../contexts/VisualSettingsContext.tsx";
import { strEquals } from "../../lib/helpers/GlobalHelper.ts";

export type ExportFormDialogProps = {
  onConfirm?: (followingId?: string) => void
}

export function ExportFormDialog(props: ExportFormDialogProps) {
  const {participantList, placeholderList} = useContext(EntitiesContext);
  const {followingId} = useContext(VisualSettingsContext);
  const [participantRecord, setParticipantRecord] = React.useState<Record<string, string>>({});
  const [following, setFollowing] = React.useState<string>("未設定");

  useEffect(() => {
    const record: Record<string, string> = {};
    record["none"] = "未設定";
    Object.entries(participantList) // TODO: filter those in the formation 
      .sort((a, b) => a[1].displayName.localeCompare(b[1].displayName))
      .forEach(([id, participant]) => {
        record[id] = participant.displayName;
    });
    Object.entries(placeholderList)
      .sort((a, b) => a[1].displayName.localeCompare(b[1].displayName))
      .forEach(([id, placeholder]) => {
        record[id] = placeholder.displayName;
    });
    setParticipantRecord(record);
  }, [participantList, placeholderList]);

  useEffect(() => {
    if (followingId) {
      if (participantList[followingId]) {
        setFollowing(participantList[followingId]?.displayName ?? "未設定");
      } else {
        setFollowing(placeholderList[followingId]?.displayName ?? "未設定");
      }
    } else {
      setFollowing("未設定");
    }
  }, [followingId]);

  return (
    <CustomDialog
      hasX
      title="PDF出力設定">
      <div className="flex flex-col gap-2">
        <div>
          <label>参加者追従</label>
          <CustomSelect
            items={participantRecord}
            defaultValue={following}
            setValue={(newValue) => {
              setFollowing(newValue);
            }}/>
        </div>
        <Dialog.Close>
          <div 
            className="px-3 py-1.5 bg-primary border rounded-xl text-white lg:hover:bg-primary-light font-bold"
            onClick={() => {
              props.onConfirm?.(strEquals(following, "未設定") ? undefined : Object.entries(participantRecord).find(([id, name]) => strEquals(name, following))?.[0]);
            }}>
            エクスポート
          </div>
        </Dialog.Close>
        </div>
    </CustomDialog>
  )
}