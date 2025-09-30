import classNames from "classnames";
import React from "react";

export type ColorSwatchProps = {
  onClick: () => void,
  tailwindColorClassName?: string,
  colorHexCode: string,
  borderHexCode?: string,
  textHexCode?: string,
  isSelected?: boolean,
  full?: boolean,
}

export default function ColorSwatch(props: ColorSwatchProps) {
  var c = classNames("rounded-md flex items-center justify-center cursor-pointer", 
    {
      "w-full": props.full,
      "w-4": !props.full,
      "h-8 font-bold": props.textHexCode,
      "h-4": props.textHexCode === undefined,
      "border-grey-500 border-2 border-solid": props.borderHexCode !== undefined,
      "border-2 border-primary": props.isSelected
    });
  return (
    <div
      style={{
        backgroundColor: props.colorHexCode,
        borderColor: props.borderHexCode ?? "",
        color: props.textHexCode ?? ""
      }}
      button-name={`Select ${props.tailwindColorClassName}`}
      key={props.tailwindColorClassName}
      className={c}
      onClick={() => props.onClick()}>
        {props.textHexCode && <span>あ</span>}
    </div>
  )
}