import React, { ReactNode, useState } from 'react'
import { EntitiesContext, EntitiesContextData, EntitiesContextState, defaultEntitiesContext } from './EntitiesContext.tsx'

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