import React, { useContext, useEffect, useImperativeHandle, useRef } from "react";
import { Stage } from "react-konva";
import { PositionContext } from "../../contexts/PositionContext.tsx";
import { UserContext } from "../../contexts/UserContext.tsx";
import FormationGridLayer from "./FormationGridLayer.tsx";
import { isNullOrUndefined } from "../helpers/GlobalHelper.ts";
import { useState } from "react";
import { AnimationContext } from "../../contexts/AnimationContext.tsx";
import { FormationContext } from "../../contexts/FormationContext.tsx";
import Konva from "konva";
import { FormationType } from "../../models/Formation.ts";
import { getAnimationPaths } from "../helpers/AnimationHelper.ts";
import jsPDF from "jspdf";
import { ExportContext } from "../../contexts/ExportContext.tsx";
import { FormationGhostLayer } from "./FormationGhostLayer.tsx";
import { FormationAnimationLayer } from "./FormationAnimationLayer.tsx";
import { FormationEditLayer } from "./FormationEditLayer.tsx";
import { SettingsContext } from "../../contexts/SettingsContext.tsx";

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
  const {participantPositions} = useContext(PositionContext);
  useContext(FormationContext);
  const {selectedFormation, selectedSection, isLoading, currentSections, compareMode, updateState, gridSize} = useContext(UserContext);
  const {enableAnimation} = useContext(SettingsContext);
  const canvasHeight = (props.height + props.topMargin + props.bottomMargin) * gridSize;
  const canvasWidth = (props.width + props.sideMargin * 2) * gridSize;

  // todo: remove empty grid gap when switching sections
  useEffect(() => {
    if(isNullOrUndefined(selectedSection)) return;
    
    if(enableAnimation && userContext.previousSectionId &&userContext.selectedSection) {
      updateState({isLoading: true});
      getAnimationPaths([userContext.previousSectionId!,
        userContext.selectedSection!.id],
        gridSize,
        participantPositions,
        props.topMargin,
        props.sideMargin)
        .then((animationPaths) => {
          updateState({isLoading: false});
          updateAnimationContext({paths: animationPaths, isAnimating: true});
        });
    }
  }, [userContext.selectedSection]);

  useImperativeHandle(props.ref, () => ({
    async exportToPdf(exportName: string) {
      if (isNullOrUndefined(stageRef.current)) return;
      updateExportContext({isExporting: true, exportProgress: 0});
      var stage = (stageRef.current! as Konva.Stage);
      const pdf = new jsPDF({
        orientation: stage.width() > stage.height() ? "landscape" : "portrait",
        unit: "px",
        format: [stage.width()/2, stage.height()/2]});

      console.log("generating ", exportName);
      for (let i = 0; i < currentSections.length; i++) {
        const section = currentSections[i];
    
        updateState({
          selectedSection: section,
          previousSectionId: null,
          selectedItems: [],
          compareMode: "none",
        });
    
        await new Promise<void>((resolve) => {
          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              resolve();
            });
          });
        });
    
        console.log("Exporting section", section.displayName);
    
        // todo: manually draw all objects to reduce file size
        const dataUrl = stage.toDataURL({ pixelRatio: 2 });
        // note on pixel ratio: using 2 here has a good quality, but the file size can be quite large
        // using 1 gives a smaller file size, but the quality is quite poor
    
        // todo: support japanese
        // pdf.setLanguage("ja");
        // https://qiita.com/hidepon4649/items/df7dbea48c4dd3049ef9

        pdf.addImage(
          dataUrl,
          0,
          0,
          stage.width()/2,
          stage.height()/2,
        );

        updateExportContext({exportProgress: Math.round(((i + 1) / currentSections.length) * 100)});

        if (i < currentSections.length - 1) {
          pdf.addPage();
        }
      }
    
      pdf.save(exportName ?? "formation.pdf");
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