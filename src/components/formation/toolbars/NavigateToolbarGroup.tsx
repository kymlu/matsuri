import React, { useRef, useState, useEffect, useContext } from "react";
import { UserContext } from "../../../contexts/UserContext.tsx";
import { ICON } from "../../../data/consts.ts";
import { strEquals } from "../../../helpers/GlobalHelper.ts";
import { FormationSection } from "../../../models/FormationSection.tsx";
import CustomMenu from "../../CustomMenu.tsx";
import { CustomToolbarGroup, CustomToolbarButton } from "../../CustomToolbar.tsx";
import SectionOptionButton from "../../SectionOptionButton.tsx";

export function NavigateToolbarGroup(props: {
  disablePrevious: boolean,
  disableList: boolean,
  disableNext: boolean,
  onChange?: (sectionId?: FormationSection, isNext?: boolean) => void,
}) {
	const listButtonRef = useRef<HTMLButtonElement>(null);
  const [isHorizontal, setIsHorizontal] = useState(false);

  useEffect(() => {
    const node = listButtonRef.current;
    if (!node) return;

    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (
          mutation.type === "attributes" &&
          mutation.attributeName === "data-orientation"
        ) {
          const orientation = node.getAttribute("data-orientation");
          if (orientation === "horizontal") {
            setIsHorizontal(true);
          } else {
            setIsHorizontal(false);
          }
        }
      }
    });

    observer.observe(node, {
      attributes: true,
      attributeFilter: ["data-orientation"],
    });

    // Check initial value
    const initialOrientation = node.getAttribute("data-orientation");
    setIsHorizontal(initialOrientation === "horizontal");

    return () => observer.disconnect();
  }, []);

  return (
    <CustomToolbarGroup>
      <CustomToolbarButton
        iconLeft
        text="前へ"
        disabled={props.disablePrevious}
        iconFileName={ICON.chevronBackwardBlack}
        onClick={() => {props.onChange?.(undefined, false)}}/>
      <CustomMenu 
        position={isHorizontal ? "top" : "left"} // todo: if changing orientation this doesn't update
        trigger={
          <CustomToolbarButton
            ref={listButtonRef}
            isDiv
            iconLeft
            text="セクション"
            disabled={props.disableList}
            iconFileName={ICON.listsBlack}/>
          }>
        <SectionPicker onChange={props.onChange}/>
      </CustomMenu>
      <CustomToolbarButton
        text="次へ"
        disabled={props.disableNext}
        iconFileName={ICON.chevronForwardBlack}
        onClick={() => {props.onChange?.(undefined, true)}}/>
    </CustomToolbarGroup>
  )
}

function SectionPicker (props: {
  onChange?: (sectionId?: FormationSection, isNext?: boolean) => void,
}) {
  const {currentSections, selectedSection} = useContext(UserContext);
	const sectionButtonRef = useRef<React.RefObject<HTMLDivElement | null>[]>([]);

  useEffect(() => {
    currentSections
      .forEach((_, index) => 
        sectionButtonRef.current[index] = React.createRef<HTMLDivElement>()
      );
  }, [currentSections]);

  useEffect(() => {
    const selectedIndex = currentSections.findIndex(section => strEquals(section.id, selectedSection?.id));
    if (selectedIndex >= 0) {
      sectionButtonRef.current[selectedIndex]?.current?.scrollIntoView({
        behavior: "smooth",
        block: "center"
      });
    }
  }, [selectedSection]);
  return (
    <>
      {
        currentSections
					.sort((a, b) => a.order - b.order)
          .map((section, index) => 
            <SectionOptionButton
              key={section.id}
              canEdit={false}
              text={section.displayName}
              isSelected={strEquals(selectedSection?.id, section.id)}
              ref={sectionButtonRef.current[index]}
              onClick={() => {
              props.onChange?.(section, undefined);
              }}/>
        )
      }
    </>
  )
}