import React, { useContext } from 'react';

import '../index.css';
import Button from '../components/Button.tsx';
import { festivalList } from '../data/ImaHitotabi.ts';
import { Festival } from '../models/Festival.ts';
import { UserContext } from '../contexts/UserContext.tsx';
import { useNavigate } from 'react-router-dom';
import { Formation } from '../models/Formation.ts';
import Divider from '../components/Divider.tsx';

export default function FestivalManager () {
  const {updateState} = useContext(UserContext)
  let navigate = useNavigate();

  function onClick(festival: Festival, selectedFormation: Formation) {
    updateState({
        selectedFestival: festival,
        selectedFormation: selectedFormation,
        selectedItem: null,
        // selectedSection: songSectionList
        //   .filter(section => section.songId === "1")
        //   .sort(x => x.order)[0], // todo: generate list
    });
    navigate("/formation");
  }

  return (
    <div className='flex flex-col w-full gap-2'>
      <div className='m-auto mt-10'>
        <h1 className='text-2xl font-bold'>祭り</h1>
        <Divider/>
        <div>
          {
            festivalList.map(festival =>
              <div className='grid grid-cols-[auto,1fr] gap-3' key={festival.id}>
                <h2 className='text-xl'>{festival.name}</h2>
                <div className='flex flex-row gap-3'>
                  {festival.formations
                    .map(formation => 
                      <Button 
                        key={formation.id}
                        onClick={(event) => {onClick(festival, formation)}}>
                          {formation.name}
                      </Button>
                  )}
                </div>
              </div>
            )
          }
        </div>
      </div>
    </div>
  )
}