import { Formation } from "./Formation"
import { SongSection } from "./SongSection"

export interface FormationSongSection {
  id: string,
  songSectionId: string,
  songSection: SongSection | null,
  formationId: string,
  formation: Formation | null,
  version: number,
  head: number
}