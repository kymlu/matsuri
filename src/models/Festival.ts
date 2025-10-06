export interface Festival {
  id: string,
  name: string,
  startDate?: string,
  endDate?: string,
  note?: string,
  formations: Array<string>
}