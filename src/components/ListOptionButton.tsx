import React from "react";
import className from "classnames";

export interface ListOptionButtonProps {
  text: string,
  isSelected?: boolean,
  isBottom?: boolean,
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void
}

export default function ListOptionButton (props: ListOptionButtonProps) {
  const classes = className("", {
    "bg-primary text-white": props.isSelected,
    "border-b-2 border-primary": !props.isBottom,
  });
  return (
    <button className={classes} onClick={props.onClick}>
      {props.text}
    </button>
  )
}