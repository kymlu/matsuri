import React from 'react';
import { ParticipantPosition, PropPosition } from '../models/Position.ts';

export interface FormationState {
  participantPositions: Array<ParticipantPosition>,
  propPositions: Array<PropPosition>,
  updateFormationState: (newState: Partial<FormationState>) => void
}

export type FormationStateData = Omit<FormationState, 'updateState'>;

export const defaultState: FormationState = {
  participantPositions: Array<ParticipantPosition>(),
  propPositions: Array<PropPosition>(),
  updateFormationState: (newState: Partial<FormationState>) => {},
}

export const FormationStateContext = React.createContext<FormationState>(defaultState)