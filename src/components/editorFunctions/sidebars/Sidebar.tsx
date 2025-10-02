import classNames from "classnames";
import React, { useContext, useEffect } from "react";
import { AppModeContext } from "../../../contexts/AppModeContext.tsx";
import { ICON } from "../../../lib/consts.ts";
import Divider from "../../Divider.tsx";

export type SidebarProps = {
  isLeft?: boolean,
  defaultExpanded?: boolean,
  children: React.ReactNode,
}

export function Sidebar(props: SidebarProps) {
  const {appMode} = useContext(AppModeContext)
  const [expanded, setExpanded] = React.useState(props.defaultExpanded);

  useEffect(() => {
    setExpanded(props.defaultExpanded);
  }, [appMode]);

  var classes = classNames("flex flex-col overflow-y-auto bg-white border-solid border-grey-200 py-5",
    {
      "min-w-[200px] w-[25svw]": expanded,
      "border-r-2": props.isLeft,
      "border-l-2": !props.isLeft,
    }
  );

  var buttonClasses = classNames("pb-2 px-5",
    {
      "h-full items-center": !expanded,
      "flex justify-end": props.isLeft,
    }
  );

  return (
    <div className={classes}>
      <button
        className={buttonClasses}
        onClick={() => setExpanded(prev => !prev)}>
        <img
          className="size-6"
          src={(expanded && props.isLeft || !expanded && !props.isLeft) ?
            ICON.arrowMenuCloseBlack :
            ICON.arrowMenuOpenBlack}/>
      </button>
      {
        expanded && 
        <>
          <Divider/>
          {props.children}
        </>
      }
    </div>
  )
}