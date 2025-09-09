import React, { useContext, useEffect } from 'react';
import { UserContext } from '../contexts/UserContext.tsx';
import FormationLeftPanel from '../components/leftPanel/FormationLeftPanel.tsx';
import FormationRightPanel from '../components/rightPanel/FormationRightPanel.tsx';
import { useNavigate } from 'react-router-dom';
import FormationEditor from '../components/editor/FormationEditor.tsx';
import { dbController } from '../data/DBProvider.tsx';
import { ParticipantCategory } from '../models/ParticipantCategory.ts';
import { CategoryContext } from '../contexts/CategoryContext.tsx';
import { PositionContext } from '../contexts/PositionContext.tsx';
import { FormationSongSection } from '../models/FormationSection.ts';
import { NotePosition, ParticipantPosition, PropPosition } from '../models/Position.ts';
import { isNullOrUndefined, strEquals } from '../components/helpers/GlobalHelper.ts';
import { CONTEXT_NAMES, DB_NAME, DEFAULT_WIDTH } from '../data/consts.ts';
import { FormationContext } from '../contexts/FormationContext.tsx';
import { Prop } from '../models/Prop.ts';
import { Participant } from '../models/Participant.ts';
import CustomMenu, { MenuItem, MenuSeparator } from '../components/CustomMenu.tsx';

export default function FormationEditorPage () {
  const userContext = useContext(UserContext);
  const {updateFormationContext} = useContext(FormationContext)
  const {selectedFestival, selectedFormation, selectedSection, updateState} = useContext(UserContext)
  const {participantPositions, updatePositionState} = useContext(PositionContext);
  const {updateCategoryContext} = useContext(CategoryContext)
  const navigate = useNavigate()
  const formationEditorRef = React.createRef<any>();

  useEffect(() => {
    Promise.all(
      [
        dbController.getAll("category"),
      ]).then(([categoryList]) => {
      try {
        updateCategoryContext({
          categories: categoryList as Array<ParticipantCategory>
        });
      } catch (e) {
        console.error('Error parsing user from localStorage:', e);
      }
    });
  }, []);

  useEffect(() => {
    if (isNullOrUndefined(selectedFormation)) {
      navigate("../");
      return;
    }

    Promise.all(
      [
        dbController.getAll("formationSection"),
        dbController.getAll("participant"),
        dbController.getAll("prop")
      ]).then(([formationSongSections, participants, props]) => {
      try {
        const currentSections = (formationSongSections as Array<FormationSongSection>)
          .filter(x => strEquals(x.formationId, selectedFormation?.id))
          .sort((a,b) => a.order - b.order);
        updateFormationContext({
          participantList: (participants as Array<Participant>).filter(x => strEquals(x.formationId, selectedFormation?.id)),
          propList: (props as Array<Prop>).filter(x => strEquals(x.formationId, selectedFormation?.id))
        });
        const leftPositions = Array.from({ length: (DEFAULT_WIDTH - selectedFormation!.width) / 2 - 1 })
          .flatMap((_, row) =>
            Array.from({ length: selectedFormation!.length }).map((_, col) => [ row + 1, col + 2])
          );
        
        const rightPositions = Array.from({ length: (selectedFormation?.length ?? 10) })
          .map((_, col) => [ (DEFAULT_WIDTH + selectedFormation!.width) / 2, col + 2]);

        const topPositions = Array.from({ length: DEFAULT_WIDTH - 4 })
          .map((_, col) => [col + 2, 2]);
      
        updateState({
          isLoading: false,
          previousSectionId: null,
          currentSections: currentSections,
          selectedSection: currentSections[0],
          marginPositions: {
            participants: leftPositions,
            props: rightPositions,
            notes: topPositions
          },
        });
      } catch (e) {
        console.error('Error parsing user from localStorage:', e);
      }
    });
  }, [userContext.selectedFormation]);

  useEffect(() => {
    Promise.all(
      [ dbController.getAll("participantPosition"),
        dbController.getAll("propPosition"),
        dbController.getAll("notePosition"),
      ])
      .then(([participantPosition, propPosition, notePosition]) => {
      try {
        var participantPositionList = participantPosition as Array<ParticipantPosition>;
        participantPositionList.forEach(x => x.isSelected = false);
        
        var propPositionList = propPosition as Array<PropPosition>;
        propPositionList.forEach(x => x.isSelected = false);

        var notePositionList = notePosition as Array<NotePosition>;
        notePositionList.forEach(x => x.isSelected = false);
        
        updatePositionState({
          participantPositions: participantPositionList,
          propPositions: propPositionList
        });
        updateFormationContext({
          noteList: notePositionList
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
            <CustomMenu trigger={
              <img src="logo192.png" className='size-8'/>
            }>
              <>
                <MenuItem label="ホームに戻る" onClick={() => {
                  navigate("../")}} />
              </>
            </CustomMenu>
            {
            selectedFormation && selectedFestival &&
            <h1 className='px-2 font-bold text-center'>
              {selectedSection?.displayName} ・ {selectedFormation?.name} ({selectedFormation.width} x {selectedFormation.length}) ・ {selectedFestival?.name}
            </h1>
            }
            <CustomMenu trigger={
              <img src="icons/settings.svg" className='size-8'/>
              }>
              <>
                <MenuItem label="Clear Cache" onClick={() => {
                  Object.values(CONTEXT_NAMES).forEach((context) => {
                    localStorage.removeItem(context);
                  })}} />
                <MenuSeparator />
                <MenuItem label="Clear DB and Cache" onClick={() => {
                  Object.values(CONTEXT_NAMES).forEach((context) => {
                    localStorage.removeItem(context);
                  });
                  indexedDB.deleteDatabase(DB_NAME);
                }} />
              </>
            </CustomMenu>
            </header>
          <div className='flex flex-row gap-0'>
            <FormationLeftPanel/>
            <div className='flex flex-1 h-full min-h-0 overflow-scroll'>
              <FormationEditor
                ref={formationEditorRef}
                width={selectedFormation?.width ?? 20}
                height={selectedFormation?.length ?? 20}/>
            </div>
            {/* todo: warnings if some people aren't in all sections */}
            {/* todo: warning if some people are in other categories */}
            <FormationRightPanel exportFunc={(newName) => {formationEditorRef.current.exportToPdf(newName)}}/>
          </div>
        </div>
      </div>
    )
}
