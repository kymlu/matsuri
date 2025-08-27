import React from "react";
import SectionPicker from "./SectionPicker.tsx";
import ParticipantPicker from "./ParticipantPicker.tsx";
import PropPicker from "./PropPicker.tsx";

export default function FormationLeftPanel () {
  return (
    <div className="flex flex-col gap-5 h-full p-5 bg-white border-r-2 border-teal-700 border-solid overflow-y-scroll">
      <SectionPicker/>
      <ParticipantPicker/>
      <PropPicker/>
    </div>
  )
}