export interface ParticipantOption {
  id: string,
  name: string,
  isPlaceholder?: boolean
}

export interface Participant {
  id: string,
  displayName: string,
  formationId: string,
  memberId?: string,
}