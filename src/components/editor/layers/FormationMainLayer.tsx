import React, {
	useContext,
	useEffect,
	useImperativeHandle,
	useRef,
	useState,
} from "react";
import { Layer, Rect, Transformer } from "react-konva";
import {
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
import { objectColorSettings, basePalette } from "../../../themes/colours.ts";
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
import { GridSizeContext } from "../../../contexts/GridSizeContext.tsx";

export type FormationMainLayerProps = {
	topMargin: number;
	bottomMargin: number;
	sideMargin: number;
	ref: React.Ref<any>;
	categories: Record<string, ParticipantCategory>;
	participants: Record<string, Participant>;
	props: Record<string, Prop>;
	partPositions: ParticipantPosition[];
	updatePartPositions?: (updatedRecord: ParticipantPosition[]) => void;
	propPositions: PropPosition[];
	updatePropPositions?: (updatedRecord: PropPosition[]) => void;
	notePositions: NotePosition[];
	updateNotePositions?: (updatedRecord: NotePosition[]) => void;
	gridSize: number;
};

export function FormationMainLayer(props: FormationMainLayerProps) {
  const {gridSize} = useContext(GridSizeContext);
	const userContext = useContext(UserContext);
	const { isAnimating } = useContext(AnimationContext);
	const { appMode } = useContext(AppModeContext);
	const { selectedItems, updateState } =
		useContext(UserContext);
	const positionContext = useContext(PositionContext);
	const layerRef = useRef<Konva.Layer>(null);
	const transformerRef = useRef<Konva.Transformer>(null);
	const participantRef = useRef<React.RefObject<Konva.Group | null>[]>([]);
	const propRef = useRef<React.RefObject<Konva.Group | null>[]>([]);
	const noteRef = useRef<React.RefObject<Konva.Group | null>[]>([]);
	const [selectedIds, setSelectedIds] = useState<string[]>([]);

	const positionContextRef = useRef(positionContext);

	// Keep ref up to date
	useEffect(() => {
		positionContextRef.current = positionContext;
	}, [positionContext]);

	useImperativeHandle(props.ref, () => ({
		clearSelections: () => {
			updateState({ selectedItems: [] });
			setSelectedIds([]);
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

		onMouseUp: () => {
			oldPos.current = null;
			selection.current.visible = false;
			const { x1, x2, y1, y2 } = selection.current;
			const moved = x1 !== x2 || y1 !== y2;
			if (!moved) {
				updateSelectionRect();
				return;
			}
			if (selectionRectRef.current) {
				const selBox = selectionRectRef.current?.getClientRect();

				const selectedParticipantIds: Array<string> = [];
				participantRef.current?.forEach((elementNode) => {
					if (elementNode.current) {
						var node = elementNode as React.RefObject<Group>;
						const elBox = node.current.getClientRect();
						if (Konva.Util.haveIntersection(selBox, elBox)) {
							selectedParticipantIds.push(node.current.attrs.id);
						}
					}
				});

				const selectedPropIds: Array<string> = [];
				if (appMode === "edit") {
					propRef.current?.forEach((elementNode) => {
						if (elementNode.current) {
							var node = elementNode as React.RefObject<Group>;
							const elBox = node.current.getClientRect();
							if (Konva.Util.haveIntersection(selBox, elBox)) {
								selectedPropIds.push(node.current.attrs.id);
							}
						}
					});
				}

				const selectedNoteIds: Array<string> = [];
				if (appMode === "edit") {
					noteRef.current?.forEach((elementNode) => {
						if (elementNode.current) {
							var node = elementNode as React.RefObject<Group>;
							const elBox = node.current.getClientRect();
							if (Konva.Util.haveIntersection(selBox, elBox)) {
								selectedNoteIds.push(node.current.attrs.id);
							}
						}
					});
				}

				updateState({
					selectedItems: [
						...props.partPositions
							?.filter((x) => selectedParticipantIds.includes(x.id))
							.map(
								(x) =>
									({
										type: PositionType.participant,
										participant: x,
									} as Position)
							) ?? [],
						...props.propPositions
							?.filter((x) => selectedPropIds.includes(x.id))
							?.map((x) => ({ type: PositionType.prop, prop: x } as Position)) ?? [],
						...props.notePositions
							?.filter((x) => selectedNoteIds.includes(x.id))
							?.map((x) => ({ type: PositionType.note, note: x } as Position)) ?? [],
					],
				});

				setSelectedIds([
					...selectedParticipantIds,
					...selectedPropIds,
					...selectedNoteIds,
				]);

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
				setSelectedIds(participants.map((x) => x.id));
				break;

			case PositionType.prop:
				var props = positionContextRef.current.propPositions[userContext.selectedSection!.id];
				updateState({
					selectedItems: props.map(
						(x) => ({ type: PositionType.prop, prop: x } as Position)
					),
				});
				setSelectedIds(props.map((x) => x.id));
				break;

			case PositionType.note:
				var notes = positionContextRef.current.notePositions[userContext.selectedSection!.id];
				updateState({
					selectedItems: notes.map(
						(x) => ({ type: PositionType.note, note: x } as Position)
					),
				});
				setSelectedIds(notes.map((x) => x.id));
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
		setSelectedIds(newSelection.map((x) => x.id));
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
			selectedIds.length > 0
		) {
			const nodes = selectedIds
				.map((id) => layerRef!.current!.findOne("#" + id))
				.filter((x) => x !== undefined);
			transformerRef?.current!.nodes(nodes);
		} else {
			transformerRef?.current!.nodes([]);
		}
	}, [selectedIds]);

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

	function updatePropRotation(id: string, angle: number, x: number, y: number) {
		var prop = props.propPositions.find((x) => strEquals(x.id, id));
		if (prop) {
			prop.angle = angle;
			prop.x = x / gridSize; //(x * gridSize + x)/gridSize;
			prop.y = y / gridSize; //(y * gridSize + y)/gridSize;
			dbController.upsertItem("propPosition", prop);
		}
	}

	function selectItem(
		item: ParticipantPosition | PropPosition | NotePosition | null,
		type: PositionType,
		forceSelect?: boolean,
		multiSelect?: boolean
	) {
		if (item === null) return;

		if (multiSelect && appMode === "edit") {
			var newList: Position[] = [];
			if (
				!selectedItems.map((x) => getFromPositionType(x).id).includes(item.id)
			) {
				newList = [...selectedItems, createPosition(item)];
				updateState({ selectedItems: newList });
			} else {
				newList = [
					...selectedItems.filter(
						(x) =>
							x.type !== type || !strEquals(getFromPositionType(x).id, item.id)
					),
				];
				updateState({ selectedItems: newList });
			}
			setSelectedIds(getAllIds(newList));
		} else {
			// not already selected
			if (
				selectedItems.length === 0 ||
				!selectedItems.map((x) => getFromPositionType(x).id).includes(item.id)
			) {
				updateState({ selectedItems: [createPosition(item)] });
				setSelectedIds([item.id]);
			} else if (!forceSelect) {
				updateState({ selectedItems: [] });
				setSelectedIds([]);
			}
		}
	}

	return (
		<Layer ref={layerRef}>
			{userContext.showNotes &&
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
						onClick={(forceSelect?: boolean, multiSelect?: boolean) =>
							selectItem(note, PositionType.note, forceSelect, multiSelect)
						}
						alwaysBold={note.alwaysBold}
						showBackground={note.showBackground}
						draggable={appMode === "edit"}
						ref={noteRef.current[index]}
						selected={selectedIds.includes(note.id)}
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
					onClick={(forceSelect?: boolean, multiSelect?: boolean) =>
						selectItem(placement, PositionType.prop, forceSelect, multiSelect)
					}
					draggable={!isAnimating && appMode === "edit"}
					rotation={placement.angle}
					onRotate={(angle, x, y) =>
						updatePropRotation(placement.id, angle, x, y)
					}
					ref={propRef.current[index]}
					selected={selectedIds.includes(placement.id)}
				/>
			))}
			{props.partPositions?.map((placement, index) => (
				<ParticipantObject
					id={placement.id}
					key={placement.id}
					name={props.participants[placement.participantId]?.displayName ?? ""}
					colour={
						placement.categoryId
							? props.categories[placement.categoryId].color ??
							  objectColorSettings["amberLight"]
							: objectColorSettings["amberLight"]
					}
					startX={getPixel(gridSize, placement.x, props.sideMargin)}
					startY={getPixel(gridSize, placement.y, props.topMargin)}
					updatePosition={(x, y) =>
						updateParticipantPosition(placement.id, x, y)
					}
					onClick={(forceSelect?: boolean, multiSelect?: boolean) => {
						selectItem(
							placement,
							PositionType.participant,
							forceSelect,
							multiSelect
						);
					}}
					draggable={!isAnimating}
					ref={participantRef.current[index]}
					selected={selectedIds.includes(placement.id)}
				/>
			))}
			<Transformer
				flipEnabled={false}
				ref={transformerRef}
				resizeEnabled={false}
				rotateEnabled={false} // todo implement in single select prop etc.
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
					console.log("rotation is broken");
					console.log(event.target);
					//props.onTransform?.(event.target);
				}}
			/>
			<Rect fill="rgba(0,0,255,0.5)" ref={selectionRectRef} />
		</Layer>
	);
}
