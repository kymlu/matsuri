import React from "react";

export interface ExpandableSectionProps {
  children: React.ReactNode,
  title: string
}

export default function ExpandableSection(props: ExpandableSectionProps) {
  return (
    <div>
      <h1>
        {props.title}
      </h1>
      <div>
        {props.children}
      </div>
    </div>
  )
}