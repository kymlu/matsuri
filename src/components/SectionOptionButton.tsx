import React from "react";
import className from "classnames";
import CustomMenu from "./CustomMenu.tsx";
import { MenuItem, MenuSeparator } from "./CustomMenu.tsx";

export interface ListOptionButtonProps {
  text: string,
  isSelected?: boolean,
  isBottom?: boolean,
  onClick?: (event: React.MouseEvent<HTMLDivElement>) => void,
  onCopyToCurrent?: () => void,
  onCopyToFuture?: () => void,
  onCreateDerivitive?: () => void,
  onResetPosition?: () => void,
}

export default function SectionOptionButton (props: ListOptionButtonProps) {
  const classes = className("flex flex-row gap-2 px-5", {
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
  
  function createDerivitive() {
    props?.onCreateDerivitive?.();
  }
  
  function resetPosition() {
    props?.onResetPosition?.();
  }

  return (
    <div className={classes} onClick={(e) => onClick(e)}>
      <span className="flex-1 text-center">
        {props.text}
      </span>
      <CustomMenu trigger={<span>⚙️</span>}>
          {
            !props.isSelected &&
            <>
              <MenuItem label="選択項目にコピー" onClick={(e) => { e.stopPropagation(); copyToCurrent(); }}/>
            </>
          }
          {
            props.isSelected && 
            <>
              <MenuItem label="名前を編集（無効）" onClick={() => {}} />
              <MenuSeparator />
              <MenuItem label="以降にコピー" onClick={copyToFuture} />
              <MenuSeparator />
              <MenuItem label="派生作成（無効）" onClick={createDerivitive} />
              <MenuSeparator />
              <MenuItem label="リセット" onClick={resetPosition} />
              <MenuSeparator />
              <MenuItem label="削除（無効）" onClick={() => {}} />
            </>
          }
        </CustomMenu>
    </div>
  )
}