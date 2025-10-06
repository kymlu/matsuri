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
import { EditFestivalDialog } from '../components/dialogs/EditFestivalDialog.tsx';
import ExpandableSection from '../components/ExpandableSection.tsx';
import { readFormationFromFiles } from '../lib/helpers/JsonReaderHelper.ts';
import { FestivalResources, FormationDetails } from '../models/ImportExportModel.ts';
import { songList } from '../data/ImaHitotabi.ts';
import { groupByKey, indexByKey } from '../lib/helpers/GroupingHelper.ts';
import { CategoryContext } from '../contexts/CategoryContext.tsx';
import { EntitiesContext } from '../contexts/EntitiesContext.tsx';
import { PositionContext } from '../contexts/PositionContext.tsx';
import { strEquals } from '../lib/helpers/GlobalHelper.ts';

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
  let navigate = useNavigate();

  useEffect(() => {
    updateAppModeContext({userType: "admin"});
  }, []);

  function editFestival(festival: Festival) {
    setEditingFestival(true);
    setSelectedFestival(festival);
  }

  function goToEditor(festival: Festival, formation: Formation) {
    readFormationFromFiles(
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
        <h1 className='text-2xl font-bold'>祭り</h1>
        <button
          className='p-2 text-sm rounded-md text-grey-400 hover:bg-grey-100'
          onClick={() => navigate("..")}>
          一般の方はこちらへ
        </button>
      </div>
      <Divider primary/>
      <div className='flex justify-end'>
        <Button 
          onClick={() => {
            setSelectedFestival(null);
            setEditingFestival(true);
          }}>
          <div className='flex flex-row items-center gap-2'>
            祭りを追加
            <img
              src={ICON.addBlack}
              className="size-6"
              alt="Add new festival"/>
          </div>
        </Button>
      </div>
      <div className='flex flex-col gap-4 mx-5'>
        {
          allFestivals.festivals.sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime())
            .map((festival, index) =>
            <div key={festival.id}>
              <ExpandableSection
                defaultIsExpanded={false}
                canExpand={true}
                title={
                  <div className='flex flex-row items-end justify-between'>
                    <div>
                      <h2 className='text-xl font-bold text-primary'>{festival.name}</h2>
                      <span className='text-sm text-grey-400'>{formatJapaneseDateRange(festival.startDate, festival.endDate)}</span>
                      <div className='font-normal'>{festival.note}</div>
                    </div>
                  </div>
                }>
                <div className='flex'>
                  <button onClick={() => {
                    editFestival(festival);
                    }}>
                    <img src={ICON.edit} className="size-6 max-w-6 max-h-6" alt="Edit festival details"/>
                  </button>
                </div>
                {
                  festival.formations && festival.formations.length > 0 && 
                  <div className='mt-2'>
                    {festival.formations
                      .map((formation) => 
                        <div key={formation.id} className='hover:bg-grey-100'>
                          <Divider compact/>
                          <div className='flex flex-row items-center justify-between px-5 py-2'>
                            <span>
                              {formation.id}
                            </span>
                            <div className='flex flex-row gap-2'>
                              <button onClick={() => goToEditor(festival, formation)}>
                                <img src={ICON.editDocument} className="size-6 max-w-6 max-h-6" alt="Edit formation"/>
                              </button>
                            </div>
                          </div>
                        </div>
                    )}
                  </div>
                }
              </ExpandableSection>
              {
                index !== allFestivals.festivals.length - 1 && 
                <>
                  <br/>
                  <Divider primary compact/>
                </> 
              }
            </div>
          )
        }
      </div>
      <span className='fixed opacity-50 bottom-2 left-2'>{LAST_UPDATED}</span>
      <Dialog.Root
        dismissible
        open={editingFestival}
        onOpenChange={() => setEditingFestival(false)}
        onOpenChangeComplete={() => () => {
          if (!hasError){
            setSelectedFestival(null);
            setEditingFestival(false);
          }}}>
        {
          editingFestival &&
          <EditFestivalDialog
             festival={selectedFestival}/>
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