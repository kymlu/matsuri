import React, { useContext, useEffect } from "react";
import SectionPicker from "./SectionPicker.tsx";
import ParticipantPicker from "./ParticipantPicker.tsx";
import PropPicker from "./PropPicker.tsx";
import Divider from "../Divider.tsx";
import NotePicker from "./NotePicker.tsx";
import { UserContext } from "../../contexts/UserContext.tsx";
import classNames from "classnames";
import { ICON } from "../../data/consts.ts";

export default function FormationLeftPanel () {
  const userContext = useContext(UserContext)
  const [expanded, setExpanded] = React.useState(true);

  useEffect(() => {
    setExpanded(true);
  }, [userContext.selectedFormation]);

  var classes = classNames("flex flex-col overflow-y-auto bg-white border-r-2 border-solid border-grey",
    {
      "p-5 w-80 max-w-80": expanded
    }
  );

  var buttonClasses = classNames("flex pb-2 justify-end",
    {
      "h-full p-5 items-center": !expanded
    }
  )

  return (
    <div className={classes}>
      <button
        className={buttonClasses}
        onClick={() => setExpanded(prev => !prev)}>
        <img
          className="size-8"
          src={expanded ? ICON.arrowMenuCloseBlack : ICON.arrowMenuOpenBlack}/>
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