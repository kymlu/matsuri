import React from "react";
import className from "classnames";
import { Participant } from "../models/Participant.ts";
import { Prop } from "../models/Prop.ts";

export interface ItemButtonProps {
  item: Participant | Prop,
  isDisabled?: boolean,
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void
}

export default function ItemButton (props: ItemButtonProps) {
  const classes = className("border-primary border-2 rounded-md w-fit px-2 ", {
    "bg-grey-200": props.isDisabled
  });
  return (
    <button className={classes} onClick={props.onClick}>
      {props.item.name}
    </button>
  )
}