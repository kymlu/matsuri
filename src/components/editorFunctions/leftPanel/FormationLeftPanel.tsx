import React from "react";
import SectionPicker from "./SectionPicker.tsx";
import ParticipantPicker from "./ParticipantPicker.tsx";
import PropPicker from "./PropPicker.tsx";
import Divider from "../../Divider.tsx";
import NotePicker from "./NotePicker.tsx";
import { MarginPositions } from "../../../pages/FormationPage.tsx";
import { Sidebar } from "../Sidebar.tsx";

export default function FormationLeftPanel (props: {marginPositions: MarginPositions}) {
  return (
    <Sidebar isLeft>
      <SectionPicker margins={props.marginPositions}/>
      <Divider/>
      <ParticipantPicker margins={props.marginPositions.participants}/>
      <Divider/>
      <PropPicker margins={props.marginPositions.props}/>
      <Divider/>
      <NotePicker margins={props.marginPositions.notes}/>
    </Sidebar>
  )
}