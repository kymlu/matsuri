import React, { useContext, useEffect } from "react";
import SectionPicker from "./SectionPicker.tsx";
import ParticipantPicker from "./ParticipantPicker.tsx";
import PropPicker from "./PropPicker.tsx";
import Divider from "../Divider.tsx";
import NotePicker from "./NotePicker.tsx";
import { UserContext } from "../../contexts/UserContext.tsx";
import classNames from "classnames";

export default function FormationLeftPanel () {
  const userContext = useContext(UserContext)
  const [expanded, setExpanded] = React.useState(true);

  useEffect(() => {
    setExpanded(true);
  }, [userContext.selectedFormation]);

  var classes = classNames("flex flex-col p-5 overflow-y-auto bg-white border-r-2 border-solid border-grey",
    {
      "w-80 max-w-80": expanded
    }
  );

  return (
    <div className={classes}>
      <button className="pb-2 text-end" onClick={() => setExpanded(prev => !prev)}>
        {expanded ? "閉じる <" : ">"}
      </button>
      {
        expanded && 
        <>
          <Divider/>
          <SectionPicker/>
          <Divider/>
          <ParticipantPicker/>
          <Divider/>
          <PropPicker/>
          <Divider/>
          <NotePicker/>
        </>
      }
    </div>
  )
}