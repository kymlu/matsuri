export interface FormationSection {
  id: string,
  displayName: string,
  songSectionId: string,
  order: number,
  formationId: string,
  version?: number,
  head?: number
}