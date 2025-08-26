import React from "react";
import Dialog from "./Dialog.tsx";

export default function AddFestivalDialog() {
  return (
    <Dialog title="Add Festival">
      <>
        <div>
          Name
        </div>
        <div>
          Start Date
        </div>
        <div>
          End Date
        </div>
        <div>
          Notes
        </div>
      </>
    </Dialog>
  )
}