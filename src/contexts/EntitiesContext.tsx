import React, { useState } from 'react';
import { Participant, ParticipantPlaceholder } from '../models/Participant.ts';
import { Prop } from '../models/Prop.ts';
import { ReactNode } from 'react';

export interface EntitiesContextState {
  participantList: Record<string, Participant>,
  propList: Record<string, Prop>,
  placeholderList: Record<string, ParticipantPlaceholder>,
  updateEntitiesContext: (newState: Partial<EntitiesContextState>) => void
}

export type EntitiesContextData = Omit<EntitiesContextState, 'updateEntitiesContext'>;

export const defaultEntitiesContext: EntitiesContextState = {
  participantList: {},
  propList: {},
  placeholderList: {},
  updateEntitiesContext: (newState: Partial<EntitiesContextState>) => {},
}

export const EntitiesContext = React.createContext<EntitiesContextState>(defaultEntitiesContext);

interface Props {
  children: React.ReactNode
}

/**
 * The main context provider
 */
export const EntitiesContextProvider: React.FunctionComponent<Props> = (props: Props): ReactNode => {
  /**
   * Using react hooks, set the default state
   */
  const [state, setState] = useState<EntitiesContextData>(defaultEntitiesContext)

  /**
   * Declare the update state method that will handle the state values
   */
  const updateEntitiesContext = (newState: Partial<EntitiesContextState>) => {
    setState(prev => ({ ...prev, ...newState }))
  }

  /**
   * Context wrapper that will provider the state values to all its children nodes
   */
  return (
    <EntitiesContext.Provider value={{ ...state, updateEntitiesContext }}>{props.children}</EntitiesContext.Provider>
  )
}