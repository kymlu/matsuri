import React, { useCallback, useEffect, useMemo, useState } from "react";
import CustomDialog from "./CustomDialog.tsx";
import TextInput from "../TextInput.tsx";
import { Festival } from "../../models/Festival.ts";
import DateInput from "../DateInput.tsx";
import Button from "../Button.tsx";
import { isNullOrUndefinedOrBlank } from "../../lib/helpers/GlobalHelper.ts";
import { ICON } from "../../lib/consts.ts";
import CustomMenu, { MenuItem } from "../CustomMenu.tsx";
import Divider from "../Divider.tsx";
import { FestivalResources } from "../../models/ImportExportModel.ts";
import CustomSelect from "../CustomSelect.tsx";
import { songList } from "../../data/ImaHitotabi.ts";
import { FormationType } from "../../models/Formation.ts";
import NumberTextField from "../NumberTextField.tsx";

export type EditFestivalDialogProps = {
  festival: Festival | null,
  resources: FestivalResources | null,
  onSave?: (festival: Festival) => void
}

export function EditFestivalDialog(props: EditFestivalDialogProps) {
  const defaultFestival: Festival & FestivalResources = {
    id: props.festival?.id || "",
    name: props.festival?.name || "",
    startDate: props.festival?.startDate || "",
    endDate: props.festival?.endDate || "",
    note: props.festival?.note || "",
    formations: props.festival?.formations || [],
    participants: props.resources?.participants || [],
    props: props.resources?.props || [],
  };

  const songs = useMemo(
    () => Object.fromEntries(Object.entries(songList).map(([key, obj]) => [key, obj.name])),
    []
  );
  const formationTypes = {"1": "ステージ", "0": "パレード"};

  const [formData, setFormData] = useState<Festival & FestivalResources>(defaultFestival);
  const [endDateError, setEndDateError] = useState(false);
  const [editFormationNameIndex, setEditFormationNameIndex] = useState<number>(-1);
  const [newFormationName, setNewFormationName] = useState<string>("");

  useEffect(() => {
    setFormData(defaultFestival);
  }, [props.festival]);

  const onFieldChange = useCallback(
    (field: keyof Festival, value: any) => {
      setFormData((prev) => ({
        ...prev,
        [field]: value
      }));

      if (field === "startDate" || field === "endDate") {
        const start = field === "startDate" ? value : formData.startDate;
        const end = field === "endDate" ? value : formData.endDate;
        setEndDateError(
          start && end && new Date(start).getTime() > new Date(end).getTime()
        );
      }
    },
    [formData.startDate, formData.endDate]
  );

  // const addFormation = () => {
  //   setFormData((prev) => ({
  //     ...prev,
  //     formations: [...prev.formations, "隊列名未設定"]
  //   }));
  // };

  const editFormationName = (index: number, newName: string) => {
    const updatedFormations = [...formData.formations];
    // updatedFormations[index] = newName;
    setFormData({ ...formData, formations: updatedFormations });
  };

  const deleteFormation = (index: number) => {
    const updatedFormations = [...formData.formations];
    updatedFormations.splice(index, 1);
    setFormData({ ...formData, formations: updatedFormations });
  };

  const reset = () => {
    setFormData(defaultFestival);
    setEndDateError(false);
  };

  const save = () => {
    if (isNullOrUndefinedOrBlank(formData.name) || isNullOrUndefinedOrBlank(formData.startDate)) {
      alert("祭り名と開始日は必須です。");
      return;
    }

    props.onSave?.({
      ...formData,
      note: formData.note || undefined
    });
  };

  return (
    <CustomDialog full hasX title="祭り情報編集">
      <form>
        <label>
          ID
          <TextInput
            name="id"
            disabled
            tall
            default={formData.id}
            placeholder="IDを入力"
            required
            onContentChange={(val) => onFieldChange("id", val)}
          />
        </label>
        <label>
          祭り名
          <TextInput
            tall
            name="name"
            default={formData.name}
            placeholder="祭りの名前を入力"
            required
            onContentChange={(val) => onFieldChange("name", val)}
            showLength
          />
        </label>
        <div className="flex flex-row portrait:flex-col gap-x-3">
          <label>
            開始日
            <DateInput
              required
              tall
              name="startDate"
              default={formData.startDate}
              onDateChange={(date) => onFieldChange("startDate", date)}
            />
          </label>
          <label>
            終了日（任意）
            <DateInput
              name="endDate"
              tall
              default={formData.endDate}
              onDateChange={(date) => onFieldChange("endDate", date)}
              hasError={endDateError}
            />
          </label>
        </div>
        <label>
          メモ（任意）
          <TextInput
            tall
            name="note"
            default={formData.note}
            placeholder="メモを入力"
            onContentChange={(val) => onFieldChange("note", val)}
            maxLength={100}
            showLength
          />
        </label>

        <Divider/>

        <div className="flex flex-row items-center justify-between mb-3">
          <label>隊列</label>
          <button
            type="button"
            // onClick={addFormation}
          >
            <img src={ICON.addBlack} className="size-6" alt="Add formation" />
          </button>
        </div>
        <div className="grid grid-cols-[3fr,2fr,2fr,1fr,1fr,auto] items-center gap-2">
          <div className="font-bold">隊列名</div>
          <div className="font-bold">曲名</div>
          <div className="font-bold">タイプ</div>
          <div className="font-bold">縦(m)</div>
          <div className="font-bold">幅(m)</div>
          <div></div>
          {formData.formations.map((formation, index) => (
            <React.Fragment key={index}>
              <TextInput
                tall
                compact
                default={formation.id}
                onContentChange={(val) =>{ setNewFormationName(val)}}
                required
              />
              <CustomSelect defaultValue={songList[formation.songId].name} items={songs}/>
              <CustomSelect defaultValue={formation.type === FormationType.parade ? "パレード" : "ステージ"} items={formationTypes}/>
              <NumberTextField default={formation.length}/>
              <NumberTextField default={formation.width}/>
              <CustomMenu
                trigger={<img src={ICON.deleteBlack} className="size-6" alt="Delete formation" />}>
                <MenuItem label="削除" onClick={() => deleteFormation(index)} />
              </CustomMenu>
            </React.Fragment>
          ))}
        </div>
        <Divider/>
        <div>
          <label>参加者</label>
          {
            formData.participants.map((p, i) => (
              <div key={i}>{p.displayName}</div>
            ))
          }
        </div>
        <Divider/>
        <div>
          <label>大道具</label>
          {
            formData.props.map((p, i) => (
              <div key={i}>{p.name}</div>
            ))
          }
        </div>
      </form>

      <div className="flex justify-end gap-2">
        <Button onClick={reset} label="Reset">リセット</Button>
        <Button
          disabled={
            isNullOrUndefinedOrBlank(formData.name) ||
            isNullOrUndefinedOrBlank(formData.startDate) ||
            endDateError || 
            (editFormationNameIndex !== -1)
          }
          primary
          onClick={save}
          label="Save festival data"
        >
          保存
        </Button>
      </div>
    </CustomDialog>
  )
}