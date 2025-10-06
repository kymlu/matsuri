import React, { useCallback, useEffect, useState } from "react";
import CustomDialog from "./CustomDialog.tsx";
import TextInput from "../TextInput.tsx";
import { Festival } from "../../models/Festival.ts";
import DateInput from "../DateInput.tsx";
import Button from "../Button.tsx";
import { isNullOrUndefinedOrBlank } from "../../lib/helpers/GlobalHelper.ts";
import { ICON } from "../../lib/consts.ts";
import CustomMenu, { MenuItem } from "../CustomMenu.tsx";

export type EditFestivalDialogProps = {
  festival: Festival | null,
  onSave?: (festival: Festival) => void
}

export function EditFestivalDialog(props: EditFestivalDialogProps) {
  const defaultFestival: Festival = {
    id: props.festival?.id || "",
    name: props.festival?.name || "",
    startDate: props.festival?.startDate || "",
    endDate: props.festival?.endDate || "",
    note: props.festival?.note || "",
    formations: props.festival?.formations || []
  };

  const [formData, setFormData] = useState<Festival>(defaultFestival);
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

  const addFormation = () => {
    setFormData((prev) => ({
      ...prev,
      formations: [...prev.formations, "隊列名未設定"]
    }));
  };

  const editFormationName = (index: number, newName: string) => {
    const updatedFormations = [...formData.formations];
    updatedFormations[index] = newName;
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
    <CustomDialog hasX title="祭り情報編集">
      <form className="gap-6 landscape:grid landscape:w-[50svw] landscape:grid-cols-2">
        <div>
          <label>
            ID
            <TextInput
              name="id"
              disabled
              default={formData.id}
              placeholder="IDを入力"
              required
              onContentChange={(val) => onFieldChange("id", val)}
            />
          </label>
          <label>
            祭り名
            <TextInput
              name="name"
              default={formData.name}
              placeholder="祭りの名前を入力"
              required
              onContentChange={(val) => onFieldChange("name", val)}
              showLength
            />
          </label>
          <label>
            開始日
            <DateInput
              required
              name="startDate"
              default={formData.startDate}
              onDateChange={(date) => onFieldChange("startDate", date)}
            />
          </label>
          <label>
            終了日（任意）
            <DateInput
              name="endDate"
              default={formData.endDate}
              onDateChange={(date) => onFieldChange("endDate", date)}
              hasError={endDateError}
            />
          </label>
          <label>
            メモ（任意）
            <TextInput
              name="note"
              default={formData.note}
              placeholder="メモを入力"
              onContentChange={(val) => onFieldChange("note", val)}
              maxLength={100}
              showLength
            />
          </label>
        </div>

        <div>
          <div className="flex flex-row items-center justify-between mb-3">
            <label>隊列</label>
            <button type="button" onClick={addFormation}>
              <img src={ICON.addBlack} className="size-6" alt="Add formation" />
            </button>
          </div>
          <div className="pl-2 grid grid-cols-[1fr,auto,auto] gap-y-3 gap-x-1">
            {formData.formations.map((formation, index) => (
              <React.Fragment key={index}>
                {
                  editFormationNameIndex === index ? (
                    <TextInput
                      default={formation}
                      onContentChange={(val) =>{ setNewFormationName(val)}}
                      required
                      compact
                    />
                  ) : (
                    <span onClick={() => setEditFormationNameIndex(index)} className="cursor-pointer">
                      {formation}
                    </span>
                  )
                }
                {
                  editFormationNameIndex === index ? 
                  <>
                    <button
                      className="disabled:opacity-50"
                      disabled={isNullOrUndefinedOrBlank(newFormationName)}
                      type="button"
                      onClick={() => {
                        setEditFormationNameIndex(-1);
                        editFormationName(index, newFormationName);
                      }}>
                      <img src={ICON.checkBlack} className="size-6" alt="Confirm formation name" />
                    </button> 
                    <button
                      type="button"
                      onClick={() => {
                        setEditFormationNameIndex(-1);
                      }}>
                      <img src={ICON.clearBlack} className="size-6" alt="Close formation name editor" />
                    </button> 
                  </>
                  :
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        setEditFormationNameIndex(index);
                        setNewFormationName(formation);
                      }}>
                      <img src={ICON.editBlack} className="size-6" alt="Edit formation name" />
                    </button>
                    <CustomMenu
                      trigger={<img src={ICON.deleteBlack} className="size-6" alt="Delete formation" />}>
                      <MenuItem label="削除" onClick={() => deleteFormation(index)} />
                    </CustomMenu>
                  </>
                }
              </React.Fragment>
            ))}
          </div>
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