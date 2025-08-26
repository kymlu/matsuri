import React, { ReactNode, useEffect, useState } from 'react'
import { defaultState, FormationState, FormationStateContext, FormationStateData } from './FormationEditorContext.tsx'

interface Props {
  children: React.ReactNode
}

/**
 * The main context provider
 */
export const FormationEditorContextProvider: React.FunctionComponent<Props> = (props: Props): ReactNode => {
  /**
   * Using react hooks, set the default state
   */
  const [state, setState] = useState<FormationStateData>(defaultState)

  useEffect(() => {
    const storedUser = localStorage.getItem('formationManager');
    if (storedUser) {
      try {
        setState(JSON.parse(storedUser));
      } catch (e) {
        console.error('Error parsing user from localStorage:', e);
      }
    }
  }, []);

  /**
   * Declare the update state method that will handle the state values
   */
  const updateFormationState = (newState: Partial<FormationState>) => {
    setState(prev => ({ ...prev, ...newState }))
    localStorage.setItem("formationManager", JSON.stringify({ ...state, ...newState }))
  }

  /**
   * Context wrapper that will provider the state values to all its children nodes
   */
  return (
    <FormationStateContext.Provider value={{ ...state, updateFormationState }}>{props.children}</FormationStateContext.Provider>
  )
}