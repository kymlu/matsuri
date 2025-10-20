export interface ParticipantOption {
  id: string,
  name: string,
  kana?: string,
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

export interface ParticipantPlaceholder {
  id: string,
  displayName: string,
  formationId: string,
}
