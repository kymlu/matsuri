import React, { useContext } from 'react';

import '../index.css';
import Button from '../components/Button.tsx';
import { festivalList, formationList, songSectionList } from '../data/ImaHitotabi.ts';
import { Festival } from '../models/Festival.ts';
import { UserContext } from '../contexts/UserContext.tsx';
import { useNavigate } from 'react-router-dom';
import { Formation } from '../models/Formation.ts';

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
    <div className='flex flex-col gap-2'>
      祭り
      {
        festivalList.map(festival =>
          <div key={festival.id}>
            <h1>{festival.name}</h1>
            {formationList
              .filter(formation => formation.festivalId === festival.id)
              .map(formation => 
                <Button 
                  key={formation.id}
                  onClick={(event) => {onClick(festival, formation)}}>
                    {formation.name}
                </Button>
            )}
          </div>
        )
      }
    </div>
  )
}