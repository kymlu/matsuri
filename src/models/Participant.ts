export interface ParticipantOption {
  id: string,
  name: string,
  isPlaceholder?: boolean
}

export interface Participant {
  id: string,
  displayName: string,
  festivalId: string,
  memberId?: string,
  isPlaceholder: boolean,
  placeholderNumber: number,
}