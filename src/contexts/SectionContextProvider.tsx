import React, { ReactNode, useState } from 'react'
import { SectionContext, SectionContextData, SectionContextState, defaultSectionContext } from './SectionContext.tsx'

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