import { Formation } from "./Formation"
import { SongSection } from "./SongSection"

export interface FormationSongSection {
  id: string,
  songSectionId: string,
  songSection: SongSection,
  order: number,
  formationId: string,
  formation: Formation,
  version: number,
  head: number
}