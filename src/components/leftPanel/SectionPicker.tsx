import React, { useContext } from "react";
import ExpandableSection from "../ExpandableSection.tsx";
import { UserContext } from "../../contexts/UserContext.tsx";
import { FormationSongSection } from "../../models/FormationSection.ts";
import { isNullOrUndefined, strEquals } from "../helpers/GlobalHelper.ts";
import { PositionContext } from "../../contexts/PositionContext.tsx";
import SectionOptionButton from "../SectionOptionButton.tsx";
import { dbController } from "../../data/DBProvider.tsx";
import { ParticipantPosition, PropPosition } from "../../models/Position.ts";
import CustomMenu, { MenuItem, MenuSeparator } from "../CustomMenu.tsx";
import { songList } from "../../data/ImaHitotabi.ts";

export default function SectionPicker() {
	const { currentSections, selectedFormation, selectedSection, updateState, marginPositions } =
		useContext(UserContext);
	const { participantPositions, propPositions, updatePositionState } =
		useContext(PositionContext);

	function selectSection(section: FormationSongSection) {
		participantPositions
			.filter((x) => x.isSelected)
			.forEach((x) => (x.isSelected = false));
		propPositions
			.filter((x) => x.isSelected)
			.forEach((x) => (x.isSelected = false));
		updateState({ selectedSection: section, selectedItem: null });
	}

	function copyPositions(
		sourceSection: FormationSongSection,
		targetSections: FormationSongSection | FormationSongSection[]
	) {
		if (isNullOrUndefined(selectedSection) || isNullOrUndefined(targetSections))
			return;

		// Ensure targetSections is always an array
		const targetSectionsArray = Array.isArray(targetSections)
			? targetSections
			: [targetSections];

		// Copy participant positions
		const copiedParticipantPositions = participantPositions
			.filter((position) =>
				strEquals(position.formationSceneId, sourceSection.id)
			)
			.flatMap((position) =>
				targetSectionsArray.map(
					(section) =>
						({
							...position,
							formationSceneId: section.id,
							id: crypto.randomUUID(),
						} as ParticipantPosition)
				)
			);

		// Copy prop positions
		const copiedPropPositions = propPositions
			.filter((position) =>
				strEquals(position.formationSceneId, sourceSection.id)
			)
			.flatMap((position) =>
				targetSectionsArray.map(
					(section) =>
						({
							...position,
							formationSceneId: section.id,
							id: crypto.randomUUID(),
						} as PropPosition)
				)
			);

		const targetSectionIds = targetSectionsArray.map((x) => x.id);

		dbController.removeList(
			"participantPosition",
			participantPositions
				.filter((position) =>
					targetSectionIds.includes(position.formationSceneId)
				)
				.map((x) => x.id)
		);

		dbController.removeList(
			"propPosition",
			propPositions
				.filter((position) =>
					targetSectionIds.includes(position.formationSceneId)
				)
				.map((x) => x.id)
		);

		// Upsert new positions
		dbController.upsertList("participantPosition", copiedParticipantPositions);
		dbController.upsertList("propPosition", copiedPropPositions);

		// Update state
		return new Promise<number>((resolve, reject) => {
			dbController.getAll("participantPosition").then((participantPosition) => {
				try {
					const participantPositionList =
						participantPosition as Array<ParticipantPosition>;
					updatePositionState({
						participantPositions: participantPositionList,
					});

					dbController.getAll("propPosition").then((propPosition) => {
						const propPositionList = propPosition as Array<PropPosition>;
						updatePositionState({
							propPositions: propPositionList,
						});
						resolve(1);
					});
				} catch (error) {
					console.error("Error updating positions:", error);
					reject(error);
				}
			});
		});
	}

	function copyToCurrent(sourceSection: FormationSongSection) {
		if (isNullOrUndefined(selectedSection)) return;
		copyPositions(sourceSection, selectedSection!);
	}

	function copyToFuture(sourceSection: FormationSongSection) {
		if (isNullOrUndefined(selectedSection)) return;

		const futureSections = currentSections.filter(
			(section) => section.order > selectedSection!.order
		);

		copyPositions(sourceSection, futureSections);
	}

	function copyToNewSection(
		lastSection: FormationSongSection,
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
		} as FormationSongSection;

		dbController.upsertItem("formationSection", newSection).then(() => {
			updateState({ currentSections: [...currentSections, newSection] });
			copyPositions(lastSection, newSection as FormationSongSection)?.then(
				() => {
					selectSection(newSection);
				}
			);
		});
	}

  function duplicate(sourceSection: FormationSongSection) {
		var newSection = {
			id: crypto.randomUUID(),
			displayName: `${sourceSection.displayName} (1)`,
			formationId: lastSection.formationId,
			songSectionId: sourceSection.songSectionId,
			order: sourceSection.order + 1,
		} as FormationSongSection;

		var updatedSections = currentSections
      .filter((x) => x.order > sourceSection.order)
			.slice()
			.map((x) => {
				return { ...x, order: x.order + 1 } as FormationSongSection;
			});

		dbController
			.upsertList("formationSection", [...updatedSections, newSection])
			.then(() => {
        dbController.getAll("formationSection").then((formationSections) => {
				updateState({
					currentSections: [
						...(formationSections as Array<FormationSongSection>)
              .filter((x) => strEquals(x.formationId, selectedFormation!.id)) as FormationSongSection[],
					],
				});
				copyPositions(lastSection, newSection as FormationSongSection)?.then(
					() => {
						selectSection(newSection);
					}
				);
			})});
	}

	function resetPosition(sourceSection: FormationSongSection) {
		participantPositions
			.filter((position) =>
				strEquals(position.formationSceneId, sourceSection.id)
			)
			.forEach((position, index) => {
				position.x = marginPositions.participants[index][0];
				position.x2 = marginPositions.participants[index][0];
				position.y = marginPositions.participants[index][1];
				position.y2 = marginPositions.participants[index][1];
			});

		propPositions
			.filter((position) =>
				strEquals(position.formationSceneId, sourceSection.id)
			)
			.forEach((position, index) => {
				position.x = marginPositions.props[index][0];
				position.x2 = marginPositions.props[index][0];
				position.y = marginPositions.props[index][1];
				position.y2 = marginPositions.props[index][1];
			});

		Promise.all([
			dbController.upsertList(
				"participantPosition",
				participantPositions.filter((position) =>
					strEquals(position.formationSceneId, sourceSection.id)
				)
			),
			dbController.upsertList(
				"propPosition",
				propPositions.filter((position) =>
					strEquals(position.formationSceneId, sourceSection.id)
				)
			),
		]).then(() => {
			Promise.all([
				dbController.getAll("participantPosition"),
				dbController.getAll("propPosition"),
			]).then(([participantPosition, propPosition]) => {
				try {
					var participantPositionList =
						participantPosition as Array<ParticipantPosition>;
					var propPositionList = propPosition as Array<PropPosition>;
					updatePositionState({
						participantPositions: participantPositionList,
						propPositions: propPositionList,
					});
					participantPositions.forEach((p) => {
						// todo: remove, probably
						p.x2 = p.x;
						p.y2 = p.y;
					});
					propPositions.forEach((p) => {
						// todo: remove, probably
						p.x2 = p.x;
						p.y2 = p.y;
					});
				} catch (e) {
					console.error("Error parsing user from localStorage:", e);
				}
			});
		});

		dbController.getAll("participantPosition").then((participantPosition) => {
			try {
				var participantPositionList =
					participantPosition as Array<ParticipantPosition>;
				updatePositionState({
					participantPositions: participantPositionList,
				});
				participantPositions.forEach((p) => {
					// todo: remove, probably
					p.x2 = p.x;
					p.y2 = p.y;
				});
			} catch (e) {
				console.error("Error parsing user from localStorage:", e);
			}
		});
	}

  function onNameChange(section: FormationSongSection, newName: string) {
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
		? songList[0].sections.find((x) => x.order == lastSectionDetails!.order + 1)
		: undefined;

	return (
		<ExpandableSection title="セクション" defaultIsExpanded>
			<div className="flex flex-col overflow-x-hidden overflow-y-auto max-h-28">
				{currentSections
					.sort((a, b) => a.order - b.order)
					.map((section, index, array) => (
						<SectionOptionButton
							key={section.id}
							text={section.displayName ?? "No Name"}
							isSelected={strEquals(selectedSection?.id, section.id)}
							isBottom={index === array.length - 1}
              onEditName={(newName) => onNameChange(section, newName)}
							onClick={() => selectSection(section)}
							onCopyToCurrent={() => copyToCurrent(section)}
							onCopyToFuture={() => copyToFuture(section)}
							onDuplicate={() => duplicate(section)}
							onResetPosition={() => resetPosition(section)}
						/>
					))}
			</div>
			{lastSection && (
				<CustomMenu
					full
					trigger={<div className="w-full hover:bg-grey-200"><img className="m-auto size-6" src="icons/add_black.svg"/></div>}>
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
