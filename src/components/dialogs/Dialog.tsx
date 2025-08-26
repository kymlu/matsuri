import React from "react";

export type DialogProps = {
  children: React.ReactNode,
  title: string
}

export default function Dialog(props: DialogProps) {
  return <dialog>
    <div>X</div>
    <h1>{props.title}</h1>
    {props.children}
  </dialog>
}