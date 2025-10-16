import React from "react";
import SectionPicker from "../menus/SectionPicker.tsx";
import ParticipantPicker from "../menus/ParticipantPicker.tsx";
import PropPicker from "../menus/PropPicker.tsx";
import Divider from "../../Divider.tsx";
import NotePicker from "../menus/NotePicker.tsx";
import { MarginPositions } from "../../../pages/FormationPage.tsx";
import { Sidebar } from "./Sidebar.tsx";
import ArrowPicker from "../menus/ArrowPicker.tsx";
import { Formation } from "../../../models/Formation.ts";

export default function FormationLeftPanel (props: {marginPositions: MarginPositions}) {
  return (
    <Sidebar defaultExpanded isLeft>
      <FormationEditorLeftContent marginPositions={props.marginPositions}/>
    </Sidebar>
  )
}

export function FormationEditorLeftContent (props: { marginPositions: MarginPositions}) {
  return (
    <>
      <SectionPicker margins={props.marginPositions}/>
      <Divider/>
      <ParticipantPicker margins={props.marginPositions.participants}/>
      <Divider/>
      <PropPicker margins={props.marginPositions.props}/>
      <Divider/>
      <NotePicker margins={props.marginPositions.notes}/>
      <Divider/>
      <ArrowPicker margins={props.marginPositions.notes}/>
    </>
  )
}
