import React, { useContext, useEffect, useState } from "react";
import Divider from "../Divider.tsx";
import CategoryMenu from "./CategoryMenu.tsx";
import GridSettingsMenu from "./GridSettingsMenu.tsx";
import AnimationMenu from "./AnimationMenu.tsx";
import { UserContext } from "../../contexts/UserContext.tsx";
import ColorPickerMenu from "./ColorPickerMenu.tsx";
import ActionMenu from "./ActionMenu.tsx";
import NameEditor from "./NameEditor.tsx";
import NoteEditor from "./NoteEditor.tsx";
import { PositionType } from "../../models/Position.ts";
import { EntitiesContext } from "../../contexts/EntitiesContext.tsx";
import ExportMenu from "./ExportMenu.tsx";
import classNames from "classnames";
import { ICON } from "../../data/consts.ts";
import { FormationContext } from "../../contexts/FormationContext.tsx";

export type FormationRightPanelProps = {
  exportFunc?: (exportName: string) => void
}

export default function FormationRightPanel (props: FormationRightPanelProps) {
  const userContext = useContext(UserContext);
  const {selectedFormation} = useContext(FormationContext);
  const {selectedItems} = useContext(UserContext);
  const {participantList} = useContext(EntitiesContext);
  const [selectedPositionTypes, setSelectedPositionTypes] = useState<Set<PositionType>>();
  const [expanded, setExpanded] = React.useState(false);

  useEffect(() => {
    setSelectedPositionTypes(new Set(selectedItems.map(x => x.type)));
  }, [userContext.selectedItems])

  useEffect(() => {
    setExpanded(false);
  }, [selectedFormation]);

  var classes = classNames("flex flex-col overflow-y-auto bg-white border-l-2 border-solid border-grey", 
    {
      "w-80 max-w-80 p-5": expanded
    }
  );

  var buttonClasses = classNames("pb-2",
    {
      "h-full p-5 items-center": !expanded
    }
  )

  return (
    <div className={classes}>
      <button
        className={buttonClasses}
        onClick={() => setExpanded(prev => !prev)}>
        <img
          className="size-6"
          src={expanded ? ICON.arrowMenuOpenBlack : ICON.arrowMenuCloseBlack}/>
      </button>
      {
        expanded && 
        <>
          <Divider/>
          { selectedItems.length > 0 &&
            <>
              <ActionMenu/>
              <Divider/>
            </>
          }
          { selectedItems.length > 0 &&
            selectedPositionTypes?.size === 1 &&
            selectedPositionTypes.has(PositionType.participant) && // Todo make sure nothing is selected if the selected items have different categories
            <>
              <CategoryMenu/>
              <Divider/>
              {/* <SwapMenu/>
              <Divider/> */}
            </>
          }
          { selectedItems.length > 0 &&
            !selectedPositionTypes?.has(PositionType.participant) &&
            <>
              <ColorPickerMenu/>
              <Divider/>
            </>
          }
          { selectedItems.length === 1 &&
            (selectedPositionTypes?.has(PositionType.prop) ||
              selectedPositionTypes?.has(PositionType.participant)) &&
            <>
              <NameEditor/>
              <Divider/>
            </>
          }
          { selectedItems.length === 1 &&
            selectedPositionTypes?.size === 1 &&
            selectedPositionTypes.has(PositionType.note) &&
            <>
              <NoteEditor/>
              <Divider/>
            </>
          }
          <GridSettingsMenu/>
          { false && Object.values(participantList).length > 0 && 
            <>
              <Divider/>
              <AnimationMenu/>
            </>
          }
          <Divider/>
          <ExportMenu exportFunc={props.exportFunc}/>
        </>
      }
    </div>
  );
}