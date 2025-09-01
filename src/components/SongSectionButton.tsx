import React from "react";
import className from "classnames";

export interface SongSectionButtonProps {
  sectionName: string,
  isSelected?: boolean,
  isBottom?: boolean,
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void
}

export default function SongSectionButton (props: SongSectionButtonProps) {
  const classes = className("", {
    "bg-primary text-white": props.isSelected,
    "border-b-2 border-primary": !props.isBottom,
  });
  return (
    <button className={classes} onClick={props.onClick}>
      {props.sectionName}
    </button>
  )
}