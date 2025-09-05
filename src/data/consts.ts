import { objectColorSettings } from "../themes/colours.ts";

export const GRID_SIZE = 40;
export const BLOCK_SNAP_SIZE = GRID_SIZE / 2;
export const FONT_SIZE = 12;
export const DEFAULT_WIDTH = 28;
export const GRID_MARGIN_Y = 2;

export enum CUSTOM_EVENT {
  "dbInitialized",
}

export const CONTEXT_NAMES = {
  user: "userContext",
  formation: "formationContext",
  section: "sectionContext",
  position: "positionContext",
  category: "categoryContext",
  animation: "animationContext"
}

export const DB_NAME = "MatsuriDB";

export const NOTE_PRESETS = {
  "timing": {
    label: "タイミング",
    length: 1.25,
    height: 0.75,
    borderRadius: 10,
    fontSize: 20,
    color: objectColorSettings.grey4,
    hasLabel: false,
    defaultContent: "1"
  },
  "legend": {
    label: "凡例",
    length: 5,
    height: 3,
    borderRadius: 10,
    fontSize: 12,
    color: objectColorSettings.amberLight,
    hasLabel: true,
    defaultContent: "これはメモです。"
  }
}