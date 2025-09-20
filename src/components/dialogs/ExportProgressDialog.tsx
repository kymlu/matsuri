import React from "react";
import CustomDialog from "./CustomDialog.tsx";

export type ExportProgressDialogProps = {
  exportName: string,
  progress: number,
  isOpen: boolean,
}

export function ExportProgressDialog(props: ExportProgressDialogProps) {
  return (
    <CustomDialog
      title="PDF出力中"
      isOpen={props.isOpen}>
      <b>{props.exportName}.pdf</b>」を生成しています。<br></br>完了までしばらくお待ちください。<br></br>進行状況：{props.progress}%
    </CustomDialog>
  )
}