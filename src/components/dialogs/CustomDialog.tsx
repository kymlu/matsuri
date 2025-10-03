import { Dialog } from "@base-ui-components/react";
import React from "react";
import { ICON } from "../../lib/consts.ts";

export type CustomDialogProps = {
  children: React.ReactNode,
  title: string,
  hasX?: boolean,
}

export default function CustomDialog(props: CustomDialogProps) {
  return (
    <Dialog.Portal>
      <Dialog.Backdrop className="fixed inset-0 bg-black opacity-20 transition-all duration-150 data-[ending-style]:opacity-0 data-[starting-style]:opacity-0 dark:opacity-70" />
      <Dialog.Popup className="fixed max-h-[70vh] overflow-auto top-1/2 left-1/2 -mt-8 min-w-64 max-w-[calc(100vw-3rem)] -translate-x-1/2 -translate-y-1/2 rounded-lg bg-gray-50 p-6 text-gray-900 outline outline-1 outline-gray-200 transition-all duration-150 data-[ending-style]:scale-90 data-[ending-style]:opacity-0 data-[starting-style]:scale-90 data-[starting-style]:opacity-0 dark:outline-gray-300">
        { props.hasX &&
          <Dialog.Close>
            <img src={ICON.clear} className="fixed top-3 right-3"/>
          </Dialog.Close>
        }
        <Dialog.Title className="-mt-1.5 mb-1 text-lg font-medium">{props.title}</Dialog.Title>
        {props.children}
      </Dialog.Popup>
    </Dialog.Portal>
  )
}