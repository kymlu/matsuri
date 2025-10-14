import React from "react";
import { ICON } from "../lib/consts.ts";

export interface ExpandableSectionProps {
  children: React.ReactNode,
  title: React.ReactNode,
  titleIcon?: string,
  defaultIsExpanded?: boolean,
  canExpand?: boolean,
  onToggle?: () => void
}

export default function ExpandableSection(props: ExpandableSectionProps) {
  const [expanded, setExpanded] = React.useState(props.canExpand ? props.defaultIsExpanded : true);

  async function toggle() {
    if (props.canExpand) {
      setExpanded(prev => !prev);
      await new Promise<void>((resolve) => {
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            resolve();
          });
        });
      });
      props?.onToggle?.();
    }
  }
  
  return (
    <div className={"px-5 " + (expanded ? "flex-col max-h-fit" : "flex-none")}>
      <button
        button-name={`Toggle the ${props.title} section`}
        className={"flex flex-row justify-between w-full font-bold items-center " + (props.canExpand ? "" : "cursor-default")}
        onClick={() => toggle()}>
        <div className="flex flex-row items-center gap-3">
          {
            props.titleIcon &&
            <img className="size-8" src={props.titleIcon} alt={props.title + " icon"}/>
          }
          <span className="text-left">{props.title}</span>
        </div>
        {props.canExpand && <img 
          className="size-8" 
          src={expanded ? ICON.expandLessBlack: ICON.expandMoreBlack}
          alt={expanded ? "Collapse icon": "Expand icon"}
          />}
      </button>
      {expanded && 
      <div className="flex-1 px-2 mt-2 overflow-auto">
        {props.children}
      </div>}
    </div>
  )
}