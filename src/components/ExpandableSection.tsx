import React from "react";
import { ICON } from "../data/consts.ts";

export interface ExpandableSectionProps {
  children: React.ReactNode,
  title: string,
  defaultIsExpanded?: boolean,
  onToggle?: () => void
}

export default function ExpandableSection(props: ExpandableSectionProps) {
  const [expanded, setExpanded] = React.useState(props.defaultIsExpanded);

  async function toggle() {
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
  
  return (
    <div className={expanded ? "flex-col max-h-fit" : "flex-none"}>
      <button
        button-name={`Toggle the ${props.title} section`}
        className="flex flex-row justify-between w-full font-bold align-middle"
        onClick={() => toggle()}>
        <span className="text-left">{props.title}</span>
        <img 
          className="text-center size-6" 
          src={expanded ? ICON.expandLessBlack: ICON.expandMoreBlack}
          alt={expanded ? "Collapse icon": "Expand icon"}
          />
      </button>
      {expanded && 
      <div className="flex-1 px-2 mt-2 overflow-auto">
        {props.children}
      </div>}
    </div>
  )
}