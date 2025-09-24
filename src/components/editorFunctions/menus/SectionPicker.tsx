import React, { useContext, useRef } from "react";
import ExpandableSection from "../../ExpandableSection.tsx";
import { UserContext } from "../../../contexts/UserContext.tsx";
import { FormationSection } from "../../../models/FormationSection.ts";
import { isNullOrUndefined, strEquals } from "../../../helpers/GlobalHelper.ts";
import { PositionContext } from "../../../contexts/PositionContext.tsx";
import SectionOptionButton from "../../SectionOptionButton.tsx";
import { dbController } from "../../../data/DBProvider.tsx";
import { ParticipantPosition, PropPosition } from "../../../models/Position.ts";
import CustomMenu, { MenuItem, MenuSeparator } from "../../CustomMenu.tsx";
import { arrowPresets, propsList, songList } from "../../../data/ImaHitotabi.ts";
import { EntitiesContext } from "../../../contexts/EntitiesContext.tsx";
import { AnimationContext } from "../../../contexts/AnimationContext.tsx";
import { SettingsContext } from "../../../contexts/SettingsContext.tsx";
import { ICON } from "../../../data/consts.ts";
import { MarginPositions } from "../../../pages/FormationPage.tsx";
import { addItemsToRecordByKey, removeItemsByCondition, removeKeysFromRecord, replaceItemsFromDifferentSource, selectValuesByKeys } from "../../../helpers/GroupingHelper.ts";

