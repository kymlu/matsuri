import { ColorStyle } from "../themes/colours";

export interface ParticipantCategory {
  id: string,
  name: string,
  color: ColorStyle,
  order: number,
  showInLegend: boolean,
  showInParadeGuide: boolean,
}