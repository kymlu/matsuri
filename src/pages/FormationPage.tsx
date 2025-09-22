import React, { useContext, useEffect, useState } from 'react';
import { UserContext } from '../contexts/UserContext.tsx';
import { FormationSection } from '../models/FormationSection.ts';
import { isNullOrUndefined, strEquals } from '../helpers/GlobalHelper.ts';
import { DEFAULT_BOTTOM_MARGIN, DEFAULT_SIDE_MARGIN, DEFAULT_TOP_MARGIN, DEFAULT_WIDTH } from '../data/consts.ts';
import { PositionContext } from '../contexts/PositionContext.tsx';
import { NotePosition, ParticipantPosition, PropPosition } from '../models/Position.ts';
import { EditorPageHeader } from '../components/EditorPageHeader.tsx';
import { ExportProgressDialog } from '../components/dialogs/ExportProgressDialog.tsx';
import { AnimationPath } from '../models/AnimationPath.ts';
import { generateAnimationPaths } from '../helpers/AnimationHelper.ts';
import { AnimationContext } from '../contexts/AnimationContext.tsx';
import FormationCanvas from '../components/editor/FormationCanvas.tsx';
import { useNavigate } from 'react-router-dom';
import { GetAllCategories, GetAllForFormation } from '../data/DataController.ts';
import { groupByKey, indexByKey } from '../helpers/GroupingHelper.ts';
import { Participant } from '../models/Participant.ts';
import { Prop } from '../models/Prop.ts';
import { ParticipantCategory } from '../models/ParticipantCategory.ts';
import { exportToPdf } from '../helpers/ExportHelper.ts';
import { FormationViewToolbar } from '../components/editor/toolbars/FormationViewerToolbar.tsx';
import { FormationEditorToolbar } from '../components/editor/toolbars/FormationEditorToolbar.tsx';
import { AppModeContext } from '../contexts/AppModeContext.tsx';
import { FormationContext } from '../contexts/FormationContext.tsx';
import FormationLeftPanel from '../components/leftPanel/FormationLeftPanel.tsx';
import FormationRightPanel from '../components/rightPanel/FormationRightPanel.tsx';
import { GridSizeContext } from '../contexts/GridSizeContext.tsx';
import { EntitiesContext } from '../contexts/EntitiesContext.tsx';

export type MarginPositions = {
  participants: number[][],
  props: number[][],
  notes: number[][],
}