export default function SectionPicker(props: {margins: MarginPositions}) {
	const { currentSections, selectedSection, updateState, isLoading } =
		useContext(UserContext);
	const { participantPositions, propPositions, notePositions, arrowPositions, updatePositionContextState } =
		useContext(PositionContext);
	const { participantList, propList } =
		useContext(EntitiesContext);
	const { isAnimating } =
		useContext(AnimationContext);
	const {enableAnimation} =
		useContext(SettingsContext);

	const sectionButtonRef = useRef<React.RefObject<HTMLDivElement | null>[]>([]);

  currentSections
    .forEach((_, index) => 
      sectionButtonRef.current[index] = React.createRef<HTMLDivElement>()
    );
		
	function selectSection(section: FormationSection) {
		if (isLoading || isAnimating) return;

		updateState({
			isLoading: enableAnimation,
			previousSectionId: selectedSection ? selectedSection.id : null,
			selectedSection: section,
			selectedItems: [],
		});
		sectionButtonRef?.current[section.order - 1]?.current?.scrollIntoView({
			behavior: "smooth",
			block: "center"
		});
	}

	function copyPositions(
		sourceSection: FormationSection,
		targetSections: FormationSection | FormationSection[]
	) {
		if (isNullOrUndefined(selectedSection) || isNullOrUndefined(targetSections))
			return;

		// Ensure targetSections is always an array
		const targetSectionsArray = Array.isArray(targetSections)
			? targetSections
			: [targetSections];

		// Copy participant positions
		return new Promise<number>((resolve, reject) => { 
			try {
				if ((Object.keys(participantList).length + Object.keys(propsList).length) === 0) resolve(1);
				
				var allSectionIds = [sourceSection.id, ...targetSectionsArray.map(x => x.id)];
				var participants = selectValuesByKeys(participantPositions, allSectionIds).flat();
				var props = selectValuesByKeys(propPositions, allSectionIds).flat();
				
				const copiedParticipantPositions = participants
					.filter((position) =>
						strEquals(position.formationSectionId, sourceSection.id)
					)
					.flatMap((position) =>
						targetSectionsArray.map(
							(section) =>
								({
									...position,
									formationSectionId: section.id,
									id: crypto.randomUUID(),
								} as ParticipantPosition)
						)
					);
		
				// Copy prop positions
				const copiedPropPositions = props
					.filter((position) =>
						strEquals(position.formationSectionId, sourceSection.id)
					)
					.flatMap((position) =>
						targetSectionsArray.map(
							(section) =>
								({
									...position,
									formationSectionId: section.id,
									id: crypto.randomUUID(),
								} as PropPosition)
						)
					);

				const targetSectionIds = targetSectionsArray.map((x) => x.id);

				var participantsToRemove = participants
					.filter((position) => targetSectionIds.includes(position.formationSectionId))
					.map((x) => x.id);

				var propsToRemove = props
					.filter((position) => targetSectionIds.includes(position.formationSectionId))
					.map((x) => x.id);
				
				// Remove old
				dbController.removeList("participantPosition", participantsToRemove);
				dbController.removeList("propPosition", propsToRemove);
		
				// Upsert new positions
				dbController.upsertList("participantPosition", copiedParticipantPositions);
				dbController.upsertList("propPosition", copiedPropPositions);

				var updatedParticipantPositions = replaceItemsFromDifferentSource(
					participantPositions,
					participantsToRemove,
					copiedParticipantPositions,
					(item) => item.formationSectionId,
					(item) => item.id);
					
				var updatedPropPositions = replaceItemsFromDifferentSource(
					propPositions,
					propsToRemove,
					copiedPropPositions,
					(item) => item.formationSectionId,
					(item) => item.id);

				updatePositionContextState({
					participantPositions: updatedParticipantPositions,
					propPositions: updatedPropPositions,
				});
				
				resolve(1);
			} catch (error) {
				console.error("Error updating positions:", error);
				reject(error);
			}
		});
	}

	function copyToCurrent(sourceSection: FormationSection) {
		if (isNullOrUndefined(selectedSection)) return;
		copyPositions(sourceSection, selectedSection!);
	}

	function copyToFuture(sourceSection: FormationSection) {
		if (isNullOrUndefined(selectedSection)) return;

		const futureSections = currentSections.filter(
			(section) => section.order > selectedSection!.order
		);

		copyPositions(sourceSection, futureSections);
	}

	function copyToNewSection(
		lastSection: FormationSection,
		nextSectionId: string
	) {
		var countOfThisSection = currentSections.filter((x) =>
			strEquals(x.songSectionId, nextSectionId)
		).length;

		var newSection = {
			id: crypto.randomUUID(),
			displayName:
				songList[0].sections.find((x) => strEquals(x.id, nextSectionId))!.name +
				(countOfThisSection ? ` (${countOfThisSection})` : ""),
			formationId: lastSection.formationId,
			songSectionId: nextSectionId,
			order: lastSection.order + 1,
		} as FormationSection;

		dbController.upsertItem("formationSection", newSection).then(() => {
			updateState({ currentSections: [...currentSections, newSection] });
			copyPositions(lastSection, newSection as FormationSection)?.then(
				() => {
					selectSection(newSection);
				}
			);
		});
	}

  function duplicate(sourceSection: FormationSection) {
		var newSection = {
			id: crypto.randomUUID(),
			displayName: `${sourceSection.displayName} (1)`,
			formationId: sourceSection.formationId,
			songSectionId: sourceSection.songSectionId,
			order: sourceSection.order + 1,
		} as FormationSection;

		var updatedSections = currentSections
      .filter((x) => x.order > sourceSection.order)
			.slice()
			.map((x) => {
				return { ...x, order: x.order + 1 } as FormationSection;
			});

		var updatedSectionIds = updatedSections.map(x => x.id);

		dbController.upsertList("formationSection", [...updatedSections, newSection])
		updateState({
			currentSections: [
				...currentSections.filter(x => !updatedSectionIds.includes(x.id)),
				...updatedSections,
				newSection
			],
		});
		
		copyPositions(sourceSection, newSection as FormationSection)?.then(
			() => {
				selectSection(newSection);
			}
		);
	}

	function resetPosition(sourceSection: FormationSection) {
		var resetParticipants = participantPositions[sourceSection.id]
			.sort((a, b) => a.participantId.localeCompare(b.participantId))
			.map((position, index) => (
				{
					...position,
					x: props.margins.participants[index % props.margins.participants.length][0],
					y: props.margins.participants[index % props.margins.participants.length][1],
				} as ParticipantPosition));
				
		var resetProps = propPositions[sourceSection.id]
			.sort((a, b) => a.propId.localeCompare(b.propId))
			.map((position, index) => (
				{
					...position,
					x: props.margins.props[index % props.margins.props.length][0],
					y: props.margins.props[index % props.margins.props.length][1],
				} as PropPosition));

		try {
			dbController.upsertList("participantPosition", resetParticipants);
			dbController.upsertList("propPosition", resetProps);

			var resetParticipantIds = resetParticipants.map(x => x.id);
			var resetPropIds = resetProps.map(x => x.id);

			var updatedParticipantPositions = addItemsToRecordByKey(removeItemsByCondition(participantPositions, x => resetParticipantIds.includes(x.id)), resetParticipants, (item) => item.formationSectionId);
			var updatedPropPositions = addItemsToRecordByKey(removeItemsByCondition(propPositions, x => resetPropIds.includes(x.id)), resetProps, (item) => item.formationSectionId);

			updatePositionContextState({
				participantPositions: updatedParticipantPositions,
				propPositions: updatedPropPositions,
			});
		} catch (e) {
			console.error("Error parsing user from localStorage:", e);
		}
	}

	function onDelete(section: FormationSection) {
		const participantIdsToRemove = participantPositions[section.id].map(x => x.id);
		const propIdsToRemove = propPositions[section.id].map(x => x.id);
		const noteIdsToRemove = notePositions[section.id].map(x => x.id);
		const arrowIdsToRemove = arrowPositions[section.id].map(x => x.id);

		Promise.all([
			dbController.removeList("participantPosition", participantIdsToRemove),
			dbController.removeList("propPosition", propIdsToRemove),
			dbController.removeList("notePosition", noteIdsToRemove),
			dbController.removeList("arrowPosition", arrowIdsToRemove),
			dbController.removeItem("formationSection", section.id),
		]).then(()=>{
			updatePositionContextState({
				participantPositions: removeKeysFromRecord(participantPositions, new Set(section.id)),
				propPositions: removeKeysFromRecord(propPositions, new Set(section.id)),
				notePositions: removeKeysFromRecord(notePositions, new Set(section.id)),
				arrowPositions: removeKeysFromRecord(arrowPositions, new Set(section.id)),
			});
			var newSections = currentSections.filter(x => !strEquals(x.id, section.id));
			updateState({
				currentSections: newSections,
				selectedSection: newSections[0],
			});
		});
	}

  function onNameChange(section: FormationSection, newName: string) {
    var updatedSection = {...section, displayName: newName};
    dbController.upsertItem("formationSection", updatedSection).then(() => {
      updateState({
        currentSections: currentSections.map(x => strEquals(x.id, section.id) ? updatedSection : x),
        selectedSection: updatedSection,
      });
    });
  }

	var lastSection = currentSections
		.slice()
		?.sort((a, b) => b.order - a.order)[0];
	var lastSectionCount = currentSections.filter((x) =>
		strEquals(x.songSectionId, lastSection?.songSectionId)
	).length;
	var lastSectionDetails = songList[0].sections.find((x) =>
		strEquals(x.id, lastSection?.songSectionId)
	);
	var nextSection = lastSectionDetails
		? songList[0].sections.find((x) => x.order === lastSectionDetails!.order + 1)
		: undefined;

	return (
		<ExpandableSection
			canExpand
			title="セクション"
			defaultIsExpanded
			titleIcon={ICON.listsBlack}>
			<div className="flex flex-col overflow-x-hidden overflow-y-auto max-h-28">
				{currentSections
					.sort((a, b) => a.order - b.order)
					.map((section, index, array) => (
						<SectionOptionButton
							canEdit={true}
							disabled={isLoading || isAnimating}
							key={section.id}
							text={section.displayName ?? "No Name"}
							isSelected={strEquals(selectedSection?.id, section.id)}
              onEditName={(newName) => onNameChange(section, newName)}
							onClick={() => selectSection(section)}
							onCopyToCurrent={() => copyToCurrent(section)}
							onCopyToFuture={() => copyToFuture(section)}
							onDuplicate={() => duplicate(section)}
							onResetPosition={() => resetPosition(section)}
							onDelete={() => onDelete(section)}
							ref={sectionButtonRef.current[index]}
							showDelete={currentSections.length > 1}
							showReset={(Object.keys(participantList).length + Object.keys(propList).length + Object.keys(notePositions).length) > 0}
						/>
					))}
			</div>
			{lastSection && (
				<CustomMenu
					full
					trigger={
						<div className="w-full lg:hover:bg-grey-200">
							<img
								alt="Add icon"
								className="m-auto size-10"
								src={ICON.addBlack}/>
						</div>}>
          {nextSection && (
            <>
              <MenuItem
                label={`「${nextSection?.name}」追加`}
                onClick={() => {
                  copyToNewSection(lastSection!, nextSection!.id);
                }}
              />
              <MenuSeparator />
            </>
          )}
					<MenuItem
						label={`「${lastSectionDetails?.name} (${lastSectionCount}）」追加`}
						onClick={() => {
							copyToNewSection(lastSection!, lastSection.songSectionId);
						}}
					/>
				</CustomMenu>
			)}
		</ExpandableSection>
	);
}
