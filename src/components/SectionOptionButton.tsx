import React from "react";
import className from "classnames";
import CustomMenu from "./CustomMenu.tsx";
import { MenuItem, MenuSeparator } from "./CustomMenu.tsx";
import TextInput from "./TextInput.tsx";
import { ICON } from "../data/consts.ts";
import { AppModeContext } from "../contexts/AppModeContext.tsx";

export interface ListOptionButtonProps {
  text: string,
  canEdit: boolean,
  disabled?: boolean,
  isSelected?: boolean,
  onEditName?: (newName: string) => void,
  onClick?: (event: React.MouseEvent<HTMLDivElement>) => void,
  onCopyToCurrent?: () => void,
  onCopyToFuture?: () => void,
  onDuplicate?: () => void,
  onResetPosition?: () => void,
  onDelete?: () => void,
  showReset?: boolean,
  showDelete?: boolean,
  ref?: React.Ref<HTMLDivElement>
}

export default function SectionOptionButton (props: ListOptionButtonProps) {
  const [isEditing, setIsEditing] = React.useState(false);
  const {appMode} = React.useContext(AppModeContext);

  const classes = className("grid gap-2 px-5 py-1 items-center border-primary border-b-2 last-of-type:border-0", {
    "bg-primary text-white cursor-default": props.isSelected,
    "cursor-pointer": !props.isSelected && !props.disabled,
    "grid-cols-[1fr,auto]": appMode === "edit",
  });

  function onClick(e: React.MouseEvent<HTMLDivElement>) {
    if (!props.isSelected && !props.disabled) {
      props.onClick?.(e);
    }
  }

  function copyToCurrent() {
    props?.onCopyToCurrent?.();
  }

  function copyToFuture() {
    props?.onCopyToFuture?.();
  }
  
  function onDuplicate() {
    props?.onDuplicate?.();
  }
  
  function resetPosition() {
    props?.onResetPosition?.();
  }

  function deleteSection() {
    props?.onDelete?.();
  }

  return (
    <div className={classes}
      onClick={(e) => onClick(e)}
      ref={props.ref}>
      <span className="flex-1 text-center">
        {!isEditing && props.text}
        {isEditing && 
          <TextInput
            compact
            centered
            onContentChange={(newValue) => {props.onEditName?.(newValue)}}
            text={props.text}
            placeholder="名前を入力"/>}
      </span>
      {
        props.canEdit && 
        <>
          {
            !isEditing && <CustomMenu trigger={
              <div className="flex justify-center">
                <img
                  alt="Settings icon"
                  src={props.isSelected ? ICON.settingsWhite : ICON.settings}
                  className='size-4'/>
              </div>}>
              {
                !props.isSelected &&
                <>
                  <MenuItem label="選択項目にコピー" onClick={(e) => { e.stopPropagation(); copyToCurrent(); }}/>
                </>
              }
              {
                props.isSelected && 
                <>
                  <MenuItem label="名前を編集" onClick={() => {setIsEditing(true)}} />
                  <MenuSeparator />
                  <MenuItem label="以降にコピー" onClick={copyToFuture} />
                  <MenuSeparator />
                  <MenuItem label="重複" onClick={onDuplicate} />
                  { props.showReset &&
                    <>
                      <MenuSeparator />
                      <MenuItem label="リセット" onClick={resetPosition} />
                    </>
                  }
                  { props.showDelete &&
                    <>
                      <MenuSeparator />
                      <MenuItem label="削除" onClick={deleteSection} />
                    </>
                  }
                </>
              }
            </CustomMenu>
          }
          { 
            isEditing && 
            <button 
              button-name="Add sections"
              onClick={() => {setIsEditing(false)}}>
              <div className="flex justify-center col-start-2 row-start-1">
                <img
                  alt="Confirm name"
                  src={ICON.checkWhite}
                  className='size-4'/>
              </div>
            </button>
          }
        </>
      }
      {/* todo: add copy above, rearranging?  */}
    </div>
  )
}