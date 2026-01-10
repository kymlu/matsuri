import { ColorStyle } from "../themes/colours";

export interface NotePreset {
  label: string;
  length: number;
  height: number;
  borderRadius: number;
  fontGridRatio: number;
  color: ColorStyle;
  hasLabel: boolean;
  defaultContent: string;
  alwaysBold: boolean;
  textAlignment: "left" | "center" | "right";
}