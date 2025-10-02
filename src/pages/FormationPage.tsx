import React, { useContext, useEffect, useState } from 'react';
import { UserContext } from '../contexts/UserContext.tsx';
import { FormationSection } from '../models/FormationSection.ts';
import { isNullOrUndefined, roundToTenth, strEquals } from '../helpers/GlobalHelper.ts';
import { DEFAULT_BOTTOM_MARGIN, DEFAULT_SIDE_MARGIN, DEFAULT_TOP_MARGIN, DEFAULT_WIDTH, ICON } from '../data/consts.ts';
import { PositionContext } from '../contexts/PositionContext.tsx';
import { ArrowPosition, NotePosition, ParticipantPosition, PropPosition } from '../models/Position.ts';
import { EditorPageHeader } from '../components/EditorPageHeader.tsx';
import { ExportProgressDialog } from '../components/dialogs/ExportProgressDialog.tsx';
import { AnimationPath } from '../models/AnimationPath.ts';
import { generateAnimationPaths } from '../helpers/AnimationHelper.ts';
import { AnimationContext } from '../contexts/AnimationContext.tsx';
import FormationCanvas from '../components/formation/FormationCanvas.tsx';
import { useNavigate } from 'react-router-dom';
import { GetAllForFormation } from '../data/DataController.ts';
import { groupByKey, indexByKey } from '../helpers/GroupingHelper.ts';
import { Participant } from '../models/Participant.ts';
import { Prop } from '../models/Prop.ts';
import { exportToPdf } from '../helpers/ExportHelper.ts';
import { FormationToolbar } from '../components/formation/toolbars/FormationToolbar.tsx';
import { AppModeContext } from '../contexts/AppModeContext.tsx';
import { FormationContext } from '../contexts/FormationContext.tsx';
import FormationLeftPanel from '../components/editorFunctions/sidebars/FormationLeftPanel.tsx';
import FormationRightPanel from '../components/editorFunctions/sidebars/FormationRightPanel.tsx';
import { VisualSettingsContext } from '../contexts/VisualSettingsContext.tsx';
import { EntitiesContext } from '../contexts/EntitiesContext.tsx';
import { FormationType } from '../models/Formation.ts';
import { CategoryContext } from '../contexts/CategoryContext.tsx';
import { SettingsContext } from '../contexts/SettingsContext.tsx';
import { songList } from '../data/ImaHitotabi.ts';

export type MarginPositions = {
  participants: number[][],
  props: number[][],
  notes: number[][],
}

