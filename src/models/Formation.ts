export interface Formation {
  id: string, 
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