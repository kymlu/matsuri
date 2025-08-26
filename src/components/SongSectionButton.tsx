import React from "react";
import { SongSection } from "../models/SongSection.ts";
import className from "classnames";

export interface SongSectionButtonProps {
  section: SongSection,
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
      {props.section.name}
    </button>
  )
}