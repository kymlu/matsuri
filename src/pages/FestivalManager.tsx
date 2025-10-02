import React, { useContext, useEffect } from 'react';

import '../index.css';
import Button from '../components/Button.tsx';
import { festivalList } from '../data/ImaHitotabi.ts';
import { Festival } from '../models/Festival.ts';
import { UserContext } from '../contexts/UserContext.tsx';
import { useNavigate } from 'react-router-dom';
import { Formation } from '../models/Formation.ts';
import Divider from '../components/Divider.tsx';
import CustomToggleGroup from '../components/CustomToggleGroup.tsx';
import { DEFAULT_GRID_SIZE, LAST_UPDATED } from '../lib/consts.ts';
import { AppMode, AppModeContext } from '../contexts/AppModeContext.tsx';
import { FormationContext } from '../contexts/FormationContext.tsx';
import { VisualSettingsContext } from '../contexts/VisualSettingsContext.tsx';
import allFestivals from "../data/allFestivals.json"
import { formatJapaneseDateRange } from '../lib/helpers/DateHelper.ts';

export default function FestivalManager () {
  const {updateState} = useContext(UserContext);
  const {updateVisualSettingsContext} = useContext(VisualSettingsContext);
  const {appMode, updateAppModeContext} = useContext(AppModeContext);
  const {updateFormationContext} = useContext(FormationContext);
  let navigate = useNavigate();

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
    <div className='flex flex-col w-full gap-2 mt-10 portrait:my-10 landscape:max-w-[50svw] landscape:mx-auto'>
      <div className='flex items-center justify-between mx-4'>
        <h1 className='text-2xl font-bold'>祭り</h1>
        {
          appMode === "view" &&
          <button
            className='p-2 text-sm rounded-md text-grey-400 hover:bg-grey-100'
            onClick={() => updateAppModeContext({appMode: "edit"})}>
            振り班はこちらへ
          </button>
        }
        {
          appMode === "edit" &&
          <button
            className='p-2 text-sm rounded-md text-grey-400 hover:bg-grey-100'
            onClick={() => updateAppModeContext({appMode: "view"})}>
            一般の方はこちらへ
          </button>
        }
      </div>
      <Divider primary/>
      {/* <div className='grid landscape:grid-cols-[auto,1fr] items-center gap-3 mx-4'>
        {
          festivalList.map(festival =>
            <React.Fragment key={festival.name}>
              <h2 className='text-xl'>{festival.name}</h2>
              <div className='flex flex-row flex-wrap gap-3'>
                {festival.formations
                  .map(formation => 
                    <Button 
                      label={`Select ${formation.name}`}
                      key={formation.id}
                      onClick={(event) => {onClick(festival, formation)}}>
                        {formation.name}
                    </Button>
                )}
              </div>
            </React.Fragment>
          )
        }
      </div> */}
      <div className='mx-4'>
        {
          allFestivals.festivals.sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime())
            .map((festival, index) =>
            <div key={festival.id} className='mt-5'>
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
                        key={formation}
                        onClick={() => {onClick({
                          ...festival,
                          startDate: new Date(festival.startDate),
                          endDate: festival.endDate ? new Date(festival.endDate) : undefined,
                          formations: [],
                          } as Festival, {name: formation} as Formation)}}>
                          {formation}
                      </Button>
                  )}
                </div>
              }
              {
                index < allFestivals.festivals.length - 1 &&
                <Divider />
              }
            </div>
          )
        }
      </div>
      <span className='fixed opacity-50 bottom-2 left-2'>{LAST_UPDATED}</span>
    </div>
  )
}