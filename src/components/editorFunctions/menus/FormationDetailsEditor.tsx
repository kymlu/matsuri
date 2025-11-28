import React, { useContext } from "react";
import ExpandableSection from "../../ExpandableSection.tsx";
import { UserContext } from "../../../contexts/UserContext.tsx";
import { ICON } from "../../../lib/consts.ts";
import { FormationContext } from "../../../contexts/FormationContext.tsx";
import { songList } from "../../../data/ImaHitotabi.ts";
import { Formation, FormationType } from "../../../models/Formation.ts";
import CustomSelect from "../../CustomSelect.tsx";
import NumberTextField from "../../NumberTextField.tsx";
import { useMemo } from "react";
import { strEquals } from "../../../lib/helpers/GlobalHelper.ts";
import Button from "../../Button.tsx";

export type FormationDetailsEditorProps = {
  updateSong?: (songId: string) => void,
  updateType?: (type: FormationType) => void,
  updateSize?: (size: number, type: "width" | "length") => void,
  formation: Formation,
}

export default function FormationDetailsEditor(props: FormationDetailsEditorProps) {
  const { selectedFestival } = useContext(UserContext);
  const {selectedFormation} = useContext(FormationContext);
  const [isLocked, setIsLocked] = React.useState(true);

  const songs = useMemo(
    () => Object.fromEntries(Object.entries(songList).map(([key, obj]) => [key, obj.name])),
    []
  );
  
  const formationTypes = useMemo(() => ({"1": "ステージ", "0": "パレード"}), []);
  
  const editFormationSong = (newSong: string) => { // todo: fix (passed by reference??)
    const songId = Object.entries(songs).find(([key, name]) => strEquals(name, newSong))![0];
    props.updateSong?.(songId);
  };
  
  const editFormationType = (newType: string) => { // todo: fix (passed by reference??)
    const type = +Object.entries(formationTypes).find(([key, name]) => strEquals(name, newType))![0];
    props.updateType?.(type);
  };

  const editFormationSize = (field: "length" | "width", newValue: number) => {
    props.updateSize?.(newValue, field);
  }

  return (
    <ExpandableSection
      title="隊列詳細"
      titleIcon={ICON.curtainsBlack}
      canExpand
      defaultIsExpanded={false}>
      <div className="flex flex-col gap-2">
        <div>
          <Button full onClick={() => setIsLocked(prev => !prev)}>
            <div className="flex flex-row justify-center gap-2">
            {
              isLocked ? "アンロック" : "ロック"
            }
            {
              <img className="size-6" src={isLocked ? ICON.lockOpenBlack : ICON.lockBlack}/>
            }
            </div>
          </Button>
        </div>
        <label>
          曲
          <CustomSelect
            disabled={isLocked}
            setValue={(newValue) => {editFormationSong(newValue)}} // TODO: enable no selection for free creation
            defaultValue={songList[props.formation.songId].name}
            items={songs}/>
        </label>
        <label>
          タイプ
          <CustomSelect
            disabled={isLocked}
            setValue={(newValue) => {editFormationType(newValue)}}
            defaultValue={props.formation.type === FormationType.parade ? "パレード" : "ステージ"}
            items={formationTypes}/>
        </label>
        <label>
          縦
          <NumberTextField
            disabled={isLocked}
            onChange={(newValue) => {if (newValue) editFormationSize("length", newValue)}}
            default={props.formation.length}
            min={5} max={300}/>
        </label>
        <label>
          横
          <NumberTextField
            disabled={isLocked}
            onChange={(newValue) => {if (newValue) editFormationSize("width", newValue)}}
            default={props.formation.width}
            min={5} max={50}/>
        </label>
        <div>
          <Button full disabled={isLocked} onClick={() => {}}>
            適応
          </Button>
        </div>
      </div>
    </ExpandableSection>
  )
}