import React from "react";
import className from "classnames";
import { ParticipantOption } from "../models/Participant.ts";
import { Prop } from "../models/Prop.ts";

export interface ItemButtonProps {
  item: ParticipantOption | Prop,
  display: string,
  isDisabled?: boolean,
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void
}

export default function ItemButton (props: ItemButtonProps) {
  const classes = className("border-primary border-2 rounded-md w-fit px-2 hover:bg-grey-100", {
    "bg-grey-200": props.isDisabled
  });
  return (
    <button className={classes} onClick={props.onClick}>
      {props.display}
    </button>
  )
}