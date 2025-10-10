import React, { useImperativeHandle, useMemo, useState } from "react";
import { Formation, FormationType } from "../../../models/Formation.ts";
import { songList } from "../../../data/ImaHitotabi.ts";
import { ICON } from "../../../lib/consts.ts";
import CustomMenu, { MenuItem } from "../../CustomMenu.tsx";
import CustomSelect from "../../CustomSelect.tsx";
import NumberTextField from "../../NumberTextField.tsx";
import TextInput from "../../TextInput.tsx";
import { isNullOrUndefinedOrBlank } from "../../../lib/helpers/GlobalHelper.ts";

export type EditFestivalFormationsProps = {
  formations: Formation[],
  ref?: React.Ref<any>,
  setError?: (hasError: boolean) => void
}

export function EditFestivalFormations(props: EditFestivalFormationsProps) {
  const [formations, setFormations] = useState<Formation[]>([...props.formations]);
  const formationTypes = useMemo(() => ({"1": "ステージ", "0": "パレード"}), []);
  const [formationNames, setFormationNames] = useState<Record<string, number>>({});

  useImperativeHandle(props.ref, () => ({
    getData: () => {return formations;},
    resetData: () => {
      setFormations([...props.formations]);
      updateFormationNames(props.formations); // todo: update all the fields
    }
  }));

  const updateFormationNames = (formations: Formation[]) => {
    const updated: Record<string, number> = formations.reduce((acc, f) => {
      acc[f.id] = (acc[f.id] || 0) + 1;
      return acc;
    }, {});
    setFormationNames(updated);
    props.setError?.(
      Object.keys(updated).some(key => isNullOrUndefinedOrBlank(key) || key.match(`[~"#%&*:<>?/\\{|}]+`) !== null) ||
      Object.values(updated).some(count => count > 1)
    );
  };
  
  const songs = useMemo(
    () => Object.fromEntries(Object.entries(songList).map(([key, obj]) => [key, obj.name])),
    []
  );

  const addFormation = () => {
    const updatedFormations = [
      ...formations, {
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
    setFormations(updatedFormations);
    updateFormationNames(updatedFormations);
  };

  const editFormationName = (index: number, newName: string) => { // todo: fix (passed by reference??)
    const updatedFormations = [...formations];
    updatedFormations[index].id = newName;
    setFormations(updatedFormations);
    updateFormationNames(updatedFormations);
  };

  const deleteFormation = (index: number) => {
    const updatedFormations = [...formations];
    updatedFormations.splice(index, 1);
    setFormations(updatedFormations);
    updateFormationNames(updatedFormations);
  };

  return <>
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
      { formations.map((formation, index) => (
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
          <CustomSelect
            setValue={(newValue) => {}}
            defaultValue={songList[formation.songId].name}
            items={songs}/>
          <CustomSelect
            setValue={(newValue) => {}}
            defaultValue={formation.type === FormationType.parade ? "パレード" : "ステージ"}
            items={formationTypes}/>
          <NumberTextField
            onChange={() => {}}
            default={formation.length}
            min={5} max={300}/>
          <NumberTextField
            onChange={() => {}}
            default={formation.width}
            min={5} max={50}/>
          <CustomMenu
            disabled={formations.length === 1}
            trigger={<img src={ICON.deleteBlack} className={"size-6" + (formations.length === 1 ? " opacity-50 cursor-not-allowed" : "")} alt="Delete formation" />}>
            <MenuItem label="削除" onClick={() => deleteFormation(index)} />
          </CustomMenu>
        </React.Fragment>
      ))}
    </div>
  </>
}