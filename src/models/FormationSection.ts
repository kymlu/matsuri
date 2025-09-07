import { Formation } from "./Formation"
import { SongSection } from "./SongSection"

export interface FormationSongSection {
  id: string,
  displayName: string,
  songSectionId: string,
  order: number,
  formationId: string,
  version: number,
  head: number
}