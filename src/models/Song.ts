import { ParticipantCategory } from "./ParticipantCategory";
import { SongSection } from "./SongSection";

export interface Song {
  id: string,
  name: string,
  order: number,
  sections: Array<SongSection>,
  categories: Record<string, ParticipantCategory>,
}