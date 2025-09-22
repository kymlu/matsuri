import React from 'react';
import { FormationSection } from '../models/FormationSection';
import { ReactNode } from 'react';
import { useState } from 'react';

export interface SectionContextState {
  sections: Array<FormationSection>,
  updateSectionContext: (newState: Partial<SectionContextState>) => void
}

export type SectionContextData = Omit<SectionContextState, 'updateSectionContext'>;

export const defaultSectionContext: SectionContextState = {
  sections: Array<FormationSection>(),
  updateSectionContext: (newState: Partial<SectionContextState>) => {},
}

export const SectionContext = React.createContext<SectionContextState>(defaultSectionContext);


interface Props {
  children: React.ReactNode
}

/**
 * The main context provider
 */
export const SectionContextProvider: React.FunctionComponent<Props> = (props: Props): ReactNode => {
  /**
   * Using react hooks, set the default state
   */
  const [state, setState] = useState<SectionContextData>(defaultSectionContext)

  /**
   * Declare the update state method that will handle the state values
   */
  const updateSectionContext = (newState: Partial<SectionContextState>) => {
    setState(prev => ({ ...prev, ...newState }))
  }

  /**
   * Context wrapper that will provider the state values to all its children nodes
   */
  return (
    <SectionContext.Provider value={{ ...state, updateSectionContext }}>{props.children}</SectionContext.Provider>
  )
}