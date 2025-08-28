import React, { useContext } from "react";
import ExpandableSection from "../ExpandableSection.tsx";
import SongSectionButton from "../SongSectionButton.tsx";
import Button from "../Button.tsx";
import { UserContext } from "../../contexts/UserContext.tsx";
import { FormationSongSection } from "../../models/FormationSection.ts";
import { songList } from "../../data/ImaHitotabi.ts";

export default function SectionPicker () {
  const {selectedFormation, selectedSection, updateState} = useContext(UserContext);

  function selectSection(section: FormationSongSection) {
    updateState({selectedSection: section});
  }

  return (
    <ExpandableSection title="セクション">
      <div className="overflow-scroll">
        <div className="flex flex-col">
          {songList
            .filter(song => song.id === selectedFormation?.songId)
            .flatMap(song => song.sections)
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
      <Button>隊列をクリアする</Button>
    </ExpandableSection>
  )
}