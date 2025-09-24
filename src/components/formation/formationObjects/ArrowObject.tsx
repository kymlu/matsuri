import React, { useContext } from "react";
import { Arrow, Circle } from "react-konva";
import BaseFormationObject from "./BaseFormationObject.tsx";
import { basePalette, ColorStyle } from "../../../themes/colours.ts";
import { VisualSettingsContext } from "../../../contexts/VisualSettingsContext.tsx";
import { useEffect } from "react";
import { DO_NOT_UPDATE_POSITION_ATTR } from "../../../data/consts.ts";
import Konva from "konva";

export interface ArrowObjectProps {
  id: string,
  startX: number,
  startY: number,
  colour: ColorStyle,
  points: number[],
  onClick?: (isMoving?: boolean, multiSelect?: boolean) => void,
  updatePosition?: (x: number, y: number) => void,
  updatePoints?: (x: number, y: number, index: number) => void,
  savePoints?: () => void,
  draggable?: boolean,
  ref?: React.Ref<any>,
  arrowRef?: React.Ref<any>,
  selected?: boolean,
  isOnlyOneSelected?: boolean,
  tension: number,
  pointerAtBeginning: boolean,
  pointerAtEnding: boolean,
  pointerWidth: number,
  pointerLength: number,
  width: number,
}

export default function ArrowObject(props: ArrowObjectProps) {
  const {gridSize} = useContext(VisualSettingsContext);

  const circle1Ref = React.createRef<any>();
  const circle2Ref = React.createRef<any>();
  const circle3Ref = React.createRef<any>();

  useEffect(() => {
    if (props.isOnlyOneSelected) {
      if (circle1Ref?.current) {
        circle1Ref?.current.setAttr(DO_NOT_UPDATE_POSITION_ATTR, true);
      }
      if (circle2Ref?.current) {
        circle2Ref?.current.setAttr(DO_NOT_UPDATE_POSITION_ATTR, true);
      }
      if (circle3Ref?.current) {
        circle3Ref?.current.setAttr(DO_NOT_UPDATE_POSITION_ATTR, true);
      }
    }
  }, [props.isOnlyOneSelected]);

  function updatePoints(point: Konva.Node, index: number) {
    var x = props.ref && typeof props.ref !== "function" ? props.ref.current?.attrs.x : props.startX;
    var y = props.ref && typeof props.ref !== "function" ? props.ref.current?.attrs.y : props.startY;
    props.updatePoints?.(point.attrs.x + x, point.attrs.y + y, index);
  }

  return (
    <BaseFormationObject
      id={props.id}
      onClick={(isMoving?: boolean, multiSelect?: boolean) => props.onClick?.(isMoving, multiSelect)}
      updatePosition={props.updatePosition}
      draggable={props.draggable}
      startX={props.startX}
      startY={props.startY}
      ref={props.ref}>
      <Arrow
        ref={props.arrowRef}
        points={props.points}
        tension={props.tension}
        pointerAtBeginning={props.pointerAtBeginning}
        pointerAtEnding={props.pointerAtEnding}
        strokeWidth={props.width}
        stroke={props.colour.bgColour}
        fill={props.colour.bgColour}
        hitStrokeWidth={Math.max(props.width, 10)}
        pointerLength={props.width * props.pointerLength}
        pointerWidth={props.width * props.pointerWidth}
        />
      {
        props.isOnlyOneSelected && 
        <>
          <Circle
            ref={circle1Ref}
            x={props.points[0]}
            y={props.points[1]}
            stroke={basePalette.primary.main}
            strokeWidth={gridSize * 0.1}
            fill={basePalette.white}
            radius={gridSize * 0.1}
            draggable
            onDragMove={ e => updatePoints(e.currentTarget, 0)}
            onDragEnd={e => props.savePoints?.()}
            />
          <Circle
            ref={circle2Ref}
            x={props.points[2]}
            y={props.points[3]}
            stroke={basePalette.primary.main}
            strokeWidth={gridSize * 0.1}
            fill={basePalette.white}
            radius={gridSize * 0.1}
            onDragMove={ e => updatePoints(e.currentTarget, 2)}
            onDragEnd={e => props.savePoints?.()}
            draggable
            />
          {
            props.points.length === 6 &&
            <Circle
              ref={circle3Ref}
              x={props.points[4]}
              y={props.points[5]}
              stroke={basePalette.primary.main}
              strokeWidth={gridSize * 0.1}
              fill={basePalette.white}
              radius={gridSize * 0.1}
              onDragMove={ e => updatePoints(e.currentTarget, 4)}
              onDragEnd={e => props.savePoints?.()}
              draggable
              />
          }
        </>
      }
    </BaseFormationObject>
  )
}