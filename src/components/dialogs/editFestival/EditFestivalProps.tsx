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
import { EditState } from "./EditFestivalDialog.tsx";

export type EditFestivalPropsProps = {
  props: Prop[],
  ref?: React.Ref<any>,
  setError?: (hasError: boolean) => void
}

export type PropWithEditState = Prop & EditState;

export function EditFestivalProps(sectProps: EditFestivalPropsProps) {
  const [props, setProps] = useState<PropWithEditState[]>([...sectProps.props.map(x => ({...x, isDeleted: false, isNew: false}))]);
  const [propNames, setPropNames] = useState<Record<string, number>>({});

  useImperativeHandle(sectProps.ref, () => ({
    getData: () => {return props;},
    resetData: () => {
      const updatedProps = [...sectProps.props.map(x => ({...x, isDeleted: false, isNew: false}))];
      setProps(updatedProps);
      updatePropNames(updatedProps);
    }
  }));

  function updatePropNames(props: PropWithEditState[]) {
    const updated: Record<string, number> = props
      .filter(x => !x.isDeleted)
      .reduce<Record<string, number>>((acc, f) => {
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
        color: preset?.color || objectColorSettings.grey3,
        isDeleted: false,
        isNew: true,
      } as PropWithEditState
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

  const editPropLength = (index: number, newLength: number) => {
    const updatedProps = [...props];
    updatedProps[index].length = newLength;
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
    updatedProps[index].isDeleted = true;
    setProps(updatedProps);
    updatePropNames(updatedProps);
  };
  
  return <div>
    <div className="flex flex-row items-center justify-between mb-3">
      <label className="font-extrabold">大道具</label>
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
      <div className="grid grid-cols-[5fr,1fr,1fr,auto] items-center gap-2">
        <div className="font-bold">ラベル</div>
        <div className="font-bold">長さ(m)</div>
        <div className="font-bold">色</div>
        <div className="size-6"></div>
        { props.length === 0 && <span className="w-full col-span-4 mt-2 text-center">大道具はありません</span>}
        {
          props.map((p, i) => 
            <React.Fragment key={i}>
              { p.isDeleted && <></> }
              {
                !p.isDeleted && <>
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
                  <NumberTextField
                    default={p.length}
                    step={0.1}
                    onChange={(val) => {
                      if (val) {
                        editPropLength(i, val)
                      }
                    }}/>
                  <CustomMenu full trigger={
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
                    {/* TODO: have an are you sure verification dialog with the list of formations it's used in */}
                  </CustomMenu>
                </>
              }
            </React.Fragment>
          )
        }
      </div>
    </div>
  </div>
}