import classNames from "classnames";
import React from "react";

export type DividerProps = {
  compact?: boolean,
}

export default function Divider(props: DividerProps) {
  var classes = classNames("bg-primary border-none h-0.5", {
    "my-3": !props.compact,
    "h-0.5": props.compact
  })

  return (
    <div>
      <hr className={classes}/>
    </div>
  )
}