import React, { useImperativeHandle, useMemo, useState } from "react";
import { Formation, FormationType } from "../../../models/Formation.ts";
import { songList } from "../../../data/ImaHitotabi.ts";
import { ICON } from "../../../lib/consts.ts";
import CustomMenu, { MenuItem } from "../../CustomMenu.tsx";
import CustomSelect from "../../CustomSelect.tsx";
import NumberTextField from "../../NumberTextField.tsx";
import TextInput from "../../TextInput.tsx";
import { isNullOrUndefinedOrBlank, strEquals } from "../../../lib/helpers/GlobalHelper.ts";
import { FormationSection } from "../../../models/FormationSection.ts";
import { EditState } from "./EditFestivalDialog.tsx";

export type EditFestivalFormationsProps = {
  formations: Formation[],
  ref?: React.Ref<any>,
  setError?: (hasError: boolean) => void
}

export type FormationWithEditState = Formation & EditState;

export function EditFestivalFormations(props: EditFestivalFormationsProps) {
  const [formations, setFormations] = useState<FormationWithEditState[]>([...props.formations.map(x => ({...x, isNew: false, isDeleted: false}))]);
  const formationTypes = useMemo(() => ({"1": "ステージ", "0": "パレード"}), []);
  const [formationNames, setFormationNames] = useState<Record<string, number>>({});

  useImperativeHandle(props.ref, () => ({
    getData: () => {
      const newSections = addFormationSections(formations.filter(x => x.isNew && !x.isDeleted));
      return {formations, newSections};
    },
    resetData: () => {
      const updatedFormations = [...props.formations.map(x => ({...x, isNew: false, isDeleted: false}))];
      setFormations(updatedFormations);
      updateFormationNames(updatedFormations);
    }
  }));

  const updateFormationNames = (formations: FormationWithEditState[]) => {
    const updated: Record<string, number> = formations
      .filter(x => !x.isDeleted)
      .reduce<Record<string, number>>((acc, f) => {
        acc[f.name] = (acc[f.name] || 0) + 1;
        return acc;
      }, {});
    setFormationNames(updated);
    props.setError?.(
      formations.length === 0 ||
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
        id: crypto.randomUUID(),
        name: "",
        type: FormationType.stage,
        songId: Object.keys(songList)[0],
        length: 10,
        width: 20,
        topMargin: 2,
        sideMargin: 5,
        bottomMargin: 5,
        isNew: true,
        isDeleted: false,
      } as FormationWithEditState
    ];
    setFormations(updatedFormations);
    updateFormationNames(updatedFormations);
  };

  const addFormationSections = (formationList: Formation[]): FormationSection[] => {
    return formationList.map(formation => {
      var song = songList[formation.songId];
      if (song == null) {
        return [{
          id: crypto.randomUUID(),
          formationId: formation.id,
          displayName: "新しいセクション",
          order: 1,
        } as FormationSection];
      } else {
        return songList[formation.songId]?.sections
          ?.map(songSection => {
            return {
            id: crypto.randomUUID(),
            formationId: formation.id,
            songSectionId: songSection.id,
            displayName: songSection.name,
            order: songSection.order,
          } as FormationSection;
        });
      }
    }).flat();
  }

  const editFormationName = (index: number, newName: string) => {
    const updatedFormations = [...formations];
    updatedFormations[index].name = newName;
    setFormations(updatedFormations);
    updateFormationNames(updatedFormations);
  };

  const editFormationSong = (index: number, newSong: string) => {
    const updatedFormations = [...formations];
    updatedFormations[index].songId = Object.entries(songs).find(([key, name]) => strEquals(name, newSong))![0];
    setFormations(updatedFormations);
    updateFormationNames(updatedFormations);
  };
  
  const editFormationType = (index: number, newType: string) => {
    const updatedFormations = [...formations];
    updatedFormations[index].type = +Object.entries(formationTypes).find(([key, name]) => strEquals(name, newType))![0];
    setFormations(updatedFormations);
    updateFormationNames(updatedFormations);
  };

  const editFormationSize = (index: number, field: "length" | "width", newValue: number) => {
    const updatedFormations = [...formations];
    updatedFormations[index][field] = newValue;
    setFormations(updatedFormations);
  };

  const deleteFormation = (index: number) => { // edit and delete by id instead of index
    const updatedFormations = [...formations];
    updatedFormations[index].isDeleted = true;
    setFormations(updatedFormations);
    updateFormationNames(updatedFormations);
  };

  return <>
    <div className="flex flex-row items-center justify-between mb-3">
      <label className="font-extrabold">隊列</label>
      <button
        type="button"
        onClick={addFormation}
      >
        <img src={ICON.addBlack} className="size-6" alt="Add formation" />
      </button>
    </div>
    <div className="grid grid-cols-[3fr,2fr,2fr,1fr,1fr,auto] items-center gap-2">
      <div className="flex flex-row items-center gap-2 font-bold"><img className="size-5" src={ICON.textFieldsAltBlack}/>隊列名</div>
      <div className="flex flex-row items-center gap-2 font-bold"><img className="size-5" src={ICON.musicNoteBlack}/>曲名</div>
      <div className="flex flex-row items-center gap-2 font-bold"><img className="size-5" src={ICON.categoryBlack}/>タイプ</div>
      <div className="flex flex-row items-center gap-2 font-bold"><img className="size-5" src={ICON.heightBlack}/>縦(m)</div>
      <div className="flex flex-row items-center gap-2 font-bold"><img className="size-5" src={ICON.arrowRangeBlack}/>幅(m)</div>
      <div className="size-6"></div>
      { formations.map((formation, index) =>
        {
          return <React.Fragment key={index}>
            { formation.isDeleted && <></>}
            { !formation.isDeleted && 
              <>
                <TextInput
                  tall
                  compact
                  default={formation.name}
                  onContentChange={(val) =>{ 
                    editFormationName(index, val);
                  }}
                  required
                  hasError={formationNames[formation.name] > 1 || formation.name.match(`[~"#%&*:<>?/\\{|}]+`) !== null}
                />
                <CustomSelect
                  disabled={!formation.isNew}
                  setValue={(newValue) => {editFormationSong(index, newValue)}}
                  defaultValue={songList[formation.songId].name}
                  items={songs}/>
                <CustomSelect
                  disabled={!formation.isNew}
                  setValue={(newValue) => {editFormationType(index, newValue)}}
                  defaultValue={formation.type === FormationType.parade ? "パレード" : "ステージ"}
                  items={formationTypes}/>
                <NumberTextField
                  onChange={(newValue) => {if (newValue) editFormationSize(index, "length", newValue)}}
                  default={formation.length}
                  step={0.25} buttonStep={1}
                  min={5} max={300}/>
                <NumberTextField
                  onChange={(newValue) => {if (newValue) editFormationSize(index, "width", newValue)}}
                  default={formation.width}
                  step={0.25} buttonStep={1}
                  min={5} max={50}/>
                <CustomMenu
                  disabled={formations.length === 1}
                  trigger={<img src={ICON.deleteBlack} className={"size-6" + (formations.filter(x => !x.isDeleted).length === 1 ? " opacity-50 cursor-not-allowed" : "")} alt="Delete formation" />}>
                  <MenuItem label="削除" onClick={() => deleteFormation(index)} />
                  {/* TODO: have an are you sure verification dialog */}
                </CustomMenu>
              </>
            }
          </React.Fragment>
        }
      )}
    </div>
  </>
}
