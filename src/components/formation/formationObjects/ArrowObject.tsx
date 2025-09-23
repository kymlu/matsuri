import React, { useContext } from "react";
import { Arrow, Circle, Rect, Text } from "react-konva";
import BaseFormationObject from "./BaseFormationObject.tsx";
import { basePalette, ColorStyle } from "../../../themes/colours.ts";
import { VisualSettingsContext } from "../../../contexts/VisualSettingsContext.tsx";

export interface ArrowObjectProps {
  id: string,
  startX: number,
  startY: number,
  colour: ColorStyle,
  points: number[],
  onClick?: (isMoving?: boolean, multiSelect?: boolean) => void,
  updatePosition?: (x: number, y: number) => void,
  draggable?: boolean,
  ref?: React.Ref<any>,
  selected?: boolean,
  isOnlyOneSelected?: boolean,
  tension: number,
  pointerAtBeginning: boolean,
  pointerAtEnding: boolean,
  width: number,
}

export default function ArrowObject(props: ArrowObjectProps) {
  const {gridSize} = useContext(VisualSettingsContext);

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
        points={props.points}
        tension={props.tension}
        pointerAtBeginning={props.pointerAtBeginning}
        pointerAtEnding={props.pointerAtEnding}
        strokeWidth={props.width}
        stroke={props.colour.bgColour}
        fill={props.colour.bgColour}
        hitStrokeWidth={Math.max(props.width, 10)}
        pointerLength={props.width * 2}
        pointerWidth={props.width * 3}
        />
      {
        props.isOnlyOneSelected && 
        <>
          <Circle
            x={props.points[0]}
            y={props.points[1]}
            stroke={basePalette.primary.main}
            strokeWidth={gridSize * 0.1}
            radius={gridSize * 0.25}
            draggable
            onDragMove={
              () => {
                // todo: update this item
                // todo: update db
                // todo: update context
              }
            }
            />
          <Circle
            x={props.points[2]}
            y={props.points[3]}
            stroke={basePalette.primary.main}
            strokeWidth={gridSize * 0.1}
            radius={gridSize * 0.25}
            draggable
            />
          {
            props.points.length === 6 &&
            <Circle
              x={props.points[4]}
              y={props.points[5]}
              stroke={basePalette.primary.main}
              strokeWidth={gridSize * 0.1}
              radius={gridSize * 0.25}
              draggable
              />
          }
        </>
      }
    </BaseFormationObject>
  )
}