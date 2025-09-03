import React from "react";

export interface ExpandableSectionProps {
  children: React.ReactNode,
  title: string,
  defaultIsExpanded?: boolean
}

export default function ExpandableSection(props: ExpandableSectionProps) {
  const [expanded, setExpanded] = React.useState(props.defaultIsExpanded);

  function toggle() {
    setExpanded(prev => !prev)
  }
  
  return (
    <div className={expanded ? "flex-col max-h-fit" : "flex-none"}>
      <button
        className="flex flex-row justify-between w-full font-bold"
        onClick={() => toggle()}>
        <span className="text-left">{props.title}</span>
        <span className="w-8 text-center">{expanded ? "—" : "+"}</span>
      </button>
      {expanded && 
      <div className="flex-1 px-2 mt-2 overflow-auto max-h-40">
        {props.children}
      </div>}
    </div>
  )
}