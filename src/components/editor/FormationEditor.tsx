import React, { useContext, useEffect, useImperativeHandle, useRef } from "react";
import { Stage } from "react-konva";
import { PositionContext } from "../../contexts/PositionContext.tsx";
import { UserContext } from "../../contexts/UserContext.tsx";
import FormationGridLayer from "./layers/FormationGridLayer.tsx";
import { isNullOrUndefined } from "../../helpers/GlobalHelper.ts";
import { AnimationContext } from "../../contexts/AnimationContext.tsx";
import { FormationContext } from "../../contexts/FormationContext.tsx";
import Konva from "konva";
import { FormationType } from "../../models/Formation.ts";
import { getAnimationPaths } from "../../helpers/AnimationHelper.ts";
import jsPDF from "jspdf";
import { ExportContext } from "../../contexts/ExportContext.tsx";
import { FormationGhostLayer } from "./layers/FormationGhostLayer.tsx";
import { FormationAnimationLayer } from "./layers/FormationAnimationLayer.tsx";
import { FormationEditLayer } from "./layers/FormationEditLayer.tsx";
import { SettingsContext } from "../../contexts/SettingsContext.tsx";
import { useNavigate } from "react-router-dom";
import { dbController } from "../../data/DBProvider.tsx";
import { FormationSection } from "../../models/FormationSection.ts";
import { Participant } from "../../models/Participant.ts";
import { ParticipantPosition, PropPosition, NotePosition } from "../../models/Position.ts";
import { Prop } from "../../models/Prop.ts";
import { GetAllForFormation } from "../../data/DataController.ts";
import { CategoryContext } from "../../contexts/CategoryContext.tsx";
import { ParticipantCategory } from "../../models/ParticipantCategory.ts";
import { exportToPdf } from "../../helpers/ExportHelper.ts";

export interface FormationEditorProps {
  height: number,
  width: number,
  topMargin: number,
  bottomMargin: number,
  sideMargin: number,
  ref: React.Ref<any>,
}

export default function FormationEditor(props: FormationEditorProps) {
  const editLayerRef = React.createRef<any>();
  const stageRef = useRef(null);
  const userContext = useContext(UserContext);
  const {isAnimating, updateAnimationContext} = useContext(AnimationContext);
  const {updateExportContext} = useContext(ExportContext);
  const {participantPositions, propPositions, notePositions, updatePositionState} = useContext(PositionContext);
  const {updateFormationContext, participantList, propList} = useContext(FormationContext);
  const {selectedFormation, selectedSection, isLoading, currentSections, compareMode, updateState, gridSize} = useContext(UserContext);
  const {enableAnimation} = useContext(SettingsContext);
  const canvasHeight = (props.height + props.topMargin + props.bottomMargin) * gridSize;
  const canvasWidth = (props.width + props.sideMargin * 2) * gridSize;
  const {categories, updateCategoryContext} = useContext(CategoryContext);

  const navigate = useNavigate()

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

  // todo: remove empty grid gap when switching sections

  useEffect(() => {
    if (isNullOrUndefined(selectedFormation)) {
      navigate("../");
      return;
    }
    
    GetAllForFormation(selectedFormation?.id!, (
      formationSections: FormationSection[],
      participants: Participant[],
      props: Prop[],
      participantPositions: ParticipantPosition[],
      propPositions: PropPosition[],
      notePositions: NotePosition[]) => {
        try {
          updateFormationContext({
            participantList: participants as Array<Participant>,
            propList: props as Array<Prop>
          });

          updatePositionState({
            participantPositions: participantPositions,
            propPositions: propPositions,
            notePositions: notePositions
          });

          const currentSections = (formationSections as Array<FormationSection>)
            .sort((a,b) => a.order - b.order);

          updateState({
            isLoading: false,
            previousSectionId: null,
            currentSections: currentSections,
            selectedSection: currentSections[0],
          });
        } catch (e) {
          console.error('Error parsing user from localStorage:', e);
        }
      });
  }, [userContext.selectedFormation]);

  useEffect(() => {
    if(isNullOrUndefined(selectedSection)) return;
    
    if(enableAnimation && userContext.previousSectionId &&userContext.selectedSection) {
      updateState({isLoading: true});
      var animationPaths = getAnimationPaths([userContext.previousSectionId!,
        userContext.selectedSection!.id],
        gridSize,
        participantPositions,
        props.topMargin,
        props.sideMargin)
      updateState({isLoading: false});
      updateAnimationContext({paths: animationPaths, isAnimating: true});
    }
  }, [userContext.selectedSection]);

  useImperativeHandle(props.ref, () => ({
    async exportToPdf(exportName: string) {
      if (isNullOrUndefined(stageRef.current) || !selectedFormation) return;
      
      updateExportContext({isExporting: true, exportProgress: 0});
      
      await exportToPdf(
        exportName,
        selectedFormation,
        currentSections.sort((a, b) => a.order - b.order),
        participantPositions,
        participantList,
        propPositions,
        propList,
        notePositions,
        categories,
        (progress: number) => {
          updateExportContext({exportProgress: progress});
        }
      );
      updateExportContext({isExporting: false, exportProgress: 100});
    }
  }));

  return (
    <div className="m-auto">
      <Stage
        ref={stageRef}
        width={canvasWidth}
        height={canvasHeight}
        onMouseDown={(e) => { editLayerRef.current?.onMouseDown(e) }}
        onMouseUp={() => { editLayerRef.current?.onMouseUp() }}
        onMouseMove={(e) => { editLayerRef.current?.onMouseMove(e) }}
        onClick={(event) => {
          if (event.target === event.target.getStage()) {
            editLayerRef.current?.clearSelections();
          }
        }}>
        <FormationGridLayer
          canvasHeight={canvasHeight}
          canvasWidth={canvasWidth}
          height={props.height}
          width={props.width}
          topMargin={props.topMargin}
          bottomMargin={props.bottomMargin}
          sideMargin={props.sideMargin}
          isParade={selectedFormation?.type === FormationType.parade}/>
          
        { compareMode !== "none" &&
          <FormationGhostLayer
            topMargin={props.topMargin}
            bottomMargin={props.bottomMargin}
            sideMargin={props.sideMargin}/>
        }
        
        {
          !isLoading && !isAnimating &&
          <FormationEditLayer 
            topMargin={props.topMargin}
            bottomMargin={props.bottomMargin}
            sideMargin={props.sideMargin}
            ref={editLayerRef}/>
        }
        {
          !isLoading && isAnimating &&
          <FormationAnimationLayer
            topMargin={props.topMargin}
            bottomMargin={props.bottomMargin}
            sideMargin={props.sideMargin}/>
        }
      </Stage>
    </div>
  )
}