export interface Festival {
  id: string,
  name: string,
  startDate?: Date,
  endDate?: Date,
  note?: string,
  formations: Array<string>
}