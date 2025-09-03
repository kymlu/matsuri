import React, { useContext, useEffect } from 'react';
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
import { isNullOrUndefined, strEquals } from '../components/helpers/GlobalHelper.ts';
import { DEFAULT_WIDTH } from '../data/consts.ts';

export default function FormationEditorPage () {
  const userContext = useContext(UserContext);
  const {selectedFestival, selectedFormation, selectedSection, selectedItem, sections, updateState} = useContext(UserContext)
  const {participantPositions, updatePositionState} = useContext(PositionContext);
  const {updateCategoryContext} = useContext(CategoryContext)
  const navigate = useNavigate()

  useEffect(() => {
    Promise.all(
      [dbController.getAll("category"),
        dbController.getAll("formationSection")]).then(([categoryList, formationSongSections]) => {
      try {
        updateState({
          sections: (formationSongSections as Array<FormationSongSection>)
        });
        updateCategoryContext({
          categories: categoryList as Array<ParticipantCategory>
        });
      } catch (e) {
        console.error('Error parsing user from localStorage:', e);
      }
    });
  }, [])

  useEffect(() => {
    if (isNullOrUndefined(selectedFormation)) {
      navigate("../");
      return;
    }

    const currentSections = sections.filter(x => strEquals(x.formationId, selectedFormation?.id)).sort((a,b) => a.songSection.order - b.songSection.order);
    const leftPositions = Array.from({ length: (DEFAULT_WIDTH - selectedFormation!.width) / 2 - 1 })
    .flatMap((_, row) =>
      Array.from({ length: selectedFormation!.length }).map((_, col) => [ row + 1, col + 2])
    );
  
    const rightPositions = Array.from({ length: (DEFAULT_WIDTH - selectedFormation!.width) / 2 - 1 })
    .flatMap((_, row) =>
      Array.from({ length: selectedFormation!.length }).map((_, col) => [ (DEFAULT_WIDTH + selectedFormation!.width) / 2 + row + 1, col + 2])
    );
  
    const margins = [...leftPositions, ...rightPositions];

    updateState({
      currentSections: currentSections,
      selectedSection: currentSections[0],
      marginPositions: margins,
      currentMarginPosition: 0 // todo: change formation to store participants or # participants and set this to the count
    });
    console.log("Margins", margins);
  }, [userContext.selectedFormation]);

  useEffect(() => {
    Promise.all(
      [ dbController.getAll("participantPosition"),
        dbController.getAll("propPosition")])
      .then(([participantPosition, propPosition]) => {
      try {
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
  }, [userContext.selectedSection])

  return (
      <div className='h-full overflow-hidden'>
        <div className='h-full min-h-0 overflow-hidden grid grid-cols-1 grid-rows-[10svh,90svh]'>
          <header className='flex items-center justify-between w-full col-span-3 gap-10 px-4 py-2 border-b-2 border-solid border-grey'>
            <Button onClick={() => {navigate("../")}}>ホームに戻る</Button>
            {
            selectedFormation && selectedFestival && 
            <h1 className='font-bold text-center'>
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
            <div className='flex flex-1 h-full min-h-0 overflow-scroll'>
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
