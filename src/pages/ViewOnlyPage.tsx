import React, { useContext, useEffect, useState } from 'react';
import { UserContext } from '../contexts/UserContext.tsx';
import FormationEditor from '../components/editor/FormationEditor.tsx';
import { FormationSection } from '../models/FormationSection.ts';
import { isNullOrUndefined, strEquals } from '../helpers/GlobalHelper.ts';
import { DEFAULT_BOTTOM_MARGIN, DEFAULT_SIDE_MARGIN, DEFAULT_TOP_MARGIN } from '../data/consts.ts';
import { ExportContext } from '../contexts/ExportContext.tsx';
import { PositionContext } from '../contexts/PositionContext.tsx';
import { ParticipantPosition } from '../models/Position.ts';
import { EditorPageHeader } from '../components/EditorPageHeader.tsx';
import { ExportProgressDialog } from '../components/dialogs/ExportProgressDialog.tsx';
import { AnimationPath } from '../models/AnimationPath.ts';
import { getAnimationPaths } from '../helpers/AnimationHelper.ts';
import { AnimationContext } from '../contexts/AnimationContext.tsx';
import { FormationViewerToolbar } from '../components/editor/toolbars/FormationViewerToolbar.tsx';

export default function ViewOnlyPage () {
  const userContext = useContext(UserContext);
  const positionContext = useContext(PositionContext);
  const {selectedFormation, updateState} = useContext(UserContext);
  const {participantPositions} = useContext(PositionContext);
  const {isExporting, exportProgress} = useContext(ExportContext);
  const {updateAnimationContext} = useContext(AnimationContext);

  const [selectedSectionId, setSelectedSectionId] = useState<string>("");
  const [firstSectionId, setFirstSectionId] = useState<string>("");
  const [lastSectionId, setLastSectionId] = useState<string>("");

  const [animationPaths, setAnimationPaths] = useState<AnimationPath[]>([]);

  const formationEditorRef = React.createRef<any>();
  const [exportName, setExportName] = useState<string>("");

  useEffect(() => {
    setExportName(userContext.selectedFestival?.name + (userContext.selectedFormation ? ` - ${userContext.selectedFormation.name}` : ''));
  }, [userContext.selectedFestival, userContext.selectedFormation])

  useEffect(() => {
    setFirstSectionId(userContext.currentSections?.sort((a, b) => a.order - b.order)[0]?.id ?? "");
    setLastSectionId(userContext.currentSections?.sort((a, b) => b.order - a.order)[0]?.id ?? "");
  }, [userContext.currentSections]);

  useEffect(() => {
    setSelectedSectionId(userContext.selectedSection?.id ?? "");
  }, [userContext.selectedSection]);

  useEffect(() => {
    if (isNullOrUndefined(userContext.currentSections) || isNullOrUndefined(participantPositions)) return;
    generateAnimationPaths(userContext.currentSections, positionContext.participantPositions);
  }, [userContext.gridSize, userContext.currentSections, positionContext.participantPositions]);

  function generateAnimationPaths(sections: Array<FormationSection>, participantPositions: ParticipantPosition[]){
    var newPaths: AnimationPath[] = [];
        
    Array.from({length: sections?.length - 1}).forEach((_, i) => {
      newPaths.push(
        {
          fromSectionId: sections[i].id,
          toSectionId: sections[i + 1].id,
          paths: getAnimationPaths(
            [sections[i].id, sections[i + 1].id],
            userContext.gridSize,
            participantPositions,
            selectedFormation?.topMargin ?? DEFAULT_TOP_MARGIN,
            selectedFormation?.sideMargin ?? DEFAULT_SIDE_MARGIN
          )
        },
        {
          fromSectionId: sections[i + 1].id,
          toSectionId: sections[i].id,
          paths: getAnimationPaths(
            [sections[i + 1].id, sections[i].id],
            userContext.gridSize,
            participantPositions,
            selectedFormation?.topMargin ?? DEFAULT_TOP_MARGIN,
            selectedFormation?.sideMargin ?? DEFAULT_SIDE_MARGIN
          )
        }
      );
    });
    setAnimationPaths(newPaths);
  }

  function setValueOrDefault(defaultValue: number, value?: number) : number {
    return (value ?? -1) >= 0 ? value! : defaultValue
  }

  function changeSection(isNext?: boolean) {
    var index = userContext.currentSections.sort((a, b) => a.order - b.order).findIndex(x => strEquals(selectedSectionId, x.id));
    var nextSection = userContext.currentSections.sort((a, b) => a.order - b.order)[index + (isNext ? 1 : -1)];
    var from = selectedSectionId;
    var to = nextSection.id;
    var paths = animationPaths.find(x => strEquals(x.fromSectionId, from) && strEquals(x.toSectionId, to))?.paths;
    if (paths) {
      updateAnimationContext({
        paths: paths,
        isAnimating: true
      });
    }
    updateState({
      selectedSection: nextSection
    });
  }

  return (
      <div className='h-full overflow-hidden'>
        <div className='h-full min-h-0 overflow-hidden grid grid-cols-1 grid-rows-[60px_calc(100svh-60px)]'>
          <header className='flex items-center justify-between w-full col-span-3 px-4 py-2 border-b-2 border-solid border-grey'>
            <EditorPageHeader/>
          </header>
          <div className='flex flex-1 h-full min-h-0 px-5 py-2 overflow-auto'>
            <FormationEditor
              ref={formationEditorRef}
              width={setValueOrDefault(20, selectedFormation?.width)}
              height={setValueOrDefault(20, selectedFormation?.length)}
              topMargin={setValueOrDefault(DEFAULT_TOP_MARGIN, selectedFormation?.topMargin)}
              bottomMargin={setValueOrDefault(DEFAULT_BOTTOM_MARGIN, selectedFormation?.bottomMargin)}
              sideMargin={setValueOrDefault(DEFAULT_SIDE_MARGIN, selectedFormation?.sideMargin)}/>
            <FormationViewerToolbar
              changeSection={changeSection}
              firstSectionId={firstSectionId}
              lastSectionId={lastSectionId}
              selectedSectionId={selectedSectionId}
              export={() => {
                formationEditorRef.current?.exportToPdf(exportName);
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
