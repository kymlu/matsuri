import { Dialog } from "@base-ui-components/react"
import CustomDialog from "./CustomDialog.tsx"

export type ActionDialogProps = {
  children: React.ReactNode,
  title?: string,
  hasX?: boolean,
  full?: boolean
  onConfirm?: () => void
  onCancel?: () => void
}

export default function ActionDialog(props: ActionDialogProps) {
  return <CustomDialog
  title={props.title ?? "通知"}
  hasX={props.hasX}
  full={props.full}>
    {props.children}
    <div className="flex flex-row items-center justify-end flex-1 gap-1 mt-4">
      <Dialog.Close onClick={() => props.onCancel?.()}>
        <div className="px-3 py-1.5 border rounded-xl text-nowrap">
          キャンセル
        </div>
      </Dialog.Close>
      <Dialog.Close onClick={() => props.onConfirm?.()}>
        <div className="px-3 py-1.5 border rounded-xl text-nowrap bg-primary text-white">
          OK
        </div>
      </Dialog.Close>
    </div>
  </CustomDialog>
}