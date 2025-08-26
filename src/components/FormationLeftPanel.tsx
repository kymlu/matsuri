import React, { useContext, useState } from "react";
import { UserContext } from "../contexts/UserContext.tsx";
import { participantsList, propsList, songSectionList } from "../data/ImaHitotabi.ts";
import Button from "./Button.tsx";
import ExpandableSection from "./ExpandableSection.tsx";
import SongSectionButton from "./SongSectionButton.tsx";
import { FormationSongSection } from "../models/FormationSection.ts";
import ItemButton from "./ItemButton.tsx";
import { Participant, ParticipantType } from "../models/Participant.ts";
import { Prop } from "../models/Prop.ts";
import SearchParticipantComponent from "./SearchParticipantComponent.tsx";
import { ParticipantPosition, PropPosition } from "../models/Position.ts";
import { FormationStateContext } from "../contexts/FormationEditorContext.tsx";

export default function FormationLeftPanel () {
  const {selectedFormation, selectedSection, updateState} = useContext(UserContext);
  const {participantPositions, propPositions, updateFormationState} = useContext(FormationStateContext);

  const [selectedParticipants, setSelectedParticipants] = useState<Array<string>>([]);
  const [selectedProps, setSelectedProps] = useState<Array<string>>([]);
  const [filterText, setFilterText] = useState<string>("");

  function selectSection(section: FormationSongSection) {
    updateState({selectedSection: section});
  }
  
  function selectParticipant(newParticipant: Participant) {
    if (selectedParticipants.includes(newParticipant.id)){
      setSelectedParticipants(prev => (prev.filter(id => id !== newParticipant.id)))
      // updateFormationState({participantPositions: participantPositions.filter(x => x.participant.id != newPosition.participant.id)});
    } else {
      setSelectedParticipants(prev => ([...prev, newParticipant.id]));
      var newPosition: ParticipantPosition = {
        id: crypto.randomUUID().toString(),
        participant: newParticipant,
        formationSceneId: "", // todo
        x: 0,
        y: 0};
        updateFormationState({participantPositions: [...participantPositions, newPosition]});
    }
  }

  function selectProp(newProp: Prop) {
    if (selectedProps.includes(newProp.id)) {
      setSelectedProps(prev => (prev.filter(id => id !== newProp.id)))
    } else {
      setSelectedProps(prev => ([...prev, newProp.id]));
      setSelectedParticipants(prev => ([...prev, newProp.id]));
      var newPosition: PropPosition = {
        id: crypto.randomUUID().toString(),
        prop: newProp,
        formationSceneId: "", // todo
        x: 0,
        y: 0};

        updateFormationState({propPositions: [...propPositions, newPosition]});
    }
  }

  function setFilterTextWrapper(value: string) {
    setFilterText(value);
  }

  return (
    <div className="flex flex-col gap-5 h-full p-5 bg-white border-r-2 border-teal-700 border-solid overflow-y-scroll">
      <ExpandableSection title="Sections">
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
        <Button>Reset formation</Button>
      </ExpandableSection>
      <ExpandableSection title="Participants">
        <SearchParticipantComponent onValueChanged={(value) => setFilterTextWrapper(value)}/>
        <div className="flex flex-row flex-wrap gap-2">
        {participantsList
          .filter(x => x.name.includes(filterText))
          .sort((a, b) => a.name.localeCompare(b.name))
          .map(participant => 
            <ItemButton
              key={participant.id}
              item={participant}
              isDisabled={selectedParticipants.includes(participant.id)}
              onClick={() => selectParticipant(participant)}/>)} 
              <ItemButton item={{name:"Dancer", id:"0000", type: ParticipantType.dancer}}
                onClick={() => selectParticipant({name:"Dancer", id:"0000", type: ParticipantType.dancer})}/>
              <ItemButton item={{name:"Staff", id:"0001", type: ParticipantType.staff}}
                onClick={() => selectParticipant({name:"Staff", id:"0001", type: ParticipantType.staff})}/>
        {/* todo: disable if used */}
        {/* todo: add undecided */}
        </div>
      </ExpandableSection>
      <ExpandableSection title="Props">
        <div className="flex flex-col gap-2">
        {propsList
          .sort((a, b) => a.name.localeCompare(b.name))
          .map(prop => 
            <ItemButton
              key={prop.id}
              item={prop}
              isDisabled={selectedProps.includes(prop.id)}
              onClick={() => selectProp(prop)}/>)} 
        </div>
      </ExpandableSection>
    </div>
  )
}