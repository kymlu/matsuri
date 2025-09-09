import React, { ReactNode, useContext, useEffect, useRef } from "react";
import { Group, Transformer } from "react-konva";
import Konva from "konva";
import { basePalette } from "../../../themes/colours.ts";
import { Shape, ShapeConfig } from "konva/lib/Shape";
import { Stage } from "konva/lib/Stage";
import { UserContext } from "../../../contexts/UserContext.tsx";

export interface FormationObjectProps {
  children: ReactNode
  startX: number,
  startY: number,
  rotation?: number,
  updatePosition?: (x: number, y: number) => void,
  isSelected?: boolean,
  onClick: (forceSelect?: boolean) => void,
  rotateEnabled?: boolean
  resizeEnabled?: boolean,
  draggable?: boolean,
  onTransform?: (item: Shape<ShapeConfig> | Stage) => void,
  ref?: React.Ref<any>,
}

export default function BaseFormationObject(props: FormationObjectProps) {
  const transformerRef = useRef<Konva.Transformer>(null);
  const groupRef = useRef<Konva.Group>(null);
  const snapSize = useContext(UserContext).gridSize/2;

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
    <Group ref={props.ref}>
      <Group
        ref={groupRef}
        draggable={props.draggable}
        rotation={props.rotation ?? 0}
        onClick={e => {onClick()}}
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
      
      <Transformer
        ref={transformerRef}
        rotateEnabled={props.rotateEnabled}
        resizeEnabled={props.resizeEnabled}
        borderStrokeWidth={2}
        borderStroke={basePalette.primary.main}
        anchorStrokeWidth={2}
        anchorStroke={basePalette.primary.main}
        rotationSnaps={[
          0, 15, 30, 45, 60, 75, 90, 105, 120, 135, 150, 165,
          180, 195, 210, 225, 240, 255,
          270, 285, 300, 315, 330, 345, 360
        ]}
        rotationSnapTolerance={10}
        onTransformEnd={(event) => { 
          console.log("rotation is broken");
          console.log(event.target);
          //props.onTransform?.(event.target);
        }}/>
    </Group>
  )
}