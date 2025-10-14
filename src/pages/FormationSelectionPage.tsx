import { Dialog } from "@base-ui-components/react";
import React, { useContext, useEffect } from "react";
import Button from "../components/Button.tsx";
import CustomDialog from "../components/dialogs/CustomDialog.tsx";
import Divider from "../components/Divider.tsx";
import { AppModeContext } from "../contexts/AppModeContext.tsx";
import { LAST_UPDATED } from "../lib/consts.ts";
import { formatJapaneseDateRange } from "../lib/helpers/DateHelper.ts";
import { Festival } from "../models/Festival";
import allFestivals from "../data/allFestivals.json"
import { useNavigate } from 'react-router-dom';
import { FestivalMeta, FestivalResources, FormationDetails } from "../models/ImportExportModel.ts";
import { CategoryContext } from "../contexts/CategoryContext.tsx";
import { EntitiesContext } from "../contexts/EntitiesContext.tsx";
import { FormationContext } from "../contexts/FormationContext.tsx";
import { PositionContext } from "../contexts/PositionContext.tsx";
import { UserContext } from "../contexts/UserContext.tsx";
import { VisualSettingsContext } from "../contexts/VisualSettingsContext.tsx";
import { songList } from "../data/ImaHitotabi.ts";
import { groupByKey, indexByKey } from "../lib/helpers/GroupingHelper.ts";
import { getFestivalMetaFile, readResourcesAndFormation } from "../lib/helpers/JsonReaderHelper.ts";
import { Formation } from "../models/Formation.ts";
import { useState } from "react";

export default function FormationSelectionPage() {
  const {updateAppModeContext} = useContext(AppModeContext);

  const {updateState} = useContext(UserContext);
  const {updateCategoryContext} = useContext(CategoryContext);
  const {updateVisualSettingsContext} = useContext(VisualSettingsContext);
  const {updateFormationContext} = useContext(FormationContext);
  const {updatePositionContextState} = useContext(PositionContext);
  const {updateEntitiesContext} = useContext(EntitiesContext);

  const [festivalData, setFestivalData] = useState<Festival[]>([]);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [hasError, setHasError] = React.useState<boolean>(false);
  let navigate = useNavigate();
  
  useEffect(() => {
    updateAppModeContext({userType: "general", appMode: "view"});
    getFestivalData();
  }, []);

  async function getFestivalData() {
    Promise.all((
      allFestivals.festivals as FestivalMeta[])
        .map((x => getFestivalMetaFile(x, () => {}, async () => {})
    ))).then((festivals: (Festival | undefined)[]) => {
      setFestivalData(festivals.filter(x => x !== undefined));
    });
  }

  async function selectFormation(festival: Festival, formation: Formation) {
    readResourcesAndFormation(
      festival.id,
      formation.id,
      (msg => {
        setErrorMessage(`${formation.id}の隊列データの取得に失敗しました。\n ${msg}`);
        setHasError(true);
      }),
      (resources, formationDetails) => {
        setDataBeforeNavigation(festival, formation, resources, formationDetails);
        navigate("/formation");
      });
  }

  function setDataBeforeNavigation(festival: Festival, formation: Formation, resources: FestivalResources, formationDetails: FormationDetails) {
    updateVisualSettingsContext({followingId: null});

    updateFormationContext({selectedFormation: formation ?? undefined});

    updateCategoryContext({categories: songList[formation!.songId].categories});

    var groupedParticipantPositions = groupByKey(formationDetails.participants, "formationSectionId")
    var groupedPropPositions = groupByKey(formationDetails.props, "formationSectionId")
    updateEntitiesContext({
      participantList: indexByKey(resources.participants, "id"),
      propList: indexByKey(resources.props, "id")
    });

    updatePositionContextState({
      participantPositions: groupedParticipantPositions,
      propPositions: groupedPropPositions,
      notePositions: groupByKey(formationDetails.notes, "formationSectionId"),
      arrowPositions: groupByKey(formationDetails.arrows, "formationSectionId"),
    });

    const currentSections = formationDetails.sections.sort((a,b) => a.order - b.order);

    updateState({
      isLoading: false,
      previousSectionId: null,
      currentSections: currentSections,
      selectedSection: currentSections[0],
      selectedFestival: festival,
      selectedItems: [],
      showNotes: true,
    });
  }

  return (
    <div className='flex flex-col w-full gap-2 mt-10 portrait:my-10 landscape:max-w-[65svw] landscape:mx-auto'>
      <div className='flex items-center justify-between mx-4'>
        <h1 className='text-2xl font-bold'>祭り</h1>
        <button
          className='p-2 text-sm rounded-md text-grey-400 hover:bg-grey-100'
          onClick={() => navigate("/manager")}>
          振り班はこちらへ
        </button>
      </div>
      <Divider primary/>
      <div className='flex flex-col gap-4 mx-5'>
        {
          festivalData.sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime())
            .map((festival) =>
            <div key={festival.id}>
              <div className='flex flex-row items-end gap-2'>
                <h2 className='text-xl font-bold text-primary'>{festival.name}</h2>
                <span className='text-sm text-grey-400'>{formatJapaneseDateRange(festival.startDate, festival.endDate)}</span>
              </div>
              <div>{festival.note}</div>
              {
                festival.formations && festival.formations.length > 0 && 
                <div className='flex flex-row flex-wrap gap-3 mt-2'>
                  {festival.formations
                    .map(formation => 
                      <Button 
                        label={`Select ${formation}`}
                        key={formation.id}
                        onClick={() => {
                          selectFormation(festival, formation)}
                        }>
                        {formation.id}
                      </Button>
                  )}
                </div>
              }
            </div>
          )
        }
      </div>
      <span className='fixed opacity-50 bottom-2 left-2'>{LAST_UPDATED}</span>
      <Dialog.Root dismissible open={hasError} onOpenChange={() => setHasError(false)} onOpenChangeComplete={() => (!hasError) && setErrorMessage(null)}>
        {errorMessage && <CustomDialog title="エラー">
          {errorMessage}
          <div className='flex justify-end mt-4'>
            <Button label="閉じる" onClick={() => setHasError(false)}>閉じる</Button>
          </div>
        </CustomDialog>}
      </Dialog.Root>
    </div>
  )
}