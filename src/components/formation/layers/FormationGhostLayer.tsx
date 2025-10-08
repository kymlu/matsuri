import React, { useContext } from "react"
import { Layer } from "react-konva"
import { objectColorSettings } from "../../../themes/colours.ts"
import ParticipantObject from "../formationObjects/ParticipantObject.tsx"
import PropObject from "../formationObjects/PropObject.tsx"
import { getPixel } from "../../../lib/helpers/FormationHelper.ts"
import { ParticipantPosition, PropPosition } from "../../../models/Position.ts"
import { Participant } from "../../../models/Participant.ts"
import { Prop } from "../../../models/Prop.ts"
import { ParticipantCategory } from "../../../models/ParticipantCategory.ts"
import { VisualSettingsContext } from "../../../contexts/VisualSettingsContext.tsx"

export type FormationGhostLayerProps = {
  topMargin: number,
  bottomMargin: number,
  sideMargin: number,
  participants: Record<string, Participant>,
  props: Record<string, Prop>,
  partPositions: ParticipantPosition[],
  propPositions: PropPosition[],
  categories: Record<string, ParticipantCategory>,
}

export function FormationGhostLayer(props: FormationGhostLayerProps) {
  const {gridSize} = useContext(VisualSettingsContext);

  return (
    <Layer
      opacity={0.3}
      listening={false}>
      {
        props.propPositions
          ?.map(placement =>
            {
              const prop = props.props[placement.propId];
              if (!prop) return <></>;

              return <PropObject 
                id={"ghost" + placement.id}
                key={placement.id}
                name={prop.name}
                colour={prop.color ?? objectColorSettings.purpleLight} 
                length={prop.length}
                startX={getPixel(gridSize, placement.x, props.sideMargin)} 
                startY={getPixel(gridSize, placement.y, props.topMargin)}
                rotation={placement.angle} 
              />
            }
          )
      } 
      { props.partPositions
          ?.map(placement => 
            {
              const participant = props.participants[placement.participantId];
              if (!participant) return <></>;

              return <ParticipantObject 
                id={"ghost" + placement.id}
                key={placement.id}
                name={participant.displayName} 
                colour={placement.categoryId ? props.categories[placement.categoryId]?.color ?? objectColorSettings["amberLight"] : objectColorSettings["amberLight"]} 
                startX={getPixel(gridSize, placement.x, props.sideMargin)} 
                startY={getPixel(gridSize, placement.y, props.topMargin)}
					      isPlaceholder={props.participants[placement.participantId]?.isPlaceholder}
              />
            }
        )
      }
    </Layer>
  )
}