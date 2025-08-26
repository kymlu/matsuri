export interface Participant {
  id: string,
  name: string,
  type: ParticipantType
  category?: string
}

export enum ParticipantType {
  dancer, staff
}