import React, { useContext, useEffect } from "react";
import SectionPicker from "./SectionPicker.tsx";
import ParticipantPicker from "./ParticipantPicker.tsx";
import PropPicker from "./PropPicker.tsx";
import Divider from "../Divider.tsx";
import NotePicker from "./NotePicker.tsx";
import classNames from "classnames";
import { ICON } from "../../data/consts.ts";
import { MarginPositions } from "../../pages/FormationPage.tsx";
import { AppModeContext } from "../../contexts/AppModeContext.tsx";

export default function FormationLeftPanel (props: {marginPositions: MarginPositions}) {
  const {appMode} = useContext(AppModeContext)
  const [expanded, setExpanded] = React.useState(true);

  useEffect(() => {
    setExpanded(true);
  }, [appMode]);

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
          className="size-6"
          src={expanded ? ICON.arrowMenuCloseBlack : ICON.arrowMenuOpenBlack}/>
      </button>
      {
        expanded && 
        <>
          <Divider/>
          <SectionPicker margins={props.marginPositions}/>
          <Divider/>
          <ParticipantPicker margins={props.marginPositions.participants}/>
          <Divider/>
          <PropPicker margins={props.marginPositions.props}/>
          <Divider/>
          <NotePicker margins={props.marginPositions.notes}/>
        </>
      }
    </div>
  )
}