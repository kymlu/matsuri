import { objectColorSettings } from "../themes/colours.ts";

export const GRID_SIZE = 40;
export const FONT_SIZE = 12;
export const DEFAULT_WIDTH = 28;
export const DEFAULT_TOP_MARGIN = 2;
export const DEFAULT_BOTTOM_MARGIN = 2;
export const DEFAULT_SIDE_MARGIN = 6;

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

export const ICON = {
  addBlack: "icons/add_black.svg",
  arrowMenuCloseBlack: "icons/arrow_menu_close_black.svg",
  arrowMenuOpenBlack: "icons/arrow_menu_open_black.svg",
  categoryBlack: "icons/category_black.svg",
  checkWhite: "icons/check_white.svg",
  chevronBackwardBlack: "icons/chevron_backward_black.svg",
  chevronForwardBlack: "icons/chevron_forward_black.svg",
  clearBlack: "icons/clear_black.svg",
  clear: "icons/clear.svg",
  expandLessBlack: "icons/expand_less_black.svg",
  expandMoreBlack: "icons/expand_more_black.svg",
  familiarFaceAndZoneBlack: "icons/familiar_face_and_zone_black.svg",
  fileExportBlack: "icons/file_export_black.svg",
  footprintBlack: "icons/footprint_black.svg",
  noteStackBlack: "icons/note_stack_black.svg",
  settingsWhite: "icons/settings_white.svg",
  settings: "icons/settings.svg",  
}

export const DB_NAME = "MatsuriDB";