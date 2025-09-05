import React, { useCallback, useContext, useEffect } from 'react';
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
import { isNote, isParticipant, isProp, NotePosition, ParticipantPosition, PropPosition } from '../models/Position.ts';
import { isNullOrUndefined, strEquals } from '../components/helpers/GlobalHelper.ts';
import { CONTEXT_NAMES, DB_NAME, DEFAULT_WIDTH } from '../data/consts.ts';
import { FormationContext } from '../contexts/FormationContext.tsx';
import { Prop } from '../models/Prop.ts';
import { Participant } from '../models/Participant.ts';

export default function FormationEditorPage () {
  const userContext = useContext(UserContext);
  const {noteList, updateFormationContext} = useContext(FormationContext)
  const {selectedFestival, selectedFormation, selectedSection, selectedItem, sections, updateState} = useContext(UserContext)
  const {participantPositions, propPositions, updatePositionState} = useContext(PositionContext);
  const {updateCategoryContext} = useContext(CategoryContext)
  const navigate = useNavigate()

  useEffect(() => {
    Promise.all(
      [
        dbController.getAll("category"),
        dbController.getAll("formationSection"),
        dbController.getAll("participant"),
        dbController.getAll("prop")
      ]).then(([categoryList, formationSongSections, participants, props]) => {
      try {
        updateState({
          sections: (formationSongSections as Array<FormationSongSection>)
        });
        updateCategoryContext({
          categories: categoryList as Array<ParticipantCategory>
        });
        updateFormationContext({
          participantList: participants as Array<Participant>,
          propList: props as Array<Prop>
        })
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

    const currentSections = sections
      .filter(x => strEquals(x.formationId, selectedFormation?.id))
      .sort((a,b) => a.songSection.order - b.songSection.order);
      
    const leftPositions = Array.from({ length: (DEFAULT_WIDTH - selectedFormation!.width) / 2 - 1 })
    .flatMap((_, row) =>
      Array.from({ length: selectedFormation!.length }).map((_, col) => [ row + 1, col + 2])
    );
  
    const rightPositions = Array.from({ length: (selectedFormation?.length ?? 10) })
      .map((_, col) => [ (DEFAULT_WIDTH + selectedFormation!.width) / 2, col + 2]);

    console.log(rightPositions);

    const topPositions = Array.from({ length: DEFAULT_WIDTH - 4 })
      .map((_, col) => [col + 2, 2]);
  
    updateState({
      currentSections: currentSections,
      selectedSection: currentSections[0],
      marginPositions: {
        participants: leftPositions,
        props: rightPositions,
        notes: topPositions
      },
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

  var deleteItem = useCallback((e: KeyboardEvent) =>{
    if (isNullOrUndefined(selectedItem)) return;
      
    if (e.key === "Delete" || e.key === "Backspace") {
      if (isParticipant(selectedItem!)) {
        Promise.all([
          dbController.removeItem("participant", selectedItem?.participantId),
          dbController.removeList(
            "participantPosition", 
            participantPositions
              .filter(x => strEquals(x.participantId, selectedItem.participantId))
              .map(x => x.id)
          )
        ]).then(() => {
          Promise.all([
            dbController.getAll("participantPosition"),
            dbController.getAll("participant"),
          ]).then(([participantPosition, participant]) => {
            try {
              var participantPositionList = participantPosition as Array<ParticipantPosition>;
              var participantList = participant as Array<Participant>;
              updatePositionState({
                participantPositions: participantPositionList,
              });
              updateFormationContext({
                participantList: participantList
              })
              participantPositionList.forEach(p => { // todo: remove, probably
                p.x2 = p.x;
                p.y2 = p.y;
              });
            } catch (e) {
              console.error('Error parsing user from localStorage:', e);
            }
          })
        });
      } else if (isProp(selectedItem!)) {
        Promise.all([
          dbController.removeItem("prop", selectedItem.propId),
          dbController.removeList(
            "propPosition",
            propPositions
              .filter(x => strEquals(x.propId, selectedItem.propId))
              .map(x => x.id)
          )
        ]).then(() => {
          Promise.all([
            dbController.getAll("propPosition"),
            dbController.getAll("prop"),
          ]).then(([propPosition, prop]) => {
            try {
              var propPositionList = propPosition as Array<PropPosition>;
              var propList = prop as Array<Prop>;
              updatePositionState({
                propPositions: propPositionList,
              });
              updateFormationContext({
                propList: propList
              })
              propPositions.forEach(p => { // todo: remove, probably
                p.x2 = p.x;
                p.y2 = p.y;
              });
            } catch (e) {
              console.error('Error parsing user from localStorage:', e);
            }
          })
        });
      } else if (isNote(selectedItem!)) {
        updateFormationContext({noteList: noteList.filter(x => !strEquals(x.id, selectedItem.id))});
        dbController.removeItem("notePosition", selectedItem.id);
      }
    }
    updateState({selectedItem: null});
    window.removeEventListener("keydown", deleteItem);
  }, [userContext.selectedItem]);

  useEffect(() => {
    window.addEventListener("keydown", deleteItem);

    return () => {
      window.removeEventListener("keydown", deleteItem);
    };
  }, [deleteItem]);

  return (
      <div className='h-full overflow-hidden'>
        <div className='h-full min-h-0 overflow-hidden grid grid-cols-1 grid-rows-[10svh,90svh]'>
          <header className='flex items-center justify-between w-full col-span-3 gap-10 px-4 py-2 border-b-2 border-solid border-grey'>
            <Button onClick={() => {navigate("../")}}>ホームに戻る</Button>
            {
            selectedFormation && selectedFestival &&
            <h1 className='px-2 font-bold text-center'>
              Editing {selectedSection?.songSection?.name} {selectedFormation?.name} ({selectedFormation.width} x {selectedFormation.length}) @ {selectedFestival?.name}
            </h1>
            }
            <Button onClick={() => {
              Object.values(CONTEXT_NAMES).forEach((context) => {
                localStorage.removeItem(context);
              });
              indexedDB.deleteDatabase(DB_NAME);
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
