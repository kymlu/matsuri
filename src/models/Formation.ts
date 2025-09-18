export interface Formation {
  id: string, 
  name: string,
  songId: string,
  type: FormationType,
  length: number,
  width: number,
  topMargin?: number,
  sideMargin?: number,
  bottomMargin?: number,
}

export enum FormationType {
  parade, stage
}