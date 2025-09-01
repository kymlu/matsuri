import { Formation } from "./Formation"
import { SongSection } from "./SongSection"

export interface FormationSongSection {
  id: string,
  songSectionId: string,
  songSection: SongSection,
  formationId: string,
  formation: Formation,
  version: number,
  head: number
}