import React from "react";
import ExpandableSection from "../ExpandableSection.tsx";
import Button from "../Button.tsx";

export default function AnimationMenu() {
  return (
    <ExpandableSection title="Animation">
      <Button>Show transition from previous</Button>
      <Button>Show transition for all</Button>
    </ExpandableSection>
  )
}