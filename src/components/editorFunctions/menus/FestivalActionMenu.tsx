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
import { Dialog } from "@base-ui-components/react";
import { EditFestivalDialog } from "../../dialogs/editFestival/EditFestivalDialog.tsx";

export type FestivalActionMenuProps = {
}

export default function FestivalActionMenu(props: FestivalActionMenuProps) {
  const { selectedFestival } = useContext(UserContext);
  const {selectedFormation, updateFormationContext} = useContext(FormationContext);
  
  const [selectedNewFormation, setSelectedNewFormation] = React.useState<string | undefined>(selectedFormation?.id);

  const formations = useMemo(
    () => Object.fromEntries(selectedFestival!.formations!.map((formation) => [formation.id, formation.id])),
    [selectedFormation]
  )

  const changeFormation = () => {
    if (strEquals(selectedFormation?.id, selectedNewFormation)) return;
    
    updateFormationContext({selectedFormation: selectedFestival?.formations.find(f => strEquals(f.id, selectedNewFormation))})
  }

  return (
    <ExpandableSection
      title="祭り詳細"
      titleIcon={ICON.festivalBlack}
      canExpand
      defaultIsExpanded={false}>
      <div className="flex flex-col gap-2">
        <Dialog.Root>
          <Dialog.Trigger>
            <div className="p-2 border rounded-md border-grey-200 lg:hover:bg-grey-100">
              祭り詳細編集
            </div>
          </Dialog.Trigger>
          <EditFestivalDialog festival={selectedFestival} resources={{participants: [], props: []}}/>
        </Dialog.Root>
        <label>
          別の隊列を編集
          <div className="grid gap-2 grid-cols-[1fr,auto]">
            <CustomSelect
              setValue={(newValue) => {setSelectedNewFormation(newValue)}}
              defaultValue={selectedFormation!.id}
              items={formations}/>
            <button
              disabled={strEquals(selectedFormation?.id, selectedNewFormation)}
              onClick={() => {changeFormation()}}
              className="p-2 rounded-lg bg-grey-300 disabled:opacity-50">
              <img className="size-6" src={ICON.arrowRightAltBlack}/>
            </button>
          </div>
        </label>
        <Dialog.Root>
          <Dialog.Trigger>
            <div className="p-2 border rounded-md border-grey-200 lg:hover:bg-grey-100">
              隊列比較（無効）
            </div>
          </Dialog.Trigger>
        </Dialog.Root>
      </div>
    </ExpandableSection>
  )
}