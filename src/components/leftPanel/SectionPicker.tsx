import React, { useContext } from "react";
import ExpandableSection from "../ExpandableSection.tsx";
import Button from "../Button.tsx";
import { UserContext } from "../../contexts/UserContext.tsx";
import { FormationSongSection } from "../../models/FormationSection.ts";
import { strEquals } from "../helpers/GlobalHelper.ts";
import { PositionContext } from "../../contexts/PositionContext.tsx";
import ListOptionButton from "../ListOptionButton.tsx";

export default function SectionPicker () {
  const {selectedFormation, sections, selectedSection, updateState} = useContext(UserContext);
  const {participantPositions, propPositions} = useContext(PositionContext);

  function selectSection(section: FormationSongSection) {
    participantPositions.filter(x => x.isSelected).forEach(x => x.isSelected = false);
    propPositions.filter(x => x.isSelected).forEach(x => x.isSelected = false);
    updateState({selectedSection: section, selectedItem: null});
  }

  return (
    <ExpandableSection title="セクション" defaultIsExpanded>
      <div className="overflow-scroll">
        <div className="flex flex-col">
          {sections
            .filter(section => strEquals(section.formationId, selectedFormation?.id))
            .sort((a, b) => a.songSection.order - b.songSection.order)
            .map((section, index, array) => 
              <ListOptionButton 
                key={section.id} 
                text={section.songSection.name}
                isSelected={selectedSection?.id === section.id}
                isBottom={index === array.length - 1}
                onClick={() => {selectSection(section)}}/>
          )}
        </div>
      </div>
      <Button>隊列をクリアする</Button>
    </ExpandableSection>
  )
}