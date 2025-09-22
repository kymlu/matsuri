import React from "react";
import CustomDialog from "./CustomDialog.tsx";
import { Dialog } from "@base-ui-components/react";

export type ExportProgressDialogProps = {
  exportName: string,
  progress: number,
  isOpen: boolean,
}

export function ExportProgressDialog(props: ExportProgressDialogProps) {
  return (
    <Dialog.Root modal open={props.isOpen}>
      <CustomDialog
        title="PDF出力中">
        <b>{props.exportName}.pdf</b>」を生成しています。<br></br>完了までしばらくお待ちください。<br></br>進行状況：{props.progress}%
      </CustomDialog>
    </Dialog.Root>
  )
}