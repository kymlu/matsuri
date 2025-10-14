import React, { useContext, useEffect, useMemo, useState } from 'react';

import '../index.css';
import Button from '../components/Button.tsx';
import { Festival } from '../models/Festival.ts';
import { UserContext } from '../contexts/UserContext.tsx';
import { useNavigate } from 'react-router-dom';
import { Formation } from '../models/Formation.ts';
import Divider from '../components/Divider.tsx';
import { DEFAULT_GRID_SIZE, ICON, LAST_UPDATED } from '../lib/consts.ts';
import { AppModeContext } from '../contexts/AppModeContext.tsx';
import { FormationContext } from '../contexts/FormationContext.tsx';
import { VisualSettingsContext } from '../contexts/VisualSettingsContext.tsx';
import allFestivals from "../data/allFestivals.json"
import { formatJapaneseDateRange } from '../lib/helpers/DateHelper.ts';
import CustomDialog from '../components/dialogs/CustomDialog.tsx';
import { Dialog } from '@base-ui-components/react/dialog';
import { EditFestivalDialog } from '../components/dialogs/editFestival/EditFestivalDialog.tsx';
import { getFestivalMetaFile, readResourcesAndFormation } from '../lib/helpers/JsonReaderHelper.ts';
import { FestivalMeta, FestivalResources, FormationDetails, ImportExportModel } from '../models/ImportExportModel.ts';
import { songList } from '../data/ImaHitotabi.ts';
import { groupByKey, indexByKey } from '../lib/helpers/GroupingHelper.ts';
import { CategoryContext } from '../contexts/CategoryContext.tsx';
import { EntitiesContext } from '../contexts/EntitiesContext.tsx';
import { PositionContext } from '../contexts/PositionContext.tsx';

export default function FestivalManagerPage () {
  const {updateState} = useContext(UserContext);
  const {updateCategoryContext} = useContext(CategoryContext);
  const {updateVisualSettingsContext} = useContext(VisualSettingsContext);
  const {updateFormationContext} = useContext(FormationContext);
  const {updatePositionContextState} = useContext(PositionContext);
  const {updateEntitiesContext} = useContext(EntitiesContext);

  const {appMode, updateAppModeContext} = useContext(AppModeContext);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [hasError, setHasError] = useState<boolean>(false);
  const [editingFestival, setEditingFestival] = useState<boolean>(false);
  const [selectedFestival, setSelectedFestival] = useState<Festival | null>(null);
  const [selectedFestivalResources, setSelectedFestivalResources] = useState<FestivalResources | null>(null);
  const [festivalData, setFestivalData] = useState<Festival[]>([]);
  let navigate = useNavigate();
  const uploadFileElement = document.getElementById("uploadFileInput");

  useEffect(() => {
    updateAppModeContext({userType: "admin"});
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

  function goToEditor(festival: Festival, formation: Formation) {
    readResourcesAndFormation(
      festival.id,
      formation.id,
      (msg) => {
        setErrorMessage(`${formation.id}の隊列データの取得に失敗しました。\n ${msg}`);
        setHasError(true);
      },
      (resources, formationDetails) => {
        setDataBeforeNavigation(festival, formation, resources, formationDetails);
        navigate("/formation");
      });
  }

  function onFileLoad(fileContents: ImportExportModel) {

  }

  function setDataBeforeNavigation(festival: Festival, formation: Formation, resources: FestivalResources, formationDetails: FormationDetails) {
    updateVisualSettingsContext({followingId: null, gridSize: DEFAULT_GRID_SIZE});

    updateFormationContext({selectedFormation: formation});

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

    updateAppModeContext({userType: "admin", appMode: "edit"});
  }
  
  function onClick(festival: Festival, selectedFormation: Formation) {
    updateState({
        selectedFestival: festival,
        selectedItems: [],
        showNotes: true,
    });
    updateFormationContext({selectedFormation: selectedFormation});    
    updateVisualSettingsContext({gridSize: DEFAULT_GRID_SIZE});
    
    navigate("/formation");
  }

  return (
    <div className='flex flex-col w-full gap-2 mt-10 portrait:my-10 landscape:max-w-[65svw] landscape:mx-auto'>
      <div className='flex items-center justify-between mx-4'>
        <h1 className='text-2xl font-bold'>隊列編集</h1>
        <button
          className='p-2 text-sm rounded-md text-grey-400 hover:bg-grey-100'
          onClick={() => navigate("..")}>
          一般の方はこちらへ
        </button>
      </div>
      <Divider primary/>
      <div className='grid grid-cols-2 gap-4 mx-5'>
        <Button 
            onClick={() => {
              setSelectedFestival(null);
              setEditingFestival(true);
            }}>
            <div className='flex flex-row items-center justify-center gap-2'>
              祭りを追加
              <img
                src={ICON.addBlack}
                className="size-6"
                alt="Add new festival"/>
            </div>
          </Button>
          <Button 
            onClick={() => {
              if(uploadFileElement){
                uploadFileElement.click();
              }
            }}>
            <div className='flex flex-row items-center justify-center gap-2 p-1'>
              隊列をアップロード
              <img
                src={ICON.uploadBlack}
                className="size-6"
                alt="Upload a file"/>
            </div>
          </Button>
          <input className='hidden' type="file" id="uploadFileInput" //accept=".mtr"
            onChange={(event) => {
              console.log(event.target.files);
              if (event.target.files) {
                var file = event.target.files?.[0];
                const reader = new FileReader();
    
                reader.addEventListener(
                  "load",
                  (event) => {
                    if (event.target?.result) {
                      const uploadResult = JSON.parse(event.target.result.toString());
                      console.log(uploadResult);
                    }
                  },
                  false,
                );
          
                reader.readAsText(file);
              }
              }
            }/>
        {
          festivalData.sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime())
            .map((festival) =>
            <button
              key={festival.id}
              className='flex flex-row items-center justify-between p-5 border-2 rounded-lg lg:hover:bg-grey-100 border-primary'
              onClick={() => goToEditor(festival, festival.formations[0])}>
              <div className='text-start'>
                <h2 className='text-xl font-bold text-primary'>{festival.name}</h2>
                <span className='text-sm text-grey-400'>{formatJapaneseDateRange(festival.startDate, festival.endDate)}</span>
                <div className='font-normal'>{festival.note}</div>
              </div>
              <img className='size-8' src={ICON.chevronForwardBlack}/>
            </button>
          )
        }
      </div>
      <span className='fixed opacity-50 bottom-2 left-2'>{LAST_UPDATED}</span>
      <Dialog.Root
        open={editingFestival}
        onOpenChange={() => setEditingFestival(false)}
        onOpenChangeComplete={() => () => {
          if (!hasError){
            setSelectedFestival(null);
            setEditingFestival(false);
            setSelectedFestivalResources(null);
          }}}>
        {
          editingFestival &&
          <EditFestivalDialog festival={selectedFestival} resources={selectedFestivalResources}/>
        }
      </Dialog.Root>
      
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