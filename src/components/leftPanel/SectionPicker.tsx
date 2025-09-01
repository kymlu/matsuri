import React, { useContext } from "react";
import ExpandableSection from "../ExpandableSection.tsx";
import SongSectionButton from "../SongSectionButton.tsx";
import Button from "../Button.tsx";
import { UserContext } from "../../contexts/UserContext.tsx";
import { FormationSongSection } from "../../models/FormationSection.ts";
import { strEquals } from "../helpers/GlobalHelper.ts";

export default function SectionPicker () {
  const {selectedFormation, sections, selectedSection, updateState} = useContext(UserContext);

  console.log(sections
    .filter(section => strEquals(section.formationId, selectedFormation?.id))
    .sort((a, b)=>a.songSection.order-b.songSection.order)
  );
  function selectSection(section: FormationSongSection) {
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
              <SongSectionButton 
                key={section.id} 
                sectionName={section.songSection.name}
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