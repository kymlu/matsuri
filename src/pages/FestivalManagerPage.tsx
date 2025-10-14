import React, { useContext, useEffect } from 'react';

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
import { getResourceFile, readResourcesAndFormation } from '../lib/helpers/JsonReaderHelper.ts';
import { FestivalResources, FormationDetails } from '../models/ImportExportModel.ts';
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
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [hasError, setHasError] = React.useState<boolean>(false);
  const [editingFestival, setEditingFestival] = React.useState<boolean>(false);
  const [selectedFestival, setSelectedFestival] = React.useState<Festival | null>(null);
  const [selectedFestivalResources, setSelectedFestivalResources] = React.useState<FestivalResources | null>(null);
  let navigate = useNavigate();

  useEffect(() => {
    updateAppModeContext({userType: "admin"});
  }, []);

  function editFestival(festival: Festival) {
    getResourceFile(festival, (msg) => {
      setErrorMessage(`${festival.id}のリソースの取得に失敗しました。\n ${msg}`);
      setHasError(true);
    }, async (resources) => {
      setSelectedFestivalResources(resources);
      setSelectedFestival(festival);
      setEditingFestival(true);
    });
  }

  function goToEditor(festival: Festival, formation: Formation) {
    readResourcesAndFormation(
      festival,
      formation.id, 
      (msg) => {
        setErrorMessage(`${formation.id}の隊列データの取得に失敗しました。\n ${msg}`);
        setHasError(true);
      },
      (festival, resources, formationDetails) => {
        setDataBeforeNavigation(festival, formation, resources, formationDetails);
        navigate("/formation");
      });
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
              setSelectedFestival(null);
              setEditingFestival(true);
            }}>
            <div className='flex flex-row items-center justify-center gap-2 p-1'>
              隊列をアップロード
              <img
                src={ICON.uploadBlack}
                className="size-6"
                alt="Upload a file"/>
            </div>
          </Button>
        {
          allFestivals.festivals.sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime())
            .map((festival, index) =>
            <button
              key={festival.id}
              className='flex flex-row items-center justify-between p-5 border-2 rounded-lg lg:hover:bg-grey-100 border-primary'
              onClick={() => goToEditor(festival, festival.formations[0])}>
              <div className='text-start'>
                <h2 className='text-xl font-bold text-primary'>{festival.name}</h2>
                <span className='text-sm text-grey-400'>{formatJapaneseDateRange(festival.startDate, festival.endDate)}</span>
                <div className='font-normal'>{festival.note}</div>
              </div>
              <img src={ICON.chevronForwardBlack}/>
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