import { SongSection } from "./SongSection";

export interface Song {
  id: string,
  name: string,
  sections: Array<SongSection>
}