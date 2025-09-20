import React from 'react';
import { NotePosition, ParticipantPosition, PropPosition } from '../models/Position.ts';

export interface PositionState {
  participantPositions: Array<ParticipantPosition>,
  propPositions: Array<PropPosition>,
  notePositions: Array<NotePosition>,
  updatePositionState: (newState: Partial<PositionState>) => void
}

export type PositionStateData = Omit<PositionState, 'updatePositionState'>;

export const defaultState: PositionState = {
  participantPositions: Array<ParticipantPosition>(),
  propPositions: Array<PropPosition>(),
  notePositions: Array<NotePosition>(),
  updatePositionState: (newState: Partial<PositionState>) => {},
}

export const PositionContext = React.createContext<PositionState>(defaultState)

export function GroupBySectionId<T extends { formationSectionId: string }>(
  items: T[]
): Record<string, T[]> {
  return items.reduce((acc, item) => {
    const formationSectionId = item.formationSectionId;
    if (!acc[formationSectionId]) {
      acc[formationSectionId] = [];
    }
    acc[formationSectionId].push(item);
    return acc;
  }, {} as Record<string, T[]>);
}
