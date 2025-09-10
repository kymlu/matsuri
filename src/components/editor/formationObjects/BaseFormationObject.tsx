import React, { ReactNode, useContext } from "react";
import { Group } from "react-konva";
import Konva from "konva";
import { Shape, ShapeConfig } from "konva/lib/Shape";
import { Stage } from "konva/lib/Stage";
import { UserContext } from "../../../contexts/UserContext.tsx";

export interface FormationObjectProps {
  id: string,
  children: ReactNode
  rotation?: number,
  updatePosition?: (x: number, y: number) => void,
  onClick: (forceSelect?: boolean, multiselect?: boolean) => void,
  draggable?: boolean,
  onTransform?: (item: Shape<ShapeConfig> | Stage) => void,
  ref?: React.Ref<Konva.Group>,
}

export default function BaseFormationObject(props: FormationObjectProps) {
  const snapSize = useContext(UserContext).gridSize/2;
  function onClick(e?: MouseEvent) {
    if (!props.draggable) return;

    var multiSelect = e?.altKey || e?.ctrlKey || e?.metaKey;
    props.onClick?.(false, multiSelect);
  }
  
  return (
    <Group
      id={props.id} 
      ref={props.ref}
      draggable={props.draggable}
      rotation={props.rotation ?? 0}
      onClick={e => {onClick(e.evt)}}
      onTap={e => {onClick()}}
      onDragEnd={e => { // TODO: fix to always save position properly
        props.onClick(true);
        const node = e.target;
        
        var x = Math.round(node.x() / snapSize) * snapSize;
        var y = Math.round(node.y() / snapSize) * snapSize;
        node.to({
          x: x,
          y: y,
          onFinish: () => {
            props.updatePosition &&
            props.updatePosition(node.attrs.x, node.attrs.y)
          }
        });
        console.log(x, y);
      }}>
      {props.children}
    </Group>
  )
}