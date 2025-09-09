import React, { useContext } from "react";
import className from "classnames";
import CustomMenu from "./CustomMenu.tsx";
import { MenuItem, MenuSeparator } from "./CustomMenu.tsx";
import TextInput from "./TextInput.tsx";
import { FormationContext } from "../contexts/FormationContext.tsx";

export interface ListOptionButtonProps {
  text: string,
  isSelected?: boolean,
  isBottom?: boolean,
  onEditName?: (newName: string) => void,
  onClick?: (event: React.MouseEvent<HTMLDivElement>) => void,
  onCopyToCurrent?: () => void,
  onCopyToFuture?: () => void,
  onDuplicate?: () => void,
  onResetPosition?: () => void,
  onDelete?: () => void,
  showReset: boolean,
  showDelete: boolean,
  ref: React.Ref<HTMLDivElement>
}

export default function SectionOptionButton (props: ListOptionButtonProps) {
  const [isEditing, setIsEditing] = React.useState(false);
  const {participantList, propList, noteList} = useContext(FormationContext);

  const classes = className("grid grid-cols-[1fr,auto] gap-2 px-5 items-center", {
    "bg-primary text-white cursor-default": props.isSelected,
    "cursor-pointer": !props.isSelected,
    "border-b-2 border-primary": !props.isBottom,
  });

  function onClick(e: React.MouseEvent<HTMLDivElement>) {
    if (!props.isSelected) {
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
      {/* todo: add copy above> add rearranging?  */}
      {!isEditing && <CustomMenu trigger={
        <div className="flex justify-center">
          <img
            alt="Settings icon"
            src={props.isSelected ? "icons/settings_white.svg" : "icons/settings.svg"}
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
      </CustomMenu>}
      { isEditing && 
      <button 
        button-name="Add sections"
        onClick={() => {setIsEditing(false)}}>
        <div className="flex justify-center col-start-2 row-start-1 px-3">
          <img
            alt="Confirm name"
            src={"icons/check_white.svg"}
            className='size-4'/>
        </div>
      </button>}
    </div>
  )
}