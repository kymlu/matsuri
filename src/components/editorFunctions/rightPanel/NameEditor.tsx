import React, { useContext, useEffect, useState } from "react";
import ExpandableSection from "../../ExpandableSection.tsx";
import { UserContext } from "../../../contexts/UserContext.tsx";
import { EntitiesContext } from "../../../contexts/EntitiesContext.tsx";
import { isParticipantPosition, isPropPosition, ParticipantPosition, Position, PositionType, PropPosition } from "../../../models/Position.ts";
import { dbController } from "../../../data/DBProvider.tsx";
import { ICON } from "../../../data/consts.ts";

export default function NameEditor() {
  const userContext = useContext(UserContext);
  const {selectedItems} = useContext(UserContext);
  const {participantList, propList, updateEntitiesContext} = useContext(EntitiesContext);

  const [inputValue, setInputValue] = useState("");
  const [selectedItem, setSelectedItem] = useState<ParticipantPosition | PropPosition | null>(null);
  
  useEffect(() => {
    if (selectedItems.length !== 1) return;
    var item: Position = selectedItems[0];
    var name: string = "";
    
    if (item.type === PositionType.participant) {
      setSelectedItem(item.participant);
      var id = item.participant.participantId;
      name = participantList[id].displayName;
    } else if (item.type === PositionType.prop) {
      setSelectedItem(item.prop);
      var propId = item.prop.propId;
      name = propList[propId].name;
    }
    
    setInputValue(name);
  }, [userContext.selectedItems]);

  const handleChange = (value) => {
    var newValue = value.target.value;
    setInputValue(newValue);
    
    if (isParticipantPosition(selectedItem)) {
      var updatedParticipants = {...participantList};
      updatedParticipants[selectedItem.participantId].displayName = newValue;
      updateEntitiesContext({participantList: updatedParticipants});
      dbController.upsertItem("participant", updatedParticipants[selectedItem.participantId]);
      
    } else if (isPropPosition(selectedItem)) {
      var updatedProps = {...propList};
      updatedProps[selectedItem.propId] = newValue;
      updateEntitiesContext({propList: updatedProps});
      dbController.upsertItem("prop", updatedProps[selectedItem.propId]);
    }
  };
  
  return (
    <ExpandableSection title="名前修正" titleIcon={ICON.textFieldsAltBlack}>
      <input
        value={inputValue}
        onInput={(event) => handleChange(event)}
        className="w-full h-8 px-2 mb-2 border-2 border-gray-200 rounded-md focus-within:border-primary focus:outline-none"/>
    </ExpandableSection>
  )
}