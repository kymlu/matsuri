import React, { ReactNode } from 'react';
import { ArrowPosition, NotePosition, ParticipantPosition, PlaceholderPosition, PropPosition } from '../models/Position.ts';
import { useState } from 'react';

export interface PositionContextState {
  participantPositions: Record<string, ParticipantPosition[]>,
  propPositions: Record<string, PropPosition[]>,
  notePositions: Record<string, NotePosition[]>,
  arrowPositions: Record<string, ArrowPosition[]>,
  placeholderPositions: Record<string, PlaceholderPosition[]>,
  updatePositionContextState: (newState: Partial<PositionContextState>) => void
}

export type PositionContextStateData = Omit<PositionContextState, 'updatePositionContextState'>;

const defaultState: PositionContextState = {
  participantPositions: {},
  propPositions: {},
  notePositions: {},
  arrowPositions: {},
  placeholderPositions: {},
  updatePositionContextState: (newState: Partial<PositionContextState>) => {},
}

export const PositionContext = React.createContext<PositionContextState>(defaultState);

interface Props {
  children: React.ReactNode
}

/**
 * The main context provider
 */
export const PositionContextProvider: React.FunctionComponent<Props> = (props: Props): ReactNode => {
  /**
   * Using react hooks, set the default state
   */
  const [state, setState] = useState<PositionContextStateData>(defaultState)

  /**
   * Declare the update state method that will handle the state values
   */
  const updatePositionContextState = (newState: Partial<PositionContextState>) => {
    setState(prev => ({ ...prev, ...newState }))
  }

  /**
   * Context wrapper that will provider the state values to all its children nodes
   */
  return (
    <PositionContext.Provider value={{ ...state, updatePositionContextState }}>{props.children}</PositionContext.Provider>
  )
}