import React, { ReactNode, useEffect, useState } from 'react'
import { AppState, AppStateData, defaultState, UserContext } from './UserContext.tsx'
import { CONTEXT_NAMES } from '../data/consts.ts'

interface Props {
  children: React.ReactNode
}

/**
 * The main context provider
 */
export const UserContextProvider: React.FunctionComponent<Props> = (props: Props): ReactNode => {
  /**
   * Using react hooks, set the default state
   */
  const [state, setState] = useState<AppStateData>(defaultState)

  useEffect(() => {
    const storedUser = localStorage.getItem('userManager');
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
  const updateState = (newState: Partial<AppState>) => {
    setState(prev => ({ ...prev, ...newState }))
    localStorage.setItem(CONTEXT_NAMES.user, JSON.stringify({ ...state, ...newState }))
  }

  /**
   * Context wrapper that will provider the state values to all its children nodes
   */
  return (
    <UserContext.Provider value={{ ...state, updateState }}>{props.children}</UserContext.Provider>
  )
}