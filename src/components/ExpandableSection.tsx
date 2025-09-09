import React from "react";

export interface ExpandableSectionProps {
  children: React.ReactNode,
  title: string,
  defaultIsExpanded?: boolean,
}

export default function ExpandableSection(props: ExpandableSectionProps) {
  const [expanded, setExpanded] = React.useState(props.defaultIsExpanded);

  function toggle() {
    setExpanded(prev => !prev);
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
          src={expanded ? "icons/expand_less_black.svg": "icons/expand_more_black.svg"}
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