import { Festival } from "./Festival.ts"
import { FormationSection } from "./FormationSection.ts"
import { Participant } from "./Participant.ts"
import { ParticipantCategory } from "./ParticipantCategory.ts"
import { NotePosition, ParticipantPosition, PropPosition } from "./Position.ts"
import { Prop } from "./Prop.ts"
import { Song } from "./Song.ts"

export type ImportExportModel = {
  song: Song[],
  festival: Festival[],
  formationSections: FormationSection[],
  participants: Participant[],
  categories: ParticipantCategory[],
  participantPositions: ParticipantPosition[],
  props: Prop[],
  propPositions: PropPosition[],
  notes: NotePosition[],
}