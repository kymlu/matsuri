import { ColorStyle } from "../themes/colours";

// todo: might have to be on a song level
export interface ParticipantCategory {
  id: string,
  name: string,
  color: ColorStyle,
  order: number,
  showInLegend: boolean,
  showInParadeGuide: boolean,
}