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