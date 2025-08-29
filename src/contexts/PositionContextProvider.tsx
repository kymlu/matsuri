import React, { ReactNode, useState } from 'react'
import { defaultState, PositionState, PositionContext, PositionStateData } from './PositionContext.tsx'

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
  const [state, setState] = useState<PositionStateData>(defaultState)

  /**
   * Declare the update state method that will handle the state values
   */
  const updatePositionState = (newState: Partial<PositionState>) => {
    setState(prev => ({ ...prev, ...newState }))
    localStorage.setItem("formationManager", JSON.stringify({ ...state, ...newState }))
  }

  /**
   * Context wrapper that will provider the state values to all its children nodes
   */
  return (
    <PositionContext.Provider value={{ ...state, updatePositionState }}>{props.children}</PositionContext.Provider>
  )
}