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
import { songList, teamMembers } from "../../data/ImaHitotabi.ts";
import { Formation, FormationType } from "../../models/Formation.ts";
import NumberTextField from "../NumberTextField.tsx";
import ColorPresetPicker from "../editorFunctions/menus/ColorPresetPicker.tsx";
import { Prop } from "../../models/Prop.ts";
import { objectColorSettings } from "../../themes/colours.ts";
import ColorSwatch from "../editorFunctions/menus/ColorSwatch.tsx";
import { Participant, ParticipantOption } from "../../models/Participant.ts";
import { CustomAutocomplete } from "../CustomAutocomplete.tsx";

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
    formations: [...props.festival?.formations || []],
    participants: [...props.resources?.participants || []],
    props: [...props.resources?.props || []],
  };

  const songs = useMemo(
    () => Object.fromEntries(Object.entries(songList).map(([key, obj]) => [key, obj.name])),
    []
  );
  const formationTypes = {"1": "ステージ", "0": "パレード"};

  const [formData, setFormData] = useState<Festival & FestivalResources>({...defaultFestival});
  const [endDateError, setEndDateError] = useState(false);
  const [editParticipantNameIndex, setEditParticipantNameIndex] = useState<number>(-1);

  const [formationNames, setFormationNames] = useState<Record<string, number>>({});
  const [participantNames, setParticipantNames] = useState<Record<string, number>>({});
  const [propNames, setPropNames] = useState<Record<string, number>>({});

  const filteredTeam = useMemo(() =>
    teamMembers
      .filter(x => !Object.keys(participantNames).includes(x.name))
      .sort((a, b) => a.name.localeCompare(b.name))
  , [participantNames]);

  useEffect(() => {
    updateFormationNames(formData.formations);
    updatePropNames(formData.props);
    updateParticipantNames(formData.participants);
    setFormData(defaultFestival);
  }, [props.festival]);

  function updateFormationNames(formations: Formation[]) {
    setFormationNames(formations.reduce((acc, f) => {
      acc[f.id] = (acc[f.id] || 0) + 1;
      return acc;
    }, {}));
  }

  function updatePropNames(props: Prop[]) {
    setPropNames(props.reduce((acc, p) => {
      acc[p.name] = (acc[p.name] || 0) + 1;
      return acc;
    }, {}));
  }

  function updateParticipantNames(participants: Participant[]) {
    setParticipantNames(participants.reduce((acc, p) => {
      acc[p.displayName] = (acc[p.displayName] || 0) + 1;
      return acc;
    }, {}));
  }

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
    const updatedFormations = [
      ...formData.formations, {
        id: "",
        type: FormationType.stage,
        songId: Object.keys(songList)[0],
        length: 10,
        width: 20,
        topMargin: 5,
        sideMargin: 5,
        bottomMargin: 5
      } as Formation
    ];
    setFormData((prev) => ({
      ...prev,
      formations: updatedFormations
    }));
    updateFormationNames(updatedFormations);
  };

  const addProp = (preset?: Prop) => {
    const updatedProps = [
      ...formData.props,
      {
        id: crypto.randomUUID(),
        name: preset?.name || "",
        length: 1,
        color: preset?.color || objectColorSettings.grey3
      }
    ];
    setFormData((prev) => ({
      ...prev,
      props: updatedProps
    }));
    updatePropNames(updatedProps);
  };

  const addParticipant = (preset?: ParticipantOption) => {
    const updatedParticipants = [
      ...formData.participants,
      {
        id: crypto.randomUUID(),
        displayName: preset?.name || "",
        festivalId: formData.id,
        memberId: preset?.id,
        isPlaceholder: false,
        placeholderNumber: Math.max(...formData.participants.map(x => x.placeholderNumber)) + 1,
      } as Participant
    ];
    setFormData((prev) => ({
      ...prev,
      participants: updatedParticipants
    }));
    updateParticipantNames(updatedParticipants);
  };

  const editFormationName = (index: number, newName: string) => {
    const updatedFormations = [...formData.formations];
    updatedFormations[index].id = newName;
    setFormData({ ...formData, formations: updatedFormations });
    updateFormationNames(updatedFormations);
  };

  const editPropName = (index: number, newName: string) => {
    const updatedProps = [...formData.props];
    updatedProps[index].name = newName;
    setFormData({ ...formData, props: updatedProps });
    updatePropNames(updatedProps);
  };

  const editParticipantName = (index: number, newName: string) => {
    const updatedParticipants = [...formData.participants];
    updatedParticipants[index].displayName = newName;
    setFormData({ ...formData, participants: updatedParticipants });
    updateParticipantNames(updatedParticipants);
  };

  const sortParticipants = () => {
    const updatedParticipants = [...formData.participants].sort((a, b) => a.displayName.localeCompare(b.displayName));
    setFormData({ ...formData, participants: updatedParticipants });
    updateParticipantNames(updatedParticipants);
  }

  const deleteFormation = (index: number) => {
    const updatedFormations = [...formData.formations];
    updatedFormations.splice(index, 1);
    setFormData({ ...formData, formations: updatedFormations });
    updateFormationNames(updatedFormations);
  };

  const deleteProp = (index: number) => {
    const updatedProps = [...formData.props];
    updatedProps.splice(index, 1);
    setFormData({ ...formData, props: updatedProps });
    updatePropNames(updatedProps);
  }

  const deleteParticipant = (index: number) => {
    setEditParticipantNameIndex(-1);
    const updatedParticipants = [...formData.participants];
    updatedParticipants.splice(index, 1);
    setFormData({ ...formData, participants: updatedParticipants });
    updateParticipantNames(updatedParticipants);
  }

  const reset = () => {
    setFormData(defaultFestival);
    updateFormationNames(defaultFestival.formations || []);
    updatePropNames(defaultFestival.props || []);
    updateParticipantNames(defaultFestival.participants || []);
    setEndDateError(false);
  };

  const save = () => {
    if (isNullOrUndefinedOrBlank(formData.startDate) || isNullOrUndefinedOrBlank(formData.startDate)) {
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
            onClick={addFormation}
          >
            <img src={ICON.addBlack} className="size-6" alt="Add formation" />
          </button>
        </div>
        <div className="grid grid-cols-[3fr,2fr,2fr,1fr,1fr,auto] items-center gap-x-2">
          <div className="font-bold">隊列名</div>
          <div className="font-bold">曲名</div>
          <div className="font-bold">タイプ</div>
          <div className="font-bold">縦(m)</div>
          <div className="font-bold">幅(m)</div>
          <div className="size-6"></div>
          { formData.formations.map((formation, index) => (
            <React.Fragment key={index}>
              <TextInput
                tall
                compact
                default={formation.id}
                onContentChange={(val) =>{ 
                  editFormationName(index, val);
                }}
                required
                hasError={formationNames[formation.id] > 1 || formation.id.match(`[~"#%&*:<>?/\\{|}]+`) !== null}
              />
              <CustomSelect defaultValue={songList[formation.songId].name} items={songs}/>
              <CustomSelect defaultValue={formation.type === FormationType.parade ? "パレード" : "ステージ"} items={formationTypes}/>
              <NumberTextField default={formation.length} min={5} max={300}/>
              <NumberTextField default={formation.width} min={5} max={50}/>
              <CustomMenu
                disabled={formData.formations.length === 1}
                trigger={<img src={ICON.deleteBlack} className={"size-6" + (formData.formations.length === 1 ? " opacity-50 cursor-not-allowed" : "")} alt="Delete formation" />}>
                <MenuItem label="削除" onClick={() => deleteFormation(index)} />
              </CustomMenu>
            </React.Fragment>
          ))}
        </div>
        <Divider/>
        <div>
          <div className="flex flex-row items-center justify-between mb-3">
            <label>参加者</label>
            <button
              disabled={teamMembers.length === 0 || editParticipantNameIndex !== -1}
              className={teamMembers.length === 0 || editParticipantNameIndex !== -1 ? "opacity-50" : ""}
              type="button"
              onClick={sortParticipants}
            >
              <img src={ICON.sortByAlphaBlack} className="size-6" alt="Sort" />
            </button>
          </div>
          <CustomAutocomplete
            placeholder="参加者の名前を入力する"
            items={filteredTeam}
            filter={(item: ParticipantOption, query: string) => item.name.includes(query)}
            getLabel={(item: ParticipantOption) => item.name}
            canAddUndefined
            selectItem={(item: ParticipantOption | string) => addParticipant(typeof item === "string" ? {
              name: item
              } as ParticipantOption : item)}/>
          <div className="flex flex-row items-center gap-2 flex-wrap overflow-auto max-h-[50svh]">
            {
              formData.participants.map((p, i) => {
                const hasError = participantNames[p.displayName] > 1 || isNullOrUndefinedOrBlank(p.displayName);
                return <React.Fragment key={i}>
                  <div
                    className={
                      "flex flex-row gap-2 border border-primary px-2 rounded-lg " +
                      (hasError ? "bg-primary-lighter placeholder:text-primary-darker" : "bg-white")
                    }>
                    { editParticipantNameIndex === i ?
                      <TextInput
                        compact
                        hasOutline={false}
                        default={p.displayName}
                        onContentChange={(val) =>{ 
                          editParticipantName(i, val);
                        }}
                        required
                        hasError={hasError}
                        /> : p.displayName
                    }
                    {
                      editParticipantNameIndex === i ?
                      <button
                        disabled={hasError}
                        className={hasError ? "opacity-50" : ""}
                        onClick={() => {setEditParticipantNameIndex(-1)}}>
                        <img className="size-6" src={ICON.checkBlack}/>
                      </button> :
                      <button onClick={() => {setEditParticipantNameIndex(i)}}><img className="size-6" src={ICON.editBlack}/></button>
                    }
                    <CustomMenu
                      trigger={<img src={ICON.deleteBlack} className="size-6" alt="Delete participant"/>}>
                      <MenuItem label="削除" onClick={() => deleteParticipant(i)} />
                    </CustomMenu>
                  </div>
                </React.Fragment>
              })
            }
          </div>
        </div>
        <Divider/>
        <div>
          <div className="flex flex-row items-center justify-between mb-3">
            <label>大道具</label>
            <button
              type="button"
              onClick={() => addProp()}
            >
              <img src={ICON.addBlack} className="size-6" alt="Add participant" />
            </button>
          </div>
          <div className="grid grid-cols-[5fr,1fr,1fr,auto] items-center gap-x-2">
            <div className="font-bold">ラベル</div>
            <div className="font-bold">長さ(m)</div>
            <div className="font-bold">色</div>
            <div className="size-6"></div>
            { formData.props.length === 0 && <span className="w-full col-span-4 mt-2 text-center">大道具はありません</span>}
            {
              formData.props.map((p, i) => 
                <React.Fragment key={i}>
                  <TextInput 
                    tall
                    compact
                    default={p.name}
                    onContentChange={(val) =>{ 
                      editPropName(i, val);
                    }}
                    required
                    hasError={propNames[p.name] > 1}
                    />
                  <NumberTextField default={p.length} step={0.1}/>
                  <CustomMenu trigger={
                    <ColorSwatch 
                      full
                      colorHexCode={p.color!.bgColour!} 
                      borderHexCode={p.color!.borderColour}
                      textHexCode={p.color!.textColour}
                      onClick={() => {}}
                      />
                  }>
                    <ColorPresetPicker selectColor={()=>{}} selectedColor={p.color}/>
                  </CustomMenu>
                  <CustomMenu
                    trigger={<img src={ICON.deleteBlack} className="size-6" alt="Delete prop" />}>
                    <MenuItem label="削除" onClick={() => deleteProp(i)} />
                  </CustomMenu>
                </React.Fragment>
              )
            }
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
            (editParticipantNameIndex !== -1) ||
            Object.keys(formationNames).some(key => isNullOrUndefinedOrBlank(key) || key.match(`[~"#%&*:<>?/\\{|}]+`)) ||
            Object.values(formationNames).some(count => count > 1) ||
            Object.keys(propNames).some(key => isNullOrUndefinedOrBlank(key)) ||
            Object.values(propNames).some(count => count > 1) ||
            Object.keys(participantNames).some(key => isNullOrUndefinedOrBlank(key)) ||
            Object.values(participantNames).some(count => count > 1)
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