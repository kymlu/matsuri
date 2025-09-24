import React from "react";
import className from "classnames";

export interface ItemButtonProps {
  text?: string,
  icon?: string,
  isDisabled?: boolean,
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void
}

export default function ItemButton (props: ItemButtonProps) {
  const classes = className("border-primary border-2 rounded-md w-fit px-2 lg:hover:bg-grey-100", {
    "bg-grey-200": props.isDisabled
  });
  return (
    <button
      className={classes}
      onClick={props.onClick}>
      { props.icon && <img src={props.icon} className="size-10"/>}
      { props.text && <span>{props.text}</span>}
    </button>
  )
}