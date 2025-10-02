import { Festival } from "./Festival.ts"
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