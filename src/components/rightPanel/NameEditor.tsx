import React, { useContext, useEffect, useState } from "react";
import ExpandableSection from "../ExpandableSection.tsx";
import { UserContext } from "../../contexts/UserContext.tsx";
import { FormationContext } from "../../contexts/FormationContext.tsx";
import { strEquals } from "../helpers/GlobalHelper.ts";
import { Participant } from "../../models/Participant.ts";
import { Prop } from "../../models/Prop.ts";
import { isParticipantPosition, isPropPosition, ParticipantPosition, Position, PositionType, PropPosition } from "../../models/Position.ts";
import { dbController } from "../../data/DBProvider.tsx";

export default function NameEditor() {
  const userContext = useContext(UserContext);
  const {selectedItems} = useContext(UserContext);
  const {participantList, propList, updateFormationContext} = useContext(FormationContext);

  const [inputValue, setInputValue] = useState("");
  const [selectedItem, setSelectedItem] = useState<ParticipantPosition | PropPosition | null>(null);
  
  useEffect(() => {
    if (selectedItems.length !== 1) return;
    var item: Position = selectedItems[0];
    var name: string = "";
    
    if (item.type === PositionType.participant) {
      setSelectedItem(item.participant);
      var id = item.participant.participantId;
      name = participantList.find(x => strEquals(x.id, id))!.displayName;
    } else if (item.type === PositionType.prop) {
      setSelectedItem(item.prop);
      var propId = item.prop.propId;
      name = propList.find(x => strEquals(x.id, propId))!.name;
    }
    
    setInputValue(name);
  }, [userContext.selectedItems]);

  const handleChange = (value) => {
    var newValue = value.target.value;
    setInputValue(newValue);
    if (isParticipantPosition(selectedItem)) {
      var updatedParticipant = {
        ...participantList.find(x => strEquals(x.id, selectedItem.participantId)),
        displayName: newValue
      } as Participant;
      updateFormationContext({participantList: [
        ...participantList.filter(x => !strEquals(x.id, selectedItem.participantId)),
        updatedParticipant
      ]})
      dbController.upsertItem("participant", updatedParticipant);
    } else if (isPropPosition(selectedItem)) {
      var updatedProp = {
        ...propList.find(x => strEquals(x.id, selectedItem.propId)),
        name: newValue
      } as Prop;
      updateFormationContext({propList: [
        ...propList.filter(x => !strEquals(x.id, selectedItem.propId)),
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