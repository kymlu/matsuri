import React, { ReactNode, useEffect, useState } from 'react'
import { defaultState, SettingsContext, SettingsContextState } from './SettingsContext.tsx';

interface Props {
  children: React.ReactNode
}

/**
 * The main context provider
 */
export const SettingsContextProvider: React.FunctionComponent<Props> = (props: Props): ReactNode => {
  /**
   * Using react hooks, set the default state
   */
  const [state, setState] = useState<SettingsContextState>(defaultState)

  useEffect(() => {
    const storedSettings = localStorage.getItem('siteSettings');
    if (storedSettings) {
      try {
        setState(JSON.parse(storedSettings));
      } catch (e) {
        console.error('Error parsing settings from localStorage:', e);
      }
    }
  }, []);

  /**
   * Declare the update state method that will handle the state values
   */
  const updateSettingsContext = (newState: Partial<SettingsContextState>) => {
    var newSettings = {...state, ...newState};
    setState(newSettings);
    localStorage.setItem('siteSettings', JSON.stringify(newSettings));
  }

  /**
   * Context wrapper that will provider the state values to all its children nodes
   */
  return (
    <SettingsContext.Provider value={{ ...state, updateSettingsContext }}>{props.children}</SettingsContext.Provider>
  )
}