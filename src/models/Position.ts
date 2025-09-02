import { ColorStyle } from "../themes/colours.ts"
import { FormationSongSection } from "./FormationSection.ts"
import { Participant } from "./Participant.ts"
import { ParticipantCategory } from "./ParticipantCategory.ts"
import { Prop } from "./Prop"

export interface Position {
  id: string,
  formationScene: FormationSongSection,
  x2: number,
  y2: number,
  x: number,
  y: number,
  isSelected: boolean
}

export interface ParticipantPosition extends Position {
  participant: Participant,
  categoryId?: string,
  category: ParticipantCategory | undefined,
}

export interface PropPosition extends Position {
  prop: Prop,
  displayName?: string,
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