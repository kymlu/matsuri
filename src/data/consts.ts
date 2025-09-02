import { objectColorSettings } from "../themes/colours.ts";

export const GRID_SIZE = 40;
export const BLOCK_SNAP_SIZE = GRID_SIZE / 2;
export const FONT_SIZE = 12;
export const DEFAULT_WIDTH = 28;
export const GRID_MARGIN_Y = 2;

export enum CUSTOM_EVENT {
  "dbInitialized",
}

export const NOTE_PRESETS = {
  "timing": {
    length: 1.25,
    height: 0.75,
    borderRadius: 10,
    fontSize: 20,
    color: objectColorSettings.grey4
  },
  "legend": {
    length: 5,
    height: 3,
    borderRadius: 10,
    fontSize: 12,
    color: objectColorSettings.amberLight
  }
}