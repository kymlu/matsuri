import React from "react";
import { basePalette, colorPickerSelection } from "../../../themes/colours.ts";
import CustomMenu from "../../CustomMenu.tsx";
import ColorSwatch from "./ColorSwatch.tsx";
import { strEquals } from "../../../lib/helpers/GlobalHelper.ts";

export type ColorPalettePickerProps = {
  color: string,
  onChange: (newColor: string) => void,
}

export default function ColorPalettePicker(props: ColorPalettePickerProps) {
  return (
    <CustomMenu
      full
      trigger={
        <ColorSwatch
          full
          onClick={() => {}}
          colorHexCode={props.color ?? ""}
          borderHexCode={strEquals(props.color, basePalette.white) ? basePalette.black : undefined}/>
      }>
        <div className="grid grid-cols-5 gap-1 justify-items-center">
          {
            colorPickerSelection
            .map(color => 
              <ColorSwatch 
                key={color} 
                colorHexCode={color} 
                borderHexCode={strEquals(color, basePalette.white) ? basePalette.black : undefined}
                onClick={() => {props.onChange(color)}}
                />
            )
          }
        </div>
    </CustomMenu>
  )
}
