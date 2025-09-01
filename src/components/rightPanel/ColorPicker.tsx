import React from "react";
import { ColorStyle, objectColorSettings } from "../../themes/colours.ts";
import ColorSwatch from "./ColorSwatch.tsx";

export interface ColorPickerProps {
  selectColor: (color: ColorStyle) => void
}

export default function ColorPicker(props: ColorPickerProps) {
  return (<>
    {
      Object.values(objectColorSettings).map(color => 
        <ColorSwatch 
          key={color.bgColour} 
          tailwindColorClassName={color.twColor} 
          onClick={() => props.selectColor(color)}/>
      )
    }
  </>)
}