import { Participant } from "./Participant.ts"
import { Prop } from "./Prop"

export interface Position {
  id: string,
  formationSceneId: string,
  x: number,
  y: number,
}

export interface ParticipantPosition extends Position {
  participant: Participant,
  categoryId?: string,
}

export interface PropPosition extends Position {
  prop: Prop,
  displayName?: string
}