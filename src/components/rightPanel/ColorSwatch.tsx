import classNames from "classnames";
import React from "react";

export type ColorSwatchProps = {
  onClick: () => void,
  tailwindColorClassName: string,
}

export default function ColorSwatch(props: ColorSwatchProps) {
  var c = classNames("size-4 rounded-md", props.tailwindColorClassName, {
    "border-grey-500 border border-solid": props.tailwindColorClassName.localeCompare("bg-white") === 0
  });
  return (
        <button
          key={props.tailwindColorClassName}
          className={c}
          onClick={() => props.onClick()}/>)
}