import { ColorStyle } from "../themes/colours";

export interface Note {
  label: string;
  length: number;
  height: number;
  borderRadius: number;
  fontGridRatio: number;
  color: ColorStyle;
  hasLabel: boolean;
  defaultContent: string;
  alwaysBold: boolean;
}