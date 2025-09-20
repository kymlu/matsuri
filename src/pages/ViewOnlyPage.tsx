import React, { useContext, useEffect, useState } from 'react';
import { UserContext } from '../contexts/UserContext.tsx';
import { useNavigate } from 'react-router-dom';
import FormationEditor from '../components/editor/FormationEditor.tsx';
import { dbController } from '../data/DBProvider.tsx';
import { ParticipantCategory } from '../models/ParticipantCategory.ts';
import { CategoryContext } from '../contexts/CategoryContext.tsx';
import { FormationSection } from '../models/FormationSection.ts';
import { isNullOrUndefined, strEquals } from '../components/helpers/GlobalHelper.ts';
import { DEFAULT_BOTTOM_MARGIN, DEFAULT_SIDE_MARGIN, DEFAULT_TOP_MARGIN, DEFAULT_WIDTH, GRID_SIZE_INCREMENT, ICON, MAX_GRID_SIZE, MIN_GRID_SIZE } from '../data/consts.ts';
import { FormationContext } from '../contexts/FormationContext.tsx';
import { Prop } from '../models/Prop.ts';
import { Participant } from '../models/Participant.ts';
import { ExportContext } from '../contexts/ExportContext.tsx';
import { PositionContext } from '../contexts/PositionContext.tsx';
import { ParticipantPosition, PropPosition, NotePosition } from '../models/Position.ts';
import { EditorPageHeader } from '../components/EditorPageHeader.tsx';
import { CustomToolbar, CustomToolbarGroup, CustomToolbarSeparator } from '../components/CustomToolbar.tsx';
import { CustomToolbarButton } from '../components/CustomToolbarButton.tsx';
import { ExportProgressDialog } from '../components/dialogs/ExportProgressDialog.tsx';
import { AnimationPath } from '../models/AnimationPath.ts';
import { getAnimationPaths } from '../components/helpers/AnimationHelper.ts';
import { AnimationContext } from '../contexts/AnimationContext.tsx';

