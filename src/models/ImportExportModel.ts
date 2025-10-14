import { Festival } from "./Festival.ts"
import { Formation } from "./Formation.ts"
import { FormationSection } from "./FormationSection.ts"
import { Participant } from "./Participant.ts"
import { ArrowPosition, NotePosition, ParticipantPosition, PropPosition } from "./Position.ts"
import { Prop } from "./Prop.ts"

export type ImportExportModel = {
  festival: Festival[],
  formationSections: FormationSection[],
  participants: Participant[],
  participantPositions: ParticipantPosition[],
  props: Prop[],
  propPositions: PropPosition[],
  arrowPositions: ArrowPosition[],
  notes: NotePosition[],
}

export type FestivalMeta = {
  id: string,
  version: number,
  isVisible: boolean,
}

export type FestivalResources = {
  participants: Participant[],
  props: Prop[],
}

export type FormationDetails = {
  sections: FormationSection[],
  participants: ParticipantPosition[],
  props: PropPosition[],
  arrows: ArrowPosition[],
  notes: NotePosition[],
}