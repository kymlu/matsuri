import React from "react";
import CustomDialog from "./CustomDialog.tsx";
import { LAST_UPDATED } from "../../data/consts.ts";

export type SiteInfoDialogProps = {
  isOpen: boolean,
}

export function SiteInfoDialog(props: SiteInfoDialogProps) {
  return (
    <CustomDialog
      title="サイト情報"
      isOpen={props.isOpen}>
      工事中
      <br/>
      {LAST_UPDATED}
    </CustomDialog>
  )
}