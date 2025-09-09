import { ColorStyle } from "../themes/colours"

export interface Prop {
  id: string,
  name: string,
  count?: number,
  length: number
  color?: ColorStyle,
  formationId: string,
}