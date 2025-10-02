import React, {
	useContext,
	useEffect,
	useImperativeHandle,
	useRef,
	useState,
} from "react";
import { Layer, Rect, Transformer } from "react-konva";
import {
	ArrowPosition,
	createPosition,
	getAllIds,
	getFromPositionType,
	NotePosition,
	ParticipantPosition,
	Position,
	PositionType,
	PropPosition,
	splitPositionsByType,
} from "../../../models/Position.ts";
import { objectColorSettings, basePalette, objectPalette } from "../../../themes/colours.ts";
import { strEquals } from "../../../helpers/GlobalHelper.ts";
import { getPixel } from "../../../helpers/FormationHelper.ts";
import NoteObject from "../formationObjects/NoteObject.tsx";
import ParticipantObject from "../formationObjects/ParticipantObject.tsx";
import PropObject from "../formationObjects/PropObject.tsx";
import Konva from "konva";
import { AnimationContext } from "../../../contexts/AnimationContext.tsx";
import { PositionContext } from "../../../contexts/PositionContext.tsx";
import { UserContext } from "../../../contexts/UserContext.tsx";
import { dbController } from "../../../data/DBProvider.tsx";
import { Group } from "konva/lib/Group";
import { CUSTOM_EVENT } from "../../../data/consts.ts";
import { ParticipantCategory } from "../../../models/ParticipantCategory.ts";
import { Participant } from "../../../models/Participant.ts";
import { Prop } from "../../../models/Prop.ts";
import { AppModeContext } from "../../../contexts/AppModeContext.tsx";
import { VisualSettingsContext } from "../../../contexts/VisualSettingsContext.tsx";
import ArrowObject from "../formationObjects/ArrowObject.tsx";

export type FormationMainLayerProps = {
	topMargin: number;
	bottomMargin: number;
	sideMargin: number;
	ref: React.Ref<any>;
	categories: Record<string, ParticipantCategory>;
	participants: Record<string, Participant>;
	props: Record<string, Prop>;
	partPositions: ParticipantPosition[];
	propPositions: PropPosition[];
	notePositions: NotePosition[];
	arrowPositions: ArrowPosition[];
};

