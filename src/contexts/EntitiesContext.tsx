import React from 'react';
import { Participant } from '../models/Participant.ts';
import { Prop } from '../models/Prop.ts';

export interface EntitiesContextState {
  participantList: Record<string, Participant>,
  propList: Record<string, Prop>,
  updateEntitiesContext: (newState: Partial<EntitiesContextState>) => void
}

export type EntitiesContextData = Omit<EntitiesContextState, 'updateEntitiesContext'>;

export const defaultEntitiesContext: EntitiesContextState = {
  participantList: {},
  propList: {},
  updateEntitiesContext: (newState: Partial<EntitiesContextState>) => {},
}

export const EntitiesContext = React.createContext<EntitiesContextState>(defaultEntitiesContext)