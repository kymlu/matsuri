import React, { useContext, useEffect, useState } from 'react';
import { UserContext } from '../contexts/UserContext.tsx';
import Button from '../components/Button.tsx';
import FormationLeftPanel from '../components/leftPanel/FormationLeftPanel.tsx';
import FormationRightPanel from '../components/rightPanel/FormationRightPanel.tsx';
import { useNavigate } from 'react-router-dom';
import FormationEditor from '../components/editor/FormationEditor.tsx';
import { dbController } from '../data/DBProvider.tsx';
import { ParticipantCategory } from '../models/ParticipantCategory.ts';
import { CategoryContext } from '../contexts/CategoryContext.tsx';
import { PositionContext } from '../contexts/PositionContext.tsx';
import { FormationSongSection } from '../models/FormationSection.ts';
import { ParticipantPosition, PropPosition } from '../models/Position.ts';
import { strEquals } from '../components/helpers/GlobalHelper.ts';

export default function FormationEditorPage () {
  const userContext = useContext(UserContext);
  const {selectedFestival, selectedFormation, selectedSection, selectedItem, sections, currentSections, updateState} = useContext(UserContext)
  const {participantPositions, updatePositionState} = useContext(PositionContext);
  const {updateCategoryContext} = useContext(CategoryContext)
  const navigate = useNavigate()

  useEffect(() => {
    if (selectedFormation === null) {
      navigate("../");
    }
    updateState({currentSections: sections.filter(x => strEquals(x.formationId, selectedFormation?.id)).sort((a,b) => a.songSection.order - b.songSection.order)});
    updateState({selectedSection: sections.filter(x => strEquals(x.formationId, selectedFormation?.id)).sort((a,b) => a.songSection.order - b.songSection.order)[0]});
  }, [userContext.selectedFormation]);

  useEffect(() => {
    Promise.all(
      [dbController.getAll("category"),
        dbController.getAll("participantPosition"),
        dbController.getAll("propPosition"),
        dbController.getAll("formationSection")]).then(([categoryList, participantPosition, propPosition, formationSongSections]) => {
      try {
        updateState({
          sections: (formationSongSections as Array<FormationSongSection>)
        });
        updateCategoryContext({
          categories: categoryList as Array<ParticipantCategory>
        });
        var participantPositionList = participantPosition as Array<ParticipantPosition>;
        participantPositionList.forEach(x => x.isSelected = strEquals(x.id, selectedItem?.id));
        var propPositionList = propPosition as Array<PropPosition>;
        propPositionList.forEach(x => x.isSelected = strEquals(x.id, selectedItem?.id));
        updatePositionState({
          participantPositions: participantPositionList,
          propPositions: propPositionList
        });
        participantPositions.forEach(p => { // todo: remove, probably
          p.x2 = p.x;
          p.y2 = p.y;
        });
      } catch (e) {
        console.error('Error parsing user from localStorage:', e);
      }
    });
  }, [])


  return (
      <div className='h-full overflow-hidden'>
        <div className='h-full min-h-0 overflow-hidden grid grid-cols-1 grid-rows-[10svh,90svh]'>
          <header className='flex items-center justify-between w-full col-span-3 gap-10 px-4 py-2 border-b-2 border-black border-solid'>
            <Button onClick={() => {navigate("../")}}>ホームに戻る</Button>
            {
            selectedFormation && selectedFestival && 
            <h1 className='font-bold'>
              Editing {selectedSection?.songSection?.name} {selectedFormation?.name} ({selectedFormation.width} x {selectedFormation.length}) @ {selectedFestival?.name}
            </h1>
            }
            <Button onClick={() => {
                localStorage.removeItem("userManager");
                localStorage.removeItem("formationManager");
                indexedDB.deleteDatabase("MatsuriDB");
            }}>Delete cache</Button>
            </header>
          <div className='flex flex-row gap-0'>
            <FormationLeftPanel/>
            <div className='h-full min-h-0 overflow-scroll'>
              <FormationEditor width={selectedFormation?.width ?? 20} height={selectedFormation?.length ?? 20}/>
            </div>
            {/* todo: warnings if some people aren't in all sections */}
            {/* todo: warning if some people are in other categories */}
            <FormationRightPanel/>
          </div>
        </div>
      </div>
    )
}
