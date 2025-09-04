import { ColorStyle } from "../themes/colours.ts"

export interface Position {
  id: string,
  formationSceneId: string,
  x2: number,
  y2: number,
  x: number,
  y: number,
  isSelected: boolean
}

export interface ParticipantPosition extends Position {
  participantId: string,
  categoryId?: string,
}

export interface PropPosition extends Position {
  propId: string,
  color?: ColorStyle,
  angle: number
}

export interface NotePosition extends Position {
  label: string,
  text: string,
  color?: ColorStyle,
  width: number,
  height: number
}