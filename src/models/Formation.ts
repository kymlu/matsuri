export interface Formation {
  id: string, 
  name: string,
  songId: string,
  festivalId: string,
  type: FormationType,
  length: number,
  width: number
}

export enum FormationType {
  parade, stage
}