export interface Participant {
  id: string,
  name: string,
  type: ParticipantType
  category?: string,
  isPlaceholder?: boolean
}

export enum ParticipantType {
  dancer, staff
}