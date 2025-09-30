import { ColorStyle } from "../themes/colours.ts"

export interface BasePosition {
  id: string,
  formationSectionId: string,
  x: number,
  y: number,
  isSelected: boolean // todo: remove?
}

export interface ParticipantPosition extends BasePosition {
  participantId: string,
  categoryId?: string,
}

export interface PropPosition extends BasePosition {
  propId: string,
  angle: number
}

export interface NotePosition extends BasePosition {
  label: string,
  text: string,
  color?: ColorStyle,
  width: number,
  height: number,
  borderRadius: number,
  fontGridRatio: number,
  alwaysBold?: boolean,
  showBackground?: boolean,
}

export interface ArrowPosition extends BasePosition {
  points: number[]
  tension: number,
  pointerAtBeginning: boolean,
  pointerAtEnding: boolean,
  width: number,
  pointerWidth: number,
  pointerLength: number,
  color?: ColorStyle,
  isDotted?: boolean,
}

export enum PositionType {
  "participant" = "参加者",
  "prop" = "道具",
  "note" = "メモ",
  "arrow" = "矢印",
}

export type Position =
| { type: PositionType.participant; participant: ParticipantPosition }
| { type: PositionType.prop; prop: PropPosition }
| { type: PositionType.note; note: NotePosition }
| { type: PositionType.arrow; arrow: ArrowPosition };

export function getFromPositionType(position: Position): ParticipantPosition | PropPosition | NotePosition | ArrowPosition {
  switch (position.type) {
    case PositionType.participant:
      return position.participant;
    case PositionType.prop:
      return position.prop;
    case PositionType.note:
      return position.note;
    case PositionType.arrow:
      return position.arrow;
  }
}

export function isParticipantPosition(item: any): item is ParticipantPosition {
  return 'participantId' in item;
}

export function isPropPosition(item: any): item is PropPosition {
  return 'propId' in item;
}

export function isNotePosition(item: any): item is NotePosition {
  return 'label' in item;
}

export function isArrowPosition(item: any): item is ArrowPosition {
  return 'pointerAtBeginning' in item;
}

// Overloads for strong typing
export function createPosition(item: ParticipantPosition): Position & { type: PositionType.participant };
export function createPosition(item: PropPosition): Position & { type: PositionType.prop };
export function createPosition(item: NotePosition): Position & { type: PositionType.note };
export function createPosition(item: ArrowPosition): Position & { type: PositionType.arrow };
export function createPosition(item: ParticipantPosition | PropPosition | NotePosition | ArrowPosition, type: PositionType): Position;
export function createPosition(item: ParticipantPosition | PropPosition | NotePosition | ArrowPosition): Position;

// Implementation
export function createPosition(
  item: ParticipantPosition | PropPosition | NotePosition | ArrowPosition,
  type?: PositionType
): Position {
  // Infer type if missing
  if (type === undefined) {
    if (isParticipantPosition(item)) {
      type = PositionType.participant;
    } else if (isPropPosition(item)) {
      type = PositionType.prop;
    } else if (isNotePosition(item)) {
      type = PositionType.note;
    } else if (isArrowPosition(item)) {
      type = PositionType.arrow;
    } else {
      throw new Error("Unable to infer position type from item");
    }
  }

  // Create position object based on type
  switch (type) {
    case PositionType.participant:
      return { type, participant: item as ParticipantPosition };
    case PositionType.prop:
      return { type, prop: item as PropPosition };
    case PositionType.note:
      return { type, note: item as NotePosition };
    case PositionType.arrow:
      return { type, arrow: item as ArrowPosition };
    default:
      throw new Error("Unknown position type");
  }
}

export function splitPositionsByType(positions: Position[]) {
  const participants: ParticipantPosition[] = [];
  const props: PropPosition[] = [];
  const notes: NotePosition[] = [];
  const arrows: ArrowPosition[] = [];

  for (const pos of positions) {
    switch (pos.type) {
      case PositionType.participant:
        participants.push(pos.participant);
        break;
      case PositionType.prop:
        props.push(pos.prop);
        break;
      case PositionType.note:
        notes.push(pos.note);
        break;
      case PositionType.arrow:
        arrows.push(pos.arrow);
        break;
    }
  }

  return {
    participants,
    props,
    notes,
    arrows,
  };
}

export function getAllIds(positions: Position[]): string[] {
  var ids: string[] = [];
  for (const pos of positions) {
    switch (pos.type) {
      case PositionType.participant:
        ids.push(pos.participant.id);
        break;
      case PositionType.prop:
        ids.push(pos.prop.id);
        break;
      case PositionType.note:
        ids.push(pos.note.id);
        break;
      case PositionType.arrow:
        ids.push(pos.arrow.id);
        break;
    }
  }
  return ids;
}