export function FormationMainLayer(props: FormationMainLayerProps) {
  const {gridSize, followingId, updateVisualSettingsContext} = useContext(VisualSettingsContext);
	const userContext = useContext(UserContext);
	const { isAnimating } = useContext(AnimationContext);
	const { appMode } = useContext(AppModeContext);
	const { selectedItems, updateState } = useContext(UserContext);
	const positionContext = useContext(PositionContext);
	const layerRef = useRef<Konva.Layer>(null);
	const transformerRef = useRef<Konva.Transformer>(null);
	const participantRef = useRef<React.RefObject<Konva.Group | null>[]>([]);
	const propRef = useRef<React.RefObject<Konva.Group | null>[]>([]);
	const noteRef = useRef<React.RefObject<Konva.Group | null>[]>([]);
	const arrowGroupRef = useRef<React.RefObject<Konva.Group | null>[]>([]);
	const arrowRef = useRef<React.RefObject<Konva.Arrow | null>[]>([]);
	const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
	const [isSinglePropSelected, setIsSinglePropSelected] = useState<boolean>(false);
	const [isSingleNoteSelected, setIsSingleNoteSelected] = useState<boolean>(false);
	const [isSingleArrowSelected, setIsSingleArrowSelected] = useState<boolean>(false);

	const positionContextRef = useRef(positionContext);

	// Keep ref up to date
	useEffect(() => {
		positionContextRef.current = positionContext;
	}, [positionContext]);

	useImperativeHandle(props.ref, () => ({
		clearSelections: () => {
			updateState({ selectedItems: [] });
			setSelectedIds(new Set());
		},

		onMouseDown: (e) => {
			if (e.target !== e.target.getStage()) return;

			const isElement = e.target.findAncestor(".elements-container");
			const isTransformer = e.target.findAncestor("Transformer");
			if (isElement || isTransformer || appMode === "view") {
				return;
			}

			const pos = e.target.getStage().getPointerPosition();
			selection.current.visible = true;
			selection.current.x1 = pos.x;
			selection.current.y1 = pos.y;
			selection.current.x2 = pos.x;
			selection.current.y2 = pos.y;
			updateSelectionRect();
		},

		onMouseMove: (e) => {
			if (!selection.current.visible || appMode === "view") {
				return;
			}
			const pos = e.target.getStage().getPointerPosition();
			selection.current.x2 = pos.x;
			selection.current.y2 = pos.y;
			updateSelectionRect();
		},

		onMouseUp: (e) => {
			oldPos.current = null;
			selection.current.visible = false;
			const { x1, x2, y1, y2 } = selection.current;
			const moved = x1 !== x2 || y1 !== y2;
			// if not moved or moving while selecting a selected item
			if (!moved || selectedIds.has(e.target?.parent?.attrs?.id)) {
				updateSelectionRect();
				return;
			}

			if (selectionRectRef.current) {
				const selBox = selectionRectRef.current?.getClientRect();

				const selectedParticipantIds: Set<string> = new Set();
				participantRef.current?.forEach((elementNode) => {
					if (elementNode.current) {
						var node = elementNode as React.RefObject<Group>;
						const elBox = node.current.getClientRect();
						if (Konva.Util.haveIntersection(selBox, elBox)) {
							selectedParticipantIds.add(node.current.attrs.id);
						}
					}
				});

				const selectedPropIds: Set<string> = new Set();
				if (appMode === "edit") {
					propRef.current?.forEach((elementNode) => {
						if (elementNode.current) {
							var node = elementNode as React.RefObject<Group>;
							const elBox = node.current.getClientRect();
							if (Konva.Util.haveIntersection(selBox, elBox)) {
								selectedPropIds.add(node.current.attrs.id);
							}
						}
					});
				}

				const selectedNoteIds: Set<string> = new Set();
				if (appMode === "edit") {
					noteRef.current?.forEach((elementNode) => {
						if (elementNode.current) {
							var node = elementNode as React.RefObject<Group>;
							const elBox = node.current.getClientRect();
							if (Konva.Util.haveIntersection(selBox, elBox)) {
								selectedNoteIds.add(node.current.attrs.id);
							}
						}
					});
				}

				const selectedArrowIds: Set<string> = new Set();
				if (appMode === "edit") {
					arrowGroupRef.current?.forEach((elementNode) => {
						if (elementNode.current) {
							var node = elementNode as React.RefObject<Group>;
							const elBox = node.current.getClientRect();
							if (Konva.Util.haveIntersection(selBox, elBox)) {
								selectedArrowIds.add(node.current.attrs.id);
							}
						}
					});
				}

				updateState({
					selectedItems: [
						...props.partPositions
							?.filter((x) => selectedParticipantIds.has(x.id))
							.map((x) =>({type: PositionType.participant, participant: x,} as Position)) ?? [],
						...props.propPositions
							?.filter((x) => selectedPropIds.has(x.id))
							?.map((x) => ({ type: PositionType.prop, prop: x } as Position)) ?? [],
						...props.notePositions
							?.filter((x) => selectedNoteIds.has(x.id))
							?.map((x) => ({ type: PositionType.note, note: x } as Position)) ?? [],
						...props.arrowPositions
							?.filter((x) => selectedArrowIds.has(x.id))
							?.map((x) => ({ type: PositionType.arrow, arrow: x } as Position)) ?? [],
					],
				});

				var allSelectedIds = new Set([
					...selectedParticipantIds,
					...selectedPropIds,
					...selectedNoteIds,
					...selectedArrowIds,
				]);

				setSelectedIds(allSelectedIds);

				setIsSinglePropSelected(allSelectedIds.size === 1 && selectedPropIds.size === 1);
				setIsSingleNoteSelected(allSelectedIds.size === 1 && selectedNoteIds.size === 1);
				setIsSingleArrowSelected(allSelectedIds.size === 1 && selectedArrowIds.size === 1);

				updateSelectionRect();
			}
		},
	}));

	const selectionRectRef = React.useRef<Konva.Rect | null>(null);
	const selection = React.useRef({
		visible: false,
		x1: 0,
		y1: 0,
		x2: 0,
		y2: 0,
	});

	const updateSelectionRect = () => {
		if (selectionRectRef.current) {
			const node = selectionRectRef.current;
			node.setAttrs({
				visible: selection.current.visible,
				x: Math.min(selection.current.x1, selection.current.x2),
				y: Math.min(selection.current.y1, selection.current.y2),
				width: Math.abs(selection.current.x1 - selection.current.x2),
				height: Math.abs(selection.current.y1 - selection.current.y2),
				fill: "rgba(0, 161, 255, 0.3)",
			});
		}
	};

	const oldPos = React.useRef(null);

	function refreshTransformer() {
		// todo: apply this to note label change
		transformerRef.current?.forceUpdate();
	}

	function selectAllFromPositionType(event) {
		var positionType = (event as CustomEvent)?.detail
			?.positionType as PositionType;
		switch (positionType) {
			case PositionType.participant:
				var participants = positionContextRef.current.participantPositions[userContext.selectedSection!.id];
				updateState({
					selectedItems: participants.map(
						(x) =>
							({ type: PositionType.participant, participant: x } as Position)
					),
				});
				setSelectedIds(new Set(participants.map((x) => x.id)));
				break;

			case PositionType.prop:
				var props = positionContextRef.current.propPositions[userContext.selectedSection!.id];
				updateState({
					selectedItems: props.map(
						(x) => ({ type: PositionType.prop, prop: x } as Position)
					),
				});
				setSelectedIds(new Set(props.map((x) => x.id)));
				break;

			case PositionType.note:
				var notes = positionContextRef.current.notePositions[userContext.selectedSection!.id];
				updateState({
					selectedItems: notes.map(
						(x) => ({ type: PositionType.note, note: x } as Position)
					),
				});
				setSelectedIds(new Set(notes.map((x) => x.id)));
				break;

			case PositionType.arrow:
				var arrows = positionContextRef.current.arrowPositions[userContext.selectedSection!.id];
				updateState({
					selectedItems: arrows.map(
						(x) => ({ type: PositionType.arrow, arrow: x } as Position)
					),
				});
				setSelectedIds(new Set(arrows.map((x) => x.id)));
				break;

			default:
				break;
		}
	}

	useEffect(() => {
		window.addEventListener(
			CUSTOM_EVENT.selectAllPositionType,
			selectAllFromPositionType
		);

		return () => {
			window.removeEventListener(
				CUSTOM_EVENT.selectAllPositionType,
				selectAllFromPositionType
			);
		};
	}, [userContext]);

	function selectAllFromCategory(event) {
		var newSelection = positionContextRef.current.participantPositions[userContext.selectedSection!.id].filter(
			(x) =>
				strEquals((event as CustomEvent)?.detail?.categoryId, x.categoryId)
		);

		updateState({
			selectedItems: newSelection.map(
				(x) => ({ type: PositionType.participant, participant: x } as Position)
			),
		});
		setSelectedIds(new Set(newSelection.map((x) => x.id)));
	}

	useEffect(() => {
		window.addEventListener(
			CUSTOM_EVENT.selectAllFromCategory,
			selectAllFromCategory
		);

		return () => {
			window.removeEventListener(
				CUSTOM_EVENT.selectAllFromCategory,
				selectAllFromCategory
			);
		};
	}, [userContext]);

	useEffect(() => {
		refreshTransformer();
	}, [gridSize]);

	useEffect(() => {
		if (
			transformerRef?.current &&
			layerRef?.current &&
			selectedIds.size > 0 && 
			!isSingleArrowSelected
		) {
			const nodes = [...selectedIds]
				.map((id) => layerRef!.current!.findOne("#" + id))
				.filter((x) => x !== undefined);
			transformerRef?.current!.nodes(nodes);
		} else {
			transformerRef?.current!.nodes([]);
		}
	}, [selectedIds, isSingleArrowSelected]);

	useEffect(() => {
		Object.values(props.participants)
      ?.sort((a, b) => a.id.localeCompare(b.id))
      ?.forEach(
        (_, index) =>
          (participantRef.current[index] = React.createRef<Konva.Group>())
      );
	}, [props.participants]);

	useEffect(() => {
		Object.values(props.props)
      ?.sort((a, b) => a.id.localeCompare(b.id))
      ?.forEach(
        (_, index) => (propRef.current[index] = React.createRef<Konva.Group>())
      );
	}, [props.props]);
	
  useEffect(() => {
		props.notePositions
      ?.sort((a, b) => a.id.localeCompare(b.id))
      ?.forEach(
        (_, index) => (noteRef.current[index] = React.createRef<Konva.Group>())
      );
	}, [props.notePositions]);

  useEffect(() => {
		props.arrowPositions
      ?.sort((a, b) => a.id.localeCompare(b.id))
      ?.forEach(
        (_, index) => {
					arrowGroupRef.current[index] = React.createRef<Konva.Group>()
					arrowRef.current[index] = React.createRef<Konva.Arrow>()
				}
      );
	}, [props.arrowPositions]);

	function updateParticipantPosition(id: string, x: number, y: number) {
		var participant = props.partPositions.find((x) => strEquals(x.id, id));
		if (participant) {
			participant.x = x / gridSize - props.sideMargin;
			participant.y = y / gridSize - props.topMargin;
			dbController.upsertItem("participantPosition", participant);
			layerRef.current?.drawScene();
		}
	}

	function updatePropPosition(id: string, x: number, y: number) {
		var prop = props.propPositions.find((x) => strEquals(x.id, id));
		if (prop) {
			prop.x = x / gridSize - props.sideMargin;
			prop.y = y / gridSize - props.topMargin;
			dbController.upsertItem("propPosition", prop);
		}
	}

	function updateNotePosition(id: string, x: number, y: number) {
		var note = props.notePositions.find((x) => strEquals(x.id, id));
		if (note) {
			note.x = x / gridSize - props.sideMargin;
			note.y = y / gridSize - props.topMargin; // todo: fix off by 2m
			dbController.upsertItem("notePosition", note);
		}
	}

	function updateArrowPosition(id: string, x: number, y: number) {
		var arrow = props.arrowPositions.find((x) => strEquals(x.id, id));
		if (arrow) {
			arrow.x = x / gridSize - props.sideMargin;
			arrow.y = y / gridSize - props.topMargin; // todo: fix off by 2m
			dbController.upsertItem("arrowPosition", arrow);
		}
	}

	function updateArrowPoints(id: string, x: number, y: number, pointIndex: number, arrowIndex: number) {
		var arrow = props.arrowPositions.find((x) => strEquals(x.id, id));
		if (arrow) {
			var newPoints = [...arrow.points];
			newPoints[pointIndex] = x / gridSize - props.sideMargin - arrow.x;
			newPoints[pointIndex + 1] = y / gridSize - props.topMargin - arrow.y;
			arrow.points = newPoints;
			if (arrowRef?.current?.[arrowIndex] !== null) {
				arrowRef?.current?.[arrowIndex]?.current?.setAttr("points", newPoints.map(x => x * gridSize));
			}
		}
	}

	function updatePropRotation(id: string, angle: number, x: number, y: number) {
		var prop = props.propPositions.find((x) => strEquals(x.id, id));
		if (prop) {
			prop.angle = angle;
			prop.x = x / gridSize - props.sideMargin;
			prop.y = y / gridSize - props.topMargin;
			dbController.upsertItem("propPosition", prop);
		}
	}

	function saveNoteSize(id: string, scaleX: number, scaleY: number) {
		var note = props.notePositions.find((x) => strEquals(x.id, id));
		if (note) {
			const snapSize = 0.25;
			note.width = Math.round(note.width * scaleX / snapSize) * snapSize;
			note.height = Math.round(note.height * scaleY / snapSize) * snapSize;
			dbController.upsertItem("notePosition", note);
			updateState({selectedItems: [{type: PositionType.note, note: note}]});
		}
	}

	function selectItem(
		item: ParticipantPosition | PropPosition | NotePosition | ArrowPosition | null,
		type: PositionType,
		isMoving?: boolean,
		multiSelect?: boolean,
	) {
		if (item === null || appMode === "view" || (isMoving && selectedIds.has(item.id))) return;
		var singlePropSelected = false; // todo: set on multiselect
		var singleNoteSelected = false; // todo: set on multiselect
		var singleArrowSelected = false;

		if (multiSelect) {
			var newList: Position[] = [];
			if (
				!selectedItems.map((x) => getFromPositionType(x).id).includes(item.id)
			) {
				newList = [...selectedItems, createPosition(item)];
				if (newList.length === 1) {
					if (type === PositionType.arrow) {
						singleArrowSelected = true;
					} else if (type === PositionType.prop) {
						singlePropSelected = true;
					} else if (type === PositionType.note) {
						singleNoteSelected = true;
					}
				}
			} else {
				newList = [
					...selectedItems.filter(
						(x) =>
							x.type !== type || !strEquals(getFromPositionType(x).id, item.id)
					),
				];
				if (newList.length === 1) {
					var split = splitPositionsByType(newList);
					if (split.arrows.length === 1) {
						singleArrowSelected = true;
					} else if (split.props.length === 1) {
						singlePropSelected = true;
					} else if (split.notes.length === 1) {
						singleNoteSelected = true;
					}
				}
			}
			updateState({ selectedItems: newList });
			setSelectedIds(new Set(getAllIds(newList)));
		} else {
			// not already selected
			if (
				selectedItems.length === 0 ||
				!selectedItems.map((x) => getFromPositionType(x).id).includes(item.id)
			) {
				updateState({ selectedItems: [createPosition(item)] });
				setSelectedIds(new Set([item.id]));
				if (type === PositionType.prop) {
					singlePropSelected = true;
				} else if (type === PositionType.arrow) {
					singleArrowSelected = true;
				} else if (type === PositionType.note) {
					singleNoteSelected = true;
				}
			} else if (!isMoving) {
				updateState({ selectedItems: [] });
				setSelectedIds(new Set());
			}
		}

		setIsSinglePropSelected(singlePropSelected);
		setIsSingleNoteSelected(singleNoteSelected);
		setIsSingleArrowSelected(singleArrowSelected);
	}

	return (
		<Layer ref={layerRef}>
			{
				userContext.showNotes &&
				props.arrowPositions?.map((arrow, index) => 
					<ArrowObject
						id={arrow.id}
						key={arrow.id}
						updatePosition={(x, y) => updateArrowPosition(arrow.id, x, y)}
						updatePoints={(x, y, pointIndex) => updateArrowPoints(arrow.id, x, y, pointIndex, index)}
						savePoints={() => {dbController.upsertItem("arrowPosition", arrow)}}
						startX={getPixel(gridSize, arrow.x, props.sideMargin)}
						startY={getPixel(gridSize, arrow.y, props.topMargin)}
						ref={arrowGroupRef.current[index]}
						arrowRef={arrowRef.current[index]}
						points={arrow.points.map((x) => x * gridSize)}
						tension={arrow.tension}
						width={arrow.width * gridSize}
						colour={arrow.color ?? objectPalette.purple.light}
						pointerAtBeginning={arrow.pointerAtBeginning}
						pointerAtEnding={arrow.pointerAtEnding}
						draggable
						selected={selectedIds.has(arrow.id)}
						isOnlyOneSelected={selectedIds.has(arrow.id) && isSingleArrowSelected}
						pointerLength={arrow.pointerLength ?? 2}
						pointerWidth={arrow.pointerWidth ?? 2}
						onClick={(isMoving?: boolean, multiSelect?: boolean) => {
							selectItem(arrow, PositionType.arrow, isMoving,multiSelect);
						}}
						isDotted={arrow.isDotted}
						/>
				)
			}
			{
				userContext.showNotes &&
				props.notePositions?.map((note, index) => (
					<NoteObject
						id={note.id}
						key={note.id}
						colour={note.color ?? objectColorSettings.blueLight}
						startX={getPixel(gridSize, note.x, props.sideMargin)}
						startY={getPixel(gridSize, note.y, props.topMargin)}
						height={note.height}
						length={note.width}
						label={note.label}
						text={note.text}
						borderRadius={note.borderRadius}
						fontSize={gridSize * note.fontGridRatio}
						updatePosition={(x, y) => updateNotePosition(note.id, x, y)}
						onClick={(isMoving?: boolean, multiSelect?: boolean) =>
							selectItem(note, PositionType.note, isMoving, multiSelect)
						}
						alwaysBold={note.alwaysBold}
						draggable={appMode === "edit"}
						ref={noteRef.current[index]}
						selected={selectedIds.has(note.id)}
						hasBorder={true}
					/>
				))}
			{props.propPositions?.map((placement, index) => (
				<PropObject
					id={placement.id}
					key={placement.id}
					name={props.props[placement.propId]?.name ?? ""}
					colour={
						props.props[placement.propId]?.color ??
						objectColorSettings.purpleLight
					}
					length={props.props[placement.propId]?.length ?? 11}
					startX={getPixel(gridSize, placement.x, props.sideMargin)}
					startY={getPixel(gridSize, placement.y, props.topMargin)}
					updatePosition={(x, y) => updatePropPosition(placement.id, x, y)}
					onClick={(isMoving?: boolean, multiSelect?: boolean) =>
						selectItem(placement, PositionType.prop, isMoving, multiSelect)
					}
					draggable={!isAnimating && appMode === "edit"}
					rotation={placement.angle}
					ref={propRef.current[index]}
					selected={selectedIds.has(placement.id)}
				/>
			))}
			{props.partPositions?.map((placement, index) => (
				<ParticipantObject
					id={placement.id}
					key={placement.id}
					name={props.participants[placement.participantId]?.displayName ?? ""}
					colour={
						placement.categoryId
							? props.categories[placement?.categoryId]?.color ??
							  objectColorSettings["amberLight"]
							: objectColorSettings["amberLight"]
					}
					startX={getPixel(gridSize, placement.x, props.sideMargin)}
					startY={getPixel(gridSize, placement.y, props.topMargin)}
					updatePosition={(x, y) =>
						updateParticipantPosition(placement.id, x, y)
					}
					onClick={(isMoving?: boolean, multiSelect?: boolean) => {
						if (appMode === "edit") {
							selectItem(placement, PositionType.participant, isMoving, multiSelect);
						} else {
							updateVisualSettingsContext({
								followingId: strEquals(followingId, placement.participantId) ? null : placement.participantId
							});
						}
					}}
					draggable={!isAnimating}
					ref={participantRef.current[index]}
					selected={appMode === "edit" && selectedIds.has(placement.id)}
					following={strEquals(placement.participantId, followingId)}
				/>
			))}
			<Transformer
				flipEnabled={false}
				keepRatio={false}
				ref={transformerRef}
				resizeEnabled={isSingleNoteSelected}
				enabledAnchors={["bottom-right"]}
				rotateEnabled={isSinglePropSelected}
				borderStrokeWidth={2}
				borderStroke={basePalette.primary.main}
				anchorStrokeWidth={2}
				anchorStroke={basePalette.primary.main}
				rotationSnaps={[
					0, 15, 30, 45, 60, 75, 90, 105, 120, 135, 150, 165, 180, 195, 210,
					225, 240, 255, 270, 285, 300, 315, 330, 345, 360,
				]}
				rotationSnapTolerance={10}
				onTransformEnd={(event) => {
					if(isSinglePropSelected) {
						updatePropRotation(event.target.attrs.id,
							event.target.attrs.rotation,
							event.target.attrs.x,
							event.target.attrs.y);
					} else if (isSingleNoteSelected) {
						const group = event.target as Konva.Group;
						const scaleX = group.scaleX();
						const scaleY = group.scaleY();
						saveNoteSize(event.target.attrs.id, scaleX, scaleY);
						
						group.scale({ x: 1, y: 1 });
						requestAnimationFrame(() => {
							refreshTransformer();
						});
					}
				}}
			/>
			<Rect fill="rgba(0,0,255,0.5)" ref={selectionRectRef} />
		</Layer>
	);
}
