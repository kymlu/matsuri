import React from "react";
import CustomDialog from "./CustomDialog.tsx";
import { LAST_UPDATED } from "../../data/consts.ts";

export function SiteInfoDialog() {
  return (
    <CustomDialog
      title="サイト情報">
      工事中
      <br/>
      {LAST_UPDATED}
    </CustomDialog>
  )
}