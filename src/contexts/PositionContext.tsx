import React from 'react';
import { ParticipantPosition, PropPosition } from '../models/Position.ts';

export interface PositionState {
  participantPositions: Array<ParticipantPosition>,
  propPositions: Array<PropPosition>,
  updatePositionState: (newState: Partial<PositionState>) => void
}

export type PositionStateData = Omit<PositionState, 'updatePositionState'>;

export const defaultState: PositionState = {
  participantPositions: Array<ParticipantPosition>(),
  propPositions: Array<PropPosition>(),
  updatePositionState: (newState: Partial<PositionState>) => {},
}

export const PositionContext = React.createContext<PositionState>(defaultState)