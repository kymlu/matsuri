import { ParticipantCategory } from "./ParticipantCategory";
import { SongSection } from "./SongSection";

export interface Song {
  name: string,
  sections: Array<SongSection>,
  categories: Record<string, ParticipantCategory>,
}