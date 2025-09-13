import React, { ReactNode, useState } from 'react'
import { FormationContext, FormationContextData, FormationContextState, defaultFormationContext } from './FormationContext.tsx'

interface Props {
  children: React.ReactNode
}

/**
 * The main context provider
 */
export const FormationContextProvider: React.FunctionComponent<Props> = (props: Props): ReactNode => {
  /**
   * Using react hooks, set the default state
   */
  const [state, setState] = useState<FormationContextData>(defaultFormationContext)

  /**
   * Declare the update state method that will handle the state values
   */
  const updateFormationContext = (newState: Partial<FormationContextState>) => {
    setState(prev => ({ ...prev, ...newState }))
  }

  /**
   * Context wrapper that will provider the state values to all its children nodes
   */
  return (
    <FormationContext.Provider value={{ ...state, updateFormationContext }}>{props.children}</FormationContext.Provider>
  )
}