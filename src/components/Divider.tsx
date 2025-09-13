import classNames from "classnames";
import React from "react";

export type DividerProps = {
  compact?: boolean,
}

export default function Divider(props: DividerProps) {
  var classes = classNames("bg-primary", {
    "my-3 h-1": !props.compact,
    "h-0.5": props.compact
  })

  return (
    <div>
      <hr className={classes}/>
    </div>
  )
}