import React, { ReactNode, useContext } from "react";
import { Group } from "react-konva";
import Konva from "konva";
import { Shape, ShapeConfig } from "konva/lib/Shape";
import { Stage } from "konva/lib/Stage";
import { SettingsContext } from "../../../contexts/SettingsContext.tsx";
import { AppModeContext } from "../../../contexts/AppModeContext.tsx";
import { VisualSettingsContext } from "../../../contexts/VisualSettingsContext.tsx";
import { DO_NOT_UPDATE_POSITION_ATTR } from "../../../data/consts.ts";

export interface FormationObjectProps {
  id: string,
  children: ReactNode
  rotation?: number,
  startX: number,
  startY: number,
  updatePosition?: (x: number, y: number) => void,
  onClick: (isMoving?: boolean, multiselect?: boolean) => void,
  draggable?: boolean,
  onTransform?: (item: Shape<ShapeConfig> | Stage) => void,
  ref?: React.Ref<Konva.Group>,
}

export default function BaseFormationObject(props: FormationObjectProps) {
  const {appMode} = useContext(AppModeContext);
  const {gridSize} = useContext(VisualSettingsContext);
  const snapSize = gridSize/2;
  const {enableGridSnap} = useContext(SettingsContext);

  function onClick(e?: MouseEvent) {
    if (!props.draggable) return;

    var multiSelect = e?.altKey || e?.ctrlKey || e?.metaKey || e?.shiftKey;
    props.onClick?.(false, multiSelect);
  }
  
  return (
    <Group
      id={props.id} 
      ref={props.ref}
      draggable={props.draggable}
      rotation={props.rotation ?? 0}
      x={props.startX}
      y={props.startY}
      onClick={e => {onClick(e.evt)}}
      onTap={e => {onClick()}}
      onDragStart={e => {
        props.onClick(true);
        
        if (appMode === "view") {
          e.target.stopDrag();
        }
      }}
      onDragEnd={e => {
        if (appMode === "view" || e.target.getAttr(DO_NOT_UPDATE_POSITION_ATTR) === true) {
          return;
        }
        
        const node = e.target;
        
        var x = enableGridSnap ? Math.round(node.x() / snapSize) * snapSize : node.x();
        var y = enableGridSnap ? Math.round(node.y() / snapSize) * snapSize : node.y();
        node.to({
          x: x,
          y: y,
          onFinish: () => {
            props.updatePosition &&
            props.updatePosition(node.attrs.x, node.attrs.y)
          }
        });
      }}>
      {props.children}
    </Group>
  )
}