export default function FormationPage () {
  const userContext = useContext(UserContext);
  const positionContext = useContext(PositionContext);
  const {updateState} = useContext(UserContext);
  const {gridSize} = useContext(GridSizeContext);
  const {selectedFormation} = useContext(FormationContext);
  const {appMode} = useContext(AppModeContext);
  const {participantPositions, propPositions, notePositions, updatePositionContextState} = useContext(PositionContext);
  const {updateAnimationContext} = useContext(AnimationContext);
  const {updateEntitiesContext, participantList, propList} = useContext(EntitiesContext);

  const [selectedSectionId, setSelectedSectionId] = useState<string>("");
  const [firstSectionId, setFirstSectionId] = useState<string>("");
  const [lastSectionId, setLastSectionId] = useState<string>("");

  const [animationPaths, setAnimationPaths] = useState<AnimationPath[]>([]);

  const formationEditorRef = React.createRef<any>();
  const [exportName, setExportName] = useState<string>("");
  
  const navigate = useNavigate();

  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [exportProgress, setExportProgress] = useState<number>(0);
  const [sections, setSections] = useState<FormationSection[]>([]);
  const [categories, setCategories] = useState<Record<string, ParticipantCategory>>({});
  const [marginPositions, setMarginPositions] = useState<MarginPositions>({participants: [], props: [], notes: []});

  useEffect(() => {
    setExportName(userContext.selectedFestival?.name + (selectedFormation ? ` - ${selectedFormation.name}` : ''));
  }, [selectedFormation]);

  useEffect(() => {
    setFirstSectionId(userContext.currentSections?.sort((a, b) => a.order - b.order)[0]?.id ?? "");
    setLastSectionId(userContext.currentSections?.sort((a, b) => b.order - a.order)[0]?.id ?? "");
  }, [userContext.currentSections]);

  useEffect(() => {
    setSelectedSectionId(userContext.selectedSection?.id ?? "");
  }, [userContext.selectedSection]);

  useEffect(() => {
    /// todo: inefficient
    if (isNullOrUndefined(userContext.currentSections) || isNullOrUndefined(participantPositions) || isNullOrUndefined(selectedFormation)) return;
    generateAnimationPaths(userContext.currentSections, Object.values(positionContext.participantPositions).flat(), gridSize, selectedFormation?.topMargin, selectedFormation?.sideMargin);
  }, [gridSize, userContext.currentSections, positionContext.participantPositions, selectedFormation]);
  
  useEffect(() => {
    if (isNullOrUndefined(selectedFormation)) {
      navigate("../");
      return;
    }

    GetAllCategories().then((categories) => {
      setCategories(categories);
    });
    
    GetAllForFormation(selectedFormation?.id!, (
      formationSections: FormationSection[],
      participants: Participant[],
      propList: Prop[],
      participantPositions: ParticipantPosition[],
      propPositions: PropPosition[],
      notePositions: NotePosition[]) => {
        try {
          var groupedParticipantPositions = groupByKey(participantPositions, "formationSectionId")
          updateEntitiesContext({
            participantList: indexByKey(participants, "id"),
            propList: indexByKey(propList, "id")
          });

          updatePositionContextState({
            participantPositions: groupedParticipantPositions,
            propPositions: groupByKey(propPositions, "formationSectionId"),
            notePositions: groupByKey(notePositions, "formationSectionId"),
          });

          const currentSections = (formationSections as Array<FormationSection>)
            .sort((a,b) => a.order - b.order);

          updateState({
            isLoading: false,
            previousSectionId: null,
            currentSections: currentSections,
            selectedSection: currentSections[0],
          });

          setSections(currentSections);
          
          // setOrderedSectionIds(currentSections.map(x => x.id));
          setAnimationPaths(generateAnimationPaths(
            currentSections,
            Object.values(groupedParticipantPositions).flat(),
            gridSize,
            selectedFormation?.topMargin,
            selectedFormation?.sideMargin));

          const leftPositions = Array.from({ length: (selectedFormation!.length ?? 10) + (selectedFormation?.bottomMargin ?? DEFAULT_BOTTOM_MARGIN)/2 })
            .map((_, col) => [-2, col]);
          
          const rightPositions = Array.from({ length: (selectedFormation?.length ?? 10) + (selectedFormation?.bottomMargin ?? DEFAULT_BOTTOM_MARGIN)/2 })
            .map((_, col) => [ selectedFormation!.width, col]);
      
          const topPositions = Array.from({ length: (selectedFormation?.width ?? DEFAULT_WIDTH) + (selectedFormation?.sideMargin ?? DEFAULT_SIDE_MARGIN) })
            .flatMap((_, row) =>
              Array.from({ length: 2 }).map((_, col) => [ row - (selectedFormation?.sideMargin ?? DEFAULT_SIDE_MARGIN)/2, col])
            )
      
          setMarginPositions({
            participants: topPositions,
            props: rightPositions,
            notes: leftPositions
          });
        } catch (e) {
          console.error('Error getting data:', e);
        }
      });
  }, []);

  function setValueOrDefault(defaultValue: number, value?: number) : number {
    return (value ?? -1) >= 0 ? value! : defaultValue
  }

  async function exportPdf() {
    setIsExporting(false);
    setExportProgress(100);

      await exportToPdf(
        exportName,
        selectedFormation!,
        sections.sort((a, b) => a.order - b.order),
        participantPositions,
        participantList,
        propPositions,
        propList,
        notePositions,
        categories,
        (progress: number) => {
          setExportProgress(progress);
        }
      );
      setIsExporting(false);
      setExportProgress(100);
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
          { 
            appMode === "edit" &&
            <div className='flex flex-row gap-0'>
              <FormationLeftPanel marginPositions={marginPositions}/>
              <div className='flex flex-1 h-full min-h-0 overflow-auto'>
                <FormationCanvas
                  ref={formationEditorRef}
                  width={setValueOrDefault(20, selectedFormation?.width)}
                  height={setValueOrDefault(20, selectedFormation?.length)}
                  topMargin={setValueOrDefault(DEFAULT_TOP_MARGIN, selectedFormation?.topMargin)}
                  bottomMargin={setValueOrDefault(DEFAULT_BOTTOM_MARGIN, selectedFormation?.bottomMargin)}
                  sideMargin={setValueOrDefault(DEFAULT_SIDE_MARGIN, selectedFormation?.sideMargin)}
                  setAnimationPaths={setAnimationPaths}
                  categories={categories}/>
                <FormationEditorToolbar/>
              </div>
              <FormationRightPanel exportFunc={(exportName: string) => {
                setExportName(exportName);
                exportPdf();
              }}/>
            </div>
          }
          {
            appMode === "view" &&
            <div className='flex flex-1 h-full min-h-0 px-5 py-2 overflow-auto'>
              <FormationCanvas
                ref={formationEditorRef}
                width={setValueOrDefault(20, selectedFormation?.width)}
                height={setValueOrDefault(20, selectedFormation?.length)}
                topMargin={setValueOrDefault(DEFAULT_TOP_MARGIN, selectedFormation?.topMargin)}
                bottomMargin={setValueOrDefault(DEFAULT_BOTTOM_MARGIN, selectedFormation?.bottomMargin)}
                sideMargin={setValueOrDefault(DEFAULT_SIDE_MARGIN, selectedFormation?.sideMargin)}
                setAnimationPaths={setAnimationPaths}
                categories={categories}/>
              <FormationViewToolbar
                changeSection={changeSection}
                firstSectionId={firstSectionId}
                lastSectionId={lastSectionId}
                selectedSectionId={selectedSectionId}
                export={() => {
                  exportPdf();
                }}/>
            </div>
          }
      <ExportProgressDialog
        exportName={exportName}
        isOpen={isExporting}
        progress={exportProgress}/>
    </div>
  </div>
  )
}
