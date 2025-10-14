import React, { useImperativeHandle, useState } from "react";
import { Prop } from "../../../models/Prop";
import { propsList } from "../../../data/ImaHitotabi.ts";
import { ICON } from "../../../lib/consts.ts";
import CustomMenu, { MenuItem } from "../../CustomMenu.tsx";
import NumberTextField from "../../NumberTextField.tsx";
import TextInput from "../../TextInput.tsx";
import { ColorStyle, objectColorSettings } from "../../../themes/colours.ts";
import ColorPresetPicker from "../../editorFunctions/menus/ColorPresetPicker.tsx";
import ColorSwatch from "../../editorFunctions/menus/ColorSwatch.tsx";
import ItemButton from "../../ItemButton.tsx";
import { isNullOrUndefinedOrBlank } from "../../../lib/helpers/GlobalHelper.ts";

export type EditFestivalPropsProps = {
  props: Prop[],
  ref?: React.Ref<any>,
  setError?: (hasError: boolean) => void
}

export function EditFestivalProps(sectProps: EditFestivalPropsProps) {
  const [props, setProps] = useState<Prop[]>([...sectProps.props.map(x => ({...x}))]);
  const [propNames, setPropNames] = useState<Record<string, number>>({});

  useImperativeHandle(sectProps.ref, () => ({
    getData: () => {return props;},
    resetData: () => {
      setProps([...sectProps.props.map(x => ({...x}))]);
      updatePropNames(sectProps.props)
    }
  }));

  function updatePropNames(props: Prop[]) {
    const updated: Record<string, number> = props.reduce((acc, f) => {
      acc[f.name] = (acc[f.name] || 0) + 1;
      return acc;
    }, {});
    setPropNames(updated);
    sectProps.setError?.(
      Object.keys(updated).some(key => isNullOrUndefinedOrBlank(key)) ||
      Object.values(updated).some(count => count > 1)
    );
  }
  
  const addProp = (preset?: Prop) => {
    const updatedProps = [
      ...props, {
        id: crypto.randomUUID(),
        name: preset?.name || "",
        length: preset?.length || 1,
        color: preset?.color || objectColorSettings.grey3
      } as Prop
    ];
    setProps(updatedProps);
    updatePropNames(updatedProps);
  };

  const editPropName = (index: number, newName: string) => {
    const updatedProps = [...props];
    updatedProps[index].name = newName;
    setProps(updatedProps);
    updatePropNames(updatedProps);
  };

  const editPropColour = (index: number, color: ColorStyle) => {
    const updatedProps = [...props];
    updatedProps[index].color = color;
    setProps(updatedProps);
    updatePropNames(updatedProps);
  };

  const deleteProp = (index: number) => {
    const updatedProps = [...props];
    updatedProps.splice(index, 1);
    setProps(updatedProps);
    updatePropNames(updatedProps);
  };
  
  return <div>
    <div className="flex flex-row items-center justify-between mb-3">
      <label>大道具</label>
      <button
        type="button"
        onClick={() => addProp()}
      >
        <img src={ICON.addBlack} className="size-6" alt="Add participant" />
      </button>
    </div>
    <div className="grid grid-cols-[1fr,4fr] items-start gap-4">
      <div className="flex flex-col gap-2 max-h-[20svh] overflow-y-auto border-2 border-primary rounded-lg p-2">
        {propsList.map(x => <ItemButton key={x.id} text={`${x.name} (${x.length}m)`} onClick={() => addProp(x)}/>)}
      </div>
      <div className="grid grid-cols-[5fr,1fr,1fr,auto] items-center gap-x-2">
        <div className="font-bold">ラベル</div>
        <div className="font-bold">長さ(m)</div>
        <div className="font-bold">色</div>
        <div className="size-6"></div>
        { props.length === 0 && <span className="w-full col-span-4 mt-2 text-center">大道具はありません</span>}
        {
          props.map((p, i) => 
            <React.Fragment key={i}>
              <TextInput 
                tall
                compact
                default={p.name}
                onContentChange={(val) =>{ 
                  editPropName(i, val);
                }}
                required
                hasError={propNames[p.name] > 1}
                />
              <NumberTextField default={p.length} step={0.1}/>
              <CustomMenu trigger={
                <ColorSwatch 
                  full
                  colorHexCode={p.color!.bgColour!} 
                  borderHexCode={p.color!.borderColour}
                  textHexCode={p.color!.textColour}
                  onClick={() => {}}
                  />
              }>
                <ColorPresetPicker selectColor={(newColour)=>{editPropColour(i, newColour)}} selectedColor={p.color}/>
              </CustomMenu>
              <CustomMenu
                trigger={<img src={ICON.deleteBlack} className="size-6" alt="Delete prop" />}>
                <MenuItem label="削除" onClick={() => deleteProp(i)} />
              </CustomMenu>
            </React.Fragment>
          )
        }
      </div>
    </div>
  </div>
}