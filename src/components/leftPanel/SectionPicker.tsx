import React, { useContext } from "react";
import ExpandableSection from "../ExpandableSection.tsx";
import SongSectionButton from "../SongSectionButton.tsx";
import Button from "../Button.tsx";
import { UserContext } from "../../contexts/UserContext.tsx";
import { FormationSongSection } from "../../models/FormationSection.ts";
import { songSectionList } from "../../data/ImaHitotabi.ts";

export default function SectionPicker () {
  const {selectedFormation, selectedSection, updateState} = useContext(UserContext);

  function selectSection(section: FormationSongSection) {
    updateState({selectedSection: section});
  }

  return (
    <ExpandableSection title="Sections">
      <div className="max-h-40 overflow-scroll">
        <div className="flex flex-col">
          {songSectionList
            .filter(section => section.songId === selectedFormation?.songId)
            .sort(section => section.order)
            .map((section, index, array) => 
              <SongSectionButton 
                key={section.id} 
                section={section}
                isSelected={selectedSection?.id === section.id}
                isBottom={index === array.length - 1}
                onClick={() => {selectSection({id: section.id, songSectionId: section.id, songSection: section} as FormationSongSection)}}/>
          )}
        </div>
      </div>
      <Button>Reset formation</Button>
    </ExpandableSection>
  )
}