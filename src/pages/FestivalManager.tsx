import React, { useContext, useState } from 'react';

import '../index.css';
import Button from '../components/Button.tsx';
import { festivalList } from '../data/ImaHitotabi.ts';
import { Festival } from '../models/Festival.ts';
import { UserContext } from '../contexts/UserContext.tsx';
import { useNavigate } from 'react-router-dom';
import { Formation } from '../models/Formation.ts';
import Divider from '../components/Divider.tsx';
import CustomToggleGroup from '../components/CustomToggleGroup.tsx';

export type AppMode = "view" | "edit";

export default function FestivalManager () {
  const {updateState} = useContext(UserContext);
  const [mode, setMode] = useState<AppMode>("view");
  let navigate = useNavigate();

  function onClick(festival: Festival, selectedFormation: Formation) {
    updateState({
        selectedFestival: festival,
        selectedFormation: selectedFormation,
        selectedItems: [],
        mode: mode,
        showNotes: true,
    });
    if (mode === "view") {
      updateState({gridSize: 40})
    }
    navigate(mode === "edit" ? "/formation" : "/viewer");
  }

  return (
    <div className='flex flex-col w-full gap-2'>
      <div className='m-auto max-w-[90svw] mt-10'>
        <div className='flex items-center justify-between'>
          <h1 className='text-2xl font-bold'>祭り</h1>
          <CustomToggleGroup
            defaultValue="view"
            label="モード"
            options={[{
              label:  "閲",
              value: "view"
            }, {
              label: "編",
              value: "edit"
            }]}
            onChange={(newValue) => setMode(newValue as AppMode)}/>
        </div>
        <Divider/>
        <div className='grid landscape:grid-cols-[auto,1fr] items-center gap-3'>
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
        </div>
      </div>
    </div>
  )
}