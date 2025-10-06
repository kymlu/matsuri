import { Formation } from "./Formation.ts";

export interface Festival {
  id: string,
  name: string,
  startDate?: string,
  endDate?: string,
  note?: string,
  formations: Array<Formation>
}