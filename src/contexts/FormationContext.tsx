import React from 'react';
import { Participant } from '../models/Participant.ts';
import { Prop } from '../models/Prop.ts';

export interface FormationContextState {
  participantList: Array<Participant>,
  propList: Array<Prop>,
  updateFormationContext: (newState: Partial<FormationContextState>) => void
}

export type FormationContextData = Omit<FormationContextState, 'updateFormationContext'>;

export const defaultFormationContext: FormationContextState = {
  participantList: Array<Participant>(),
  propList: Array<Prop>(),
  updateFormationContext: (newState: Partial<FormationContextState>) => {},
}

export const FormationContext = React.createContext<FormationContextState>(defaultFormationContext)