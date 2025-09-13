import React from "react";
import { ColorStyle, objectColorSettings } from "../../themes/colours.ts";
import ColorSwatch from "./ColorSwatch.tsx";
import { strEquals } from "../helpers/GlobalHelper.ts";

export interface ColorPickerProps {
  selectColor: (color: ColorStyle) => void,
  selectedColor?: ColorStyle | undefined | null,
}

export default function ColorPicker(props: ColorPickerProps) {
  return (<div className="grid grid-cols-6 gap-1 justify-items-center">
    {
      Object.values(objectColorSettings).map(color => 
        <ColorSwatch 
          key={color.bgColour} 
          tailwindColorClassName={color.twColor} 
          onClick={() => props.selectColor(color)}
          isSelected={strEquals(color.twColor, props.selectedColor?.twColor)}/>
      )
    }
  </div>)
}