export default function FormationPage () {
  const userContext = useContext(UserContext);
  const {updateState, selectedSection} = useContext(UserContext);
  const {categories, updateCategoryContext} = useContext(CategoryContext);
  const {gridSize, followingId, updateVisualSettingsContext} = useContext(VisualSettingsContext);
  const {selectedFormation} = useContext(FormationContext);
  const {enableAnimation} = useContext(SettingsContext);
  const {appMode} = useContext(AppModeContext);
  const {participantPositions, propPositions, notePositions, arrowPositions, updatePositionContextState} = useContext(PositionContext);
  const {updateAnimationContext} = useContext(AnimationContext);
  const {updateEntitiesContext, participantList, propList} = useContext(EntitiesContext);

  const [selectedSectionId, setSelectedSectionId] = useState<string>("");
  const [firstSectionId, setFirstSectionId] = useState<string>("");
  const [lastSectionId, setLastSectionId] = useState<string>("");

  const [animationPaths, setAnimationPaths] = useState<AnimationPath[]>([]);

  const formationEditorRef = React.createRef<any>();
  const [exportName, setExportName] = useState<string>("");
  const [defaultExportName, setDefaultExportName] = useState<string>("");
  
  const navigate = useNavigate();

  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [exportProgress, setExportProgress] = useState<number>(0);
  const [marginPositions, setMarginPositions] = useState<MarginPositions>({participants: [], props: [], notes: []});
  const [followingPositions, setFollowingPositions] = useState<Record<string, ParticipantPosition> | null>(null);

  useEffect(() => {
    setDefaultExportName(userContext.selectedFestival?.name + (selectedFormation ? ` - ${selectedFormation.name}` : ''));
  }, [selectedFormation]);

  useEffect(() => {
    setFirstSectionId(userContext.currentSections?.sort((a, b) => a.order - b.order)[0]?.id ?? "");
    setLastSectionId(userContext.currentSections?.sort((a, b) => b.order - a.order)[0]?.id ?? "");
  }, [userContext.currentSections]);

  useEffect(() => {
    setSelectedSectionId(userContext.selectedSection?.id ?? "");
  }, [userContext.selectedSection]);
  
  useEffect(() => {
    if(appMode === "view") {
      setAnimationPaths(generateAnimationPaths(
        userContext.currentSections,
        Object.values(participantPositions).flat(),
        Object.values(propPositions).flat(),
        gridSize,
        selectedFormation?.topMargin,
        selectedFormation?.sideMargin));
    }
  }, [appMode, gridSize]);

  useEffect(() => {
    updateVisualSettingsContext({followingId: null});
  }, [appMode]);
  
  useEffect(() => {
    if (isNullOrUndefined(selectedFormation)) {
      navigate("../");
      return;
    }

    updateVisualSettingsContext({followingId: null});
    setFollowingPositions(null);

    updateCategoryContext({categories: songList[selectedFormation!.songId].categories});

    GetAllForFormation(selectedFormation?.id!, (
      formationSections: FormationSection[],
      participants: Participant[],
      propList: Prop[],
      participantPositions: ParticipantPosition[],
      propPositions: PropPosition[],
      notePositions: NotePosition[],
      arrowPositions: ArrowPosition[],
    ) => {
        try {
          var groupedParticipantPositions = groupByKey(participantPositions, "formationSectionId")
          var groupedPropPositions = groupByKey(propPositions, "formationSectionId")
          updateEntitiesContext({
            participantList: indexByKey(participants, "id"),
            propList: indexByKey(propList, "id")
          });

          updatePositionContextState({
            participantPositions: groupedParticipantPositions,
            propPositions: groupedPropPositions,
            notePositions: groupByKey(notePositions, "formationSectionId"),
            arrowPositions: groupByKey(arrowPositions, "formationSectionId"),
          });

          const currentSections = (formationSections as Array<FormationSection>)
            .sort((a,b) => a.order - b.order);

          updateState({
            isLoading: false,
            previousSectionId: null,
            currentSections: currentSections,
            selectedSection: currentSections[0],
          });

          setAnimationPaths(generateAnimationPaths(
            currentSections,
            Object.values(groupedParticipantPositions).flat(),
            Object.values(groupedPropPositions).flat(),
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

  async function exportPdf(followingId: string | null = null) {
    setIsExporting(true);
    setExportProgress(0);
    var fileName = defaultExportName;

    if(followingId) {
      fileName = fileName + ` - ${participantList[followingId].displayName}`;
    }

    setExportName(fileName);

    await exportToPdf(
      fileName,
      selectedFormation!,
      userContext.currentSections.sort((a, b) => a.order - b.order),
      participantPositions,
      participantList,
      propPositions,
      propList,
      notePositions,
      arrowPositions,
      categories,
      (progress: number) => {
        setExportProgress(progress);
      },
      followingId,
    );
    
    setIsExporting(false);
    setExportProgress(100);
  } 

  function changeSection(section?: FormationSection, isNext?: boolean) {
    const index = userContext.currentSections.sort((a, b) => a.order - b.order).findIndex(x => strEquals(selectedSectionId, x.id));
    const nextSection = section ?? userContext.currentSections.sort((a, b) => a.order - b.order)[index + (isNext ? 1 : -1)];
    const from = selectedSectionId;
    const to = nextSection.id;
    
    if (appMode === "edit") {
      updateState({
        isLoading: enableAnimation,
        previousSectionId: from,
        selectedSection: nextSection,
        selectedItems: [],
      });
    } else {
      const paths = animationPaths.find(x => strEquals(x.fromSectionId, from) && strEquals(x.toSectionId, to));
  
      if (paths) {
        const participantPaths = paths?.participantPaths;
        const propPaths = paths?.propPaths;
        if (participantPaths || propPaths) {
          updateAnimationContext({
            participantPaths: participantPaths,
            propPaths: propPaths,
            isAnimating: true
          });
        }
      }
  
      updateState({
        selectedSection: nextSection
      });
    }
  }

  return (
    <div className='h-full overflow-hidden'>
      <div className='h-full min-h-0 overflow-hidden grid grid-cols-1 portrait:grid-rows-[64px_calc(100svh-136px)_72px] landscape:grid-rows-[60px_calc(100svh-60px)]'>
        <EditorPageHeader/>
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
            </div>
            <FormationRightPanel exportFunc={(exportName: string) => {
              setDefaultExportName(exportName);
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
              categories={categories}
              setFollowingPositions={setFollowingPositions}/>
            {
              selectedSection && followingId && followingPositions && selectedFormation &&
              <div className="flex items-center flex-col absolute top-20 left-1/2 translate-x-[-50%] landscape:top-auto landscape:left-3 landscape:bottom-3 landscape:translate-x-0 rounded-md outline outline-grey-800 bg-grey-50 py-2 px-4">
                <span className='font-bold'>
                  {`${participantList[followingId].displayName}`}
                </span>
                <div className='flex flex-row gap-2'>
                  <div className='flex gap-1'>
                    <img src={ICON.heightBlack} className='size-6'/>
                    <span>{`${roundToTenth(selectedFormation.type === FormationType.parade ?
                      selectedFormation.length - followingPositions[selectedSection.id]?.y :
                      followingPositions[selectedSection.id]?.y)}m`}</span>
                  </div>
                  <div className='flex gap-1'>
                    <img src={ICON.arrowRangeBlack} className='size-6'/>
                    <span>{`${roundToTenth(Math.abs(selectedFormation.width/2 - followingPositions[selectedSection.id]?.x))}m`}</span>
                  </div>
                </div>
              </div>
            }
          </div>
        }
      <div className='col-start-1 row-start-3'>
        <FormationToolbar
          changeSection={changeSection}
          firstSectionId={firstSectionId}
          lastSectionId={lastSectionId}
          selectedSectionId={selectedSectionId}
          export={(followingId) => {
            exportPdf(followingId);
          }}/>
      </div>
      <ExportProgressDialog
        exportName={exportName}
        isOpen={isExporting}
        progress={exportProgress}/>
    </div>
  </div>
  )
}
