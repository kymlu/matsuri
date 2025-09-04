import React, { useContext, useEffect, useState } from "react";
import ExpandableSection from "../ExpandableSection.tsx";
import { UserContext } from "../../contexts/UserContext.tsx";
import { FormationContext } from "../../contexts/FormationContext.tsx";
import { isNullOrUndefined, strEquals } from "../helpers/GlobalHelper.ts";
import { Participant } from "../../models/Participant.ts";
import { Prop } from "../../models/Prop.ts";
import { ParticipantPosition, PropPosition } from "../../models/Position.ts";
import { dbController } from "../../data/DBProvider.tsx";

export default function NameEditor() {
  const {selectedItem} = useContext(UserContext);
  const {participantList, propList, updateFormationContext} = useContext(FormationContext);

  const [inputValue, setInputValue] = useState("");
  
  useEffect(() => {
    onChangeSelectedItem();
  }, [selectedItem]);

  function onChangeSelectedItem() {
    var name: string = "";
    
    if (isParticipant()) {
      name = participantList.find(x => strEquals(x.id, (selectedItem as ParticipantPosition).participantId))!.displayName;
    } else if (isProp()) {
      name = propList.find(x => strEquals(x.id, (selectedItem as PropPosition)?.propId))!.name;
    }

    setInputValue(name)
  }

  function isParticipant() {
    return "participantId" in selectedItem!;
  }

  function isProp() {
    return "propId" in selectedItem!;
  }
  
  const handleChange = (value) => {
    var newValue = value.target.value;
    setInputValue(newValue);
    if (isParticipant()) {
      var updatedParticipant = {
        ...participantList.find(x => strEquals(x.id, (selectedItem as ParticipantPosition)?.participantId)),
        displayName: newValue
      } as Participant;
      updateFormationContext({participantList: [
        ...participantList.filter(x => !strEquals(x.id, (selectedItem as ParticipantPosition)?.participantId)),
        updatedParticipant
      ]})
      dbController.upsertItem("participant", updatedParticipant);
    } else {
      var updatedProp = {
        ...propList.find(x => strEquals(x.id, (selectedItem as PropPosition)?.propId)),
        name: newValue
      } as Prop;
      updateFormationContext({propList: [
        ...propList.filter(x => !strEquals(x.id, (selectedItem as PropPosition)?.propId)),
        updatedProp
      ]})
      dbController.upsertItem("prop", updatedProp);
    }
  };
  
  return (
    <ExpandableSection title="名前修正">
      <input
        value={inputValue}
        onInput={(event) => handleChange(event)}
        className="w-full h-8 px-2 mb-2 border-2 border-gray-200 rounded-md focus-within:border-primary focus:outline-none"/>
    </ExpandableSection>
  )
}