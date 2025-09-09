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
import { Dialog } from '@base-ui-components/react';
import { ExportContext } from '../contexts/ExportContext.tsx';

export default function FormationEditorPage () {
  const userContext = useContext(UserContext);
  const {updateFormationContext} = useContext(FormationContext);
  const {selectedFestival, selectedFormation, selectedSection, updateState} = useContext(UserContext)
  const {participantPositions, updatePositionState} = useContext(PositionContext);
  const {updateCategoryContext} = useContext(CategoryContext);
  const {isExporting, exportName, exportProgress} = useContext(ExportContext);
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
        dbController.getByFormationId("formationSection", selectedFormation?.id!),
        dbController.getByFormationId("participant", selectedFormation?.id!),
        dbController.getByFormationId("prop", selectedFormation?.id!),
      ]).then(([formationSongSections, participants, props]) => {
      try {
        const currentSections = (formationSongSections as Array<FormationSongSection>)
          .sort((a,b) => a.order - b.order);
        updateFormationContext({
          participantList: participants as Array<Participant>,
          propList: props as Array<Prop>
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
    if(isNullOrUndefined(selectedSection)) return;
    
    Promise.all(
      [ dbController.getByFormationSectionId("participantPosition", selectedSection!.id),
        dbController.getByFormationSectionId("propPosition", selectedSection!.id),
        dbController.getByFormationSectionId("notePosition", selectedSection!.id),
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
  }, [userContext.selectedSection]);

  return (
      <div className='h-full overflow-hidden'>
        <div className='h-full min-h-0 overflow-hidden grid grid-cols-1 grid-rows-[10svh,90svh]'>
          <header className='flex items-center justify-between w-full col-span-3 px-4 py-2 border-b-2 border-solid border-grey'>
            <CustomMenu trigger={
              <img alt="Matsuri logo" src="logo192.png" className='size-8 max-w-8 max-h-8'/>
            }>
              <>
                <MenuItem label="ホームに戻る" onClick={() => {
                  updateState({
                    selectedFormation: null,
                    selectedSection: null,
                    selectedFestival: null,
                    selectedItem: null
                  });
                  navigate("../");
                }} />
              </>
            </CustomMenu>
            {
            selectedFormation && selectedFestival &&
            <h1 className='px-2 font-bold text-center'>
              {selectedSection?.displayName} ・ {selectedFormation?.name} ({selectedFormation.width} x {selectedFormation.length}) ・ {selectedFestival?.name}
            </h1>
            }
            <CustomMenu trigger={
              <img alt="Extra settings" src="icons/settings.svg" className='size-8 max-w-8 max-h-8'/>
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
            <FormationRightPanel exportFunc={() => formationEditorRef.current?.exportToPdf()}/>
          </div>
        </div>
        <Dialog.Root open={isExporting} modal>
          <Dialog.Portal>
            <Dialog.Backdrop className="fixed inset-0 bg-black opacity-20 transition-all duration-150 data-[ending-style]:opacity-0 data-[starting-style]:opacity-0 dark:opacity-70" />
            <Dialog.Popup className="fixed top-1/2 left-1/2 -mt-8 w-96 max-w-[calc(100vw-3rem)] -translate-x-1/2 -translate-y-1/2 rounded-lg bg-gray-50 p-6 text-gray-900 outline outline-1 outline-gray-200 transition-all duration-150 data-[ending-style]:scale-90 data-[ending-style]:opacity-0 data-[starting-style]:scale-90 data-[starting-style]:opacity-0 dark:outline-gray-300">
              <Dialog.Title className="-mt-1.5 mb-1 text-lg font-medium">PDF出力中</Dialog.Title>
              <Dialog.Description className="mb-6 text-base text-gray-600">
                「<b>{exportName}.pdf</b>」を生成しています。<br></br>完了までしばらくお待ちください。<br></br>進行状況：{exportProgress}%
              </Dialog.Description>
            </Dialog.Popup>
          </Dialog.Portal>
        </Dialog.Root>
      </div>
    )
}
