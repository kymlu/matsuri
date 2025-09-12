import { objectColorSettings } from "../themes/colours.ts";

export const GRID_SIZE = 40;
export const FONT_SIZE = 12;
export const DEFAULT_WIDTH = 28;
export const GRID_MARGIN_Y = 2;

export enum CUSTOM_EVENT {
  "dbInitialized" = "dbInitialized",
  "selectAllFromCategory" = "selectAllFromCategory",
  "selectAllPositionType" = "selectAllPositionType"
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