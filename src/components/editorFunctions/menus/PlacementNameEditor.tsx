import React, { useContext, useEffect, useState } from "react";
import ExpandableSection from "../../ExpandableSection.tsx";
import { UserContext } from "../../../contexts/UserContext.tsx";
import { EntitiesContext } from "../../../contexts/EntitiesContext.tsx";
import { PlaceholderPosition, Position, PositionType, PropPosition } from "../../../models/Position.ts";
import { dbController } from "../../../lib/dataAccess/DBProvider.tsx";
import { ICON } from "../../../lib/consts.ts";

export default function PlacementNameEditor() {
  const userContext = useContext(UserContext);
  const {selectedItems} = useContext(UserContext);
  const {placeholderList, updateEntitiesContext} = useContext(EntitiesContext);

  const [inputValue, setInputValue] = useState("");
  const [selectedItem, setSelectedItem] = useState<PlaceholderPosition | null>(null);
  
  useEffect(() => {
    if (selectedItems.length !== 1) return;
    var item: Position = selectedItems[0];
    var name: string = "";
    
    if (item.type === PositionType.placeholder) {
      setSelectedItem(item.placeholder);
      var id = item.placeholder.placeholderId;
      name = placeholderList[id].displayName;
    }
    
    setInputValue(name);
  }, [userContext.selectedItems]);

  const handleChange = (value: string) => {
    var newValue = value;
    setInputValue(newValue);
    
    var updatedPlaceholders = {...placeholderList};
    updatedPlaceholders[selectedItem!.placeholderId].displayName = newValue;
    updateEntitiesContext({placeholderList: updatedPlaceholders});
    dbController.upsertItem("placeholder", updatedPlaceholders[selectedItem!.placeholderId]);
  };
  
  return (
    <ExpandableSection title="名前修正" titleIcon={ICON.textFieldsAltBlack}>
      <input
        value={inputValue}
        onInput={(event) => handleChange(event.currentTarget.value)}
        className="w-full h-8 px-2 mb-2 border-2 border-gray-200 rounded-md focus-within:border-primary focus:outline-none"/>
    </ExpandableSection>
  )
}