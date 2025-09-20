import React, { useContext, useEffect, useState } from 'react';
import { UserContext } from '../contexts/UserContext.tsx';
import FormationLeftPanel from '../components/leftPanel/FormationLeftPanel.tsx';
import FormationRightPanel from '../components/rightPanel/FormationRightPanel.tsx';
import { useNavigate } from 'react-router-dom';
import FormationEditor from '../components/editor/FormationEditor.tsx';
import { dbController } from '../data/DBProvider.tsx';
import { ParticipantCategory } from '../models/ParticipantCategory.ts';
import { CategoryContext } from '../contexts/CategoryContext.tsx';
import { DEFAULT_BOTTOM_MARGIN, DEFAULT_SIDE_MARGIN, DEFAULT_TOP_MARGIN, DEFAULT_WIDTH } from '../data/consts.ts';
import { ExportContext } from '../contexts/ExportContext.tsx';
import { EditorPageHeader } from '../components/EditorPageHeader.tsx';
import { ExportProgressDialog } from '../components/dialogs/ExportProgressDialog.tsx';
import { FormationEditorToolbar } from '../components/editor/toolbars/FormationEditorToolbar.tsx';
import { isNullOrUndefined } from '../components/helpers/GlobalHelper.ts';

export default function FormationEditorPage () {
  const userContext = useContext(UserContext);
  const {selectedFormation, updateState} = useContext(UserContext);
  const {updateCategoryContext} = useContext(CategoryContext);
  const {isExporting, exportProgress} = useContext(ExportContext);

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
    if(userContext.mode === "view" || isNullOrUndefined(selectedFormation)) return;
    const leftPositions = Array.from({ length: (selectedFormation!.length ?? 10) + (selectedFormation?.bottomMargin ?? DEFAULT_BOTTOM_MARGIN)/2 })
      .map((_, col) => [-2, col]);
    
    const rightPositions = Array.from({ length: (selectedFormation?.length ?? 10) + (selectedFormation?.bottomMargin ?? DEFAULT_BOTTOM_MARGIN)/2 })
      .map((_, col) => [ selectedFormation!.width, col]);

    const topPositions = Array.from({ length: (selectedFormation?.width ?? DEFAULT_WIDTH) + (selectedFormation?.sideMargin ?? DEFAULT_SIDE_MARGIN) })
      .flatMap((_, row) =>
        Array.from({ length: 2 }).map((_, col) => [ row - (selectedFormation?.sideMargin ?? DEFAULT_SIDE_MARGIN)/2, col])
      )

    updateState({
      marginPositions: {
        participants: topPositions,
        props: rightPositions,
        notes: leftPositions
      },
    });
  }, [userContext.selectedFormation, userContext.mode]);

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
            <div className='flex flex-1 h-full min-h-0 overflow-auto'>
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
