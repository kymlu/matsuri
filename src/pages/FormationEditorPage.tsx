import React, { useContext, useEffect, useState } from 'react';
import { UserContext } from '../contexts/UserContext.tsx';
import FormationLeftPanel from '../components/leftPanel/FormationLeftPanel.tsx';
import FormationRightPanel from '../components/rightPanel/FormationRightPanel.tsx';
import { useNavigate } from 'react-router-dom';
import FormationEditor from '../components/editor/FormationEditor.tsx';
import { dbController } from '../data/DBProvider.tsx';
import { ParticipantCategory } from '../models/ParticipantCategory.ts';
import { CategoryContext } from '../contexts/CategoryContext.tsx';
import { FormationSection } from '../models/FormationSection.ts';
import { isNullOrUndefined } from '../components/helpers/GlobalHelper.ts';
import { DEFAULT_BOTTOM_MARGIN, DEFAULT_SIDE_MARGIN, DEFAULT_TOP_MARGIN, DEFAULT_WIDTH } from '../data/consts.ts';
import { FormationContext } from '../contexts/FormationContext.tsx';
import { Prop } from '../models/Prop.ts';
import { Participant } from '../models/Participant.ts';
import { ExportContext } from '../contexts/ExportContext.tsx';
import { PositionContext } from '../contexts/PositionContext.tsx';
import { ParticipantPosition, PropPosition, NotePosition } from '../models/Position.ts';
import { EditorPageHeader } from '../components/EditorPageHeader.tsx';
import { ExportProgressDialog } from '../components/dialogs/ExportProgressDialog.tsx';
import { FormationEditorToolbar } from '../components/editor/toolbars/FormationEditorToolbar.tsx';

export default function FormationEditorPage () {
  const userContext = useContext(UserContext);
  const {updateFormationContext} = useContext(FormationContext);
  const {selectedFormation, updateState} = useContext(UserContext);
  const {updatePositionState} = useContext(PositionContext);
  const {updateCategoryContext} = useContext(CategoryContext);
  const {isExporting, exportProgress} = useContext(ExportContext);

  const navigate = useNavigate()
  const formationEditorRef = React.createRef<any>();
  const [exportName, setExportName] = useState<string>("");

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
        dbController.getAll("participantPosition"),
        dbController.getAll("propPosition"),
        dbController.getAll("notePosition"),
      ]).then(([formationSections, participants, props,
        participantPosition, propPosition, notePosition]) => {
      try {
        updateFormationContext({
          participantList: participants as Array<Participant>,
          propList: props as Array<Prop>
        });

        updatePositionState({
          participantPositions: participantPosition as Array<ParticipantPosition>,
          propPositions: propPosition as Array<PropPosition>,
          notePositions: notePosition as Array<NotePosition>
        });

        const currentSections = (formationSections as Array<FormationSection>)
          .sort((a,b) => a.order - b.order);

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

  function setValueOrDefault(defaultValue: number, value?: number) : number { // todo: move to helper
    return (value ?? -1) >= 0 ? value! : defaultValue
  }

  return (
      <div className='h-full overflow-hidden'>
        <div className='h-full min-h-0 overflow-hidden grid grid-cols-1 grid-rows-[60px_calc(100svh-60px)]'>
          <header className='flex items-center justify-between w-full col-span-3 px-4 py-2 border-b-2 border-solid border-grey'>
            <EditorPageHeader/>
          </header>
          <div className='flex flex-row gap-0'>
            <FormationLeftPanel/>
            <div className='flex justify-center flex-1 h-full min-h-0 overflow-auto'>
              <FormationEditor
                ref={formationEditorRef}
                width={setValueOrDefault(20, selectedFormation?.width)}
                height={setValueOrDefault(20, selectedFormation?.length)}
                topMargin={setValueOrDefault(DEFAULT_TOP_MARGIN, selectedFormation?.topMargin)}
                bottomMargin={setValueOrDefault(DEFAULT_BOTTOM_MARGIN, selectedFormation?.bottomMargin)}
                sideMargin={setValueOrDefault(DEFAULT_SIDE_MARGIN, selectedFormation?.sideMargin)}/>
              <FormationEditorToolbar/>
            </div>
            <FormationRightPanel exportFunc={(exportName: string) => {
              formationEditorRef.current?.exportToPdf(exportName);
              setExportName(exportName);
            }}/>
          </div>
        </div>
        <ExportProgressDialog
          exportName={exportName}
          isOpen={isExporting}
          progress={exportProgress}/>
      </div>
    )
}