export default function ViewOnlyPage () {
  const userContext = useContext(UserContext);
  const {updateFormationContext} = useContext(FormationContext);
  const {selectedFormation, updateState} = useContext(UserContext);
  const {updatePositionState, participantPositions} = useContext(PositionContext);
  const {updateCategoryContext} = useContext(CategoryContext);
  const {isExporting, exportProgress} = useContext(ExportContext);
  const {updateAnimationContext} = useContext(AnimationContext);

  const [selectedSectionId, setSelectedSectionId] = useState<string>("");
  const [firstSectionId, setFirstSectionId] = useState<string>("");
  const [lastSectionId, setLastSectionId] = useState<string>("");
  const [showPrevious, setShowPrevious] = useState<boolean>(false);

  const [animationPaths, setAnimationPaths] = useState<AnimationPath[]>([]);

  const navigate = useNavigate()
  const formationEditorRef = React.createRef<any>();
  const [exportName, setExportName] = useState<string>("");

  useEffect(() => {
    setExportName(userContext.selectedFestival?.name + (userContext.selectedFormation ? ` - ${userContext.selectedFormation.name}` : ''));
  }, [userContext.selectedFestival, userContext.selectedFormation])

  useEffect(() => {
    setFirstSectionId(userContext.currentSections.sort((a, b) => a.order - b.order)[0]?.id ?? "");
    setLastSectionId(userContext.currentSections.sort((a, b) => b.order - a.order)[0]?.id ?? "");
  }, [userContext.currentSections]);

  useEffect(() => {
    setSelectedSectionId(userContext.selectedSection?.id ?? "");
  }, [userContext.selectedSection]);
  
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
        var participantPositions = participantPosition as Array<ParticipantPosition>;

        updateFormationContext({
          participantList: participants as Array<Participant>,
          propList: props as Array<Prop>
        });

        updatePositionState({
          participantPositions: participantPositions,
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

        generateAnimationPaths(currentSections, participantPositions);
      } catch (e) {
        console.error('Error parsing user from localStorage:', e);
      }
    });
  }, [userContext.selectedFormation]);

  useEffect(() => {
    generateAnimationPaths(userContext.currentSections, participantPositions);
  }, [userContext.gridSize]);

  function generateAnimationPaths(sections: Array<FormationSection>, participantPositions: Array<ParticipantPosition>){
    var newPaths: AnimationPath[] = [];
        
    Array.from({length: sections.length - 1}).forEach((_, i) => {
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
          <div className='flex justify-center flex-1 h-full min-h-0 px-5 py-2 overflow-auto'>
            <FormationEditor
              ref={formationEditorRef}
              width={setValueOrDefault(20, selectedFormation?.width)}
              height={setValueOrDefault(20, selectedFormation?.length)}
              topMargin={setValueOrDefault(DEFAULT_TOP_MARGIN, selectedFormation?.topMargin)}
              bottomMargin={setValueOrDefault(DEFAULT_BOTTOM_MARGIN, selectedFormation?.bottomMargin)}
              sideMargin={setValueOrDefault(DEFAULT_SIDE_MARGIN, selectedFormation?.sideMargin)}/>
            <CustomToolbar>
              <CustomToolbarGroup>
                <CustomToolbarButton
                  iconLeft
                  text="前へ"
                  disabled={strEquals(firstSectionId, selectedSectionId)}
                  iconFileName={ICON.chevronBackwardBlack}
                  onClick={() => {changeSection(false)}}/>
                <CustomToolbarButton
                  text="次へ"
                  disabled={strEquals(lastSectionId, selectedSectionId)}
                  iconFileName={ICON.chevronForwardBlack}
                  onClick={() => {changeSection(true)}}/>
              </CustomToolbarGroup>
              { false && userContext.selectedItems.length > 0 &&  // todo implement
                <>
                  <CustomToolbarSeparator/>
                  <CustomToolbarGroup>
                    <CustomToolbarButton
                      text="フォーカス"
                      iconFileName={ICON.familiarFaceAndZoneBlack}
                      onClick={() => {}}/>
                  </CustomToolbarGroup>
                </>
              }
              <CustomToolbarSeparator/>
              <CustomToolbarGroup>
                <CustomToolbarButton
                  isToggle
                  text="メモ表示"
                  iconFileName={ICON.noteStackBlack}
                  defaultValue={userContext.showNotes}
                  onClick={() => updateState({showNotes: !userContext.showNotes})}/>
                <CustomToolbarButton isToggle
                  text="前の隊列表示"
                  iconFileName={ICON.footprintBlack}
                  defaultValue={showPrevious}
                  onClick={() => {
                    updateState({compareMode: showPrevious ? "none" : "previous"})
                    setShowPrevious(prev => !prev);
                  }}/>
              </CustomToolbarGroup>
              <CustomToolbarSeparator/>
              <CustomToolbarGroup>
                <CustomToolbarButton
                  iconFileName={ICON.zoomOutBlack}
                  onClick={() => {
                    updateState({gridSize: userContext.gridSize - GRID_SIZE_INCREMENT});
                  }}
                  disabled={userContext.gridSize <= MIN_GRID_SIZE}/>
                <CustomToolbarButton
                  iconFileName={ICON.zoomInBlack}
                  onClick={() => {
                    updateState({gridSize: userContext.gridSize + GRID_SIZE_INCREMENT});
                  }}
                  disabled={userContext.gridSize >= MAX_GRID_SIZE}/>
              </CustomToolbarGroup>
              <CustomToolbarSeparator/>
              <CustomToolbarGroup>
                <CustomToolbarButton
                  text="エクスポート"
                  iconFileName={ICON.fileExportBlack}
                  onClick={() => {
                    formationEditorRef.current?.exportToPdf(exportName);
                  }}/>
              </CustomToolbarGroup>
            </CustomToolbar>
          </div>
        </div>
        <ExportProgressDialog
          exportName={exportName}
          isOpen={isExporting}
          progress={exportProgress}/>
      </div>
    )
}
