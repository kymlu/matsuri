import React from "react";
import CustomDialog from "./CustomDialog.tsx";

export type SiteInfoDialogProps = {
  isOpen: boolean,
}

export function SiteInfoDialog(props: SiteInfoDialogProps) {
  return (
    <CustomDialog
      title="サイト情報"
      isOpen={props.isOpen}>
      工事中
    </CustomDialog>
  )
}