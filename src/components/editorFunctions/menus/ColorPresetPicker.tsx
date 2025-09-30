import React from "react";
import { ColorStyle, objectColorSettings } from "../../../themes/colours.ts";
import ColorSwatch from "./ColorSwatch.tsx";

export type ColorPresetPickerProps = {
  selectedColor: ColorStyle | undefined,
  selectColor: (newColor: ColorStyle) => void,
}

export default function ColorPresetPicker(props: ColorPresetPickerProps) {
  return (
    <div className="grid grid-cols-6 gap-1 justify-items-center">
      {
        Object.values(objectColorSettings)
        .map(color => 
          <ColorSwatch 
            full
            key={color.twColor} 
            colorHexCode={color.bgColour!} 
            borderHexCode={color.borderColour}
            textHexCode={color.textColour}
            onClick={() => {props.selectColor(color)}}
            />
        )
      }
    </div>
  )
}