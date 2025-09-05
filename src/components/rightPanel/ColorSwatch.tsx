import classNames from "classnames";
import React from "react";
import { strEquals } from "../helpers/GlobalHelper.ts";

export type ColorSwatchProps = {
  onClick: () => void,
  tailwindColorClassName: string,
  isSelected?: boolean
}

export default function ColorSwatch(props: ColorSwatchProps) {
  var c = classNames("size-4 rounded-md", props.tailwindColorClassName, 
    {
      "border-grey-500 border border-solid": strEquals(props.tailwindColorClassName, "bg-white"),
      "border-2 border-primary": props.isSelected
    });
  return (
    <button
      key={props.tailwindColorClassName}
      className={c}
      onClick={() => props.onClick()}/>
  )
}