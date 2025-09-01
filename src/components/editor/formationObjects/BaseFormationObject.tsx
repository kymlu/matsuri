import React, { ReactNode, useContext, useEffect, useRef } from "react";
import { Group, Transformer } from "react-konva";
import { BLOCK_SNAP_SIZE } from "../../../data/consts.ts";
import { UserContext } from "../../../contexts/UserContext.tsx";
import Konva from "konva";
import { basePalette, objectPalette } from "../../../themes/colours.ts";

export interface FormationObjectProps {
  children: ReactNode
  startX: number,
  startY: number,
  rotation?: number,
  updatePosition?: (x: number, y: number) => void,
  isSelected?: boolean,
  onClick: (boolean?) => void,
  rotateEnabled?: boolean
  resizeEnabled?: boolean
}

export default function BaseFormationObject(props: FormationObjectProps) {
  const {snapToGrid} = useContext(UserContext);
  const transformerRef = useRef<Konva.Transformer>(null);
  const groupRef = useRef<Konva.Group>(null);
  useEffect(() => {
    if(props.isSelected && groupRef.current){
      transformerRef?.current!.nodes([groupRef.current]);
    } else {
      transformerRef?.current!.nodes([]);
    }
  }, [props.isSelected])

  function onClick() {
    props.onClick?.();
  }
  
  return (
    <div>
      <Group
        ref={groupRef}
        draggable 
        rotation={props.rotation ?? 0}
        onClick={e => {onClick()}}
        onTap={e => {onClick()}}
        onDragEnd={e => {
          props.onClick(true);
          const node = e.target;
          
          if (snapToGrid){
            var x = Math.round(node.x() / BLOCK_SNAP_SIZE) * BLOCK_SNAP_SIZE;
            var y = Math.round(node.y() / BLOCK_SNAP_SIZE) * BLOCK_SNAP_SIZE;
            node.to({
              x: x,
              y: y,
              onFinish: () => {
                props.updatePosition &&
                props.updatePosition(node.attrs.x, node.attrs.y)
              }
            });
          }
        }}>
        {props.children}
      </Group>
      
      <Transformer
        ref={transformerRef}
        rotateEnabled={props.rotateEnabled}
        resizeEnabled={props.resizeEnabled}
        borderStrokeWidth={2}
        borderStroke={basePalette.primary.main}
        anchorStroke={basePalette.primary.main}/>
      
    </div>
  )
}