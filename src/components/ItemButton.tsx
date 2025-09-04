import React from "react";
import className from "classnames";
import { ParticipantOption } from "../models/Participant.ts";
import { Prop } from "../models/Prop.ts";
import { isNullOrUndefined } from "./helpers/GlobalHelper.ts";

export interface ItemButtonProps {
  item: ParticipantOption | Prop,
  isDisabled?: boolean,
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void
}

export default function ItemButton (props: ItemButtonProps) {
  const classes = className("border-primary border-2 rounded-md w-fit px-2 ", {
    "bg-grey-200": props.isDisabled
  });
  return (
    <button className={classes} onClick={props.onClick}>
      {isNullOrUndefined(props.item.id) && "NEW: "} {props.item.name}
    </button>
  )
}