import React from "react";
import SectionPicker from "./SectionPicker.tsx";
import ParticipantPicker from "./ParticipantPicker.tsx";
import PropPicker from "./PropPicker.tsx";
import Divider from "../Divider.tsx";
import ShapePicker from "./ShapePicker.tsx";

export default function FormationLeftPanel () {
  return (
    <div className="flex flex-col p-5 overflow-y-auto bg-white border-r-2 border-solid border-primary w-80 max-w-80">
      <SectionPicker/>
      <Divider/>
      <ParticipantPicker/>
      <Divider/>
      <PropPicker/>
      <Divider/>
      <ShapePicker/>
    </div>
  )
}