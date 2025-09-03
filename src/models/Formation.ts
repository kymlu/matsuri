export interface Formation {
  id: string, 
  name: string,
  songId: string,
  type: FormationType,
  length: number,
  width: number,
}

export enum FormationType {
  parade, stage
}