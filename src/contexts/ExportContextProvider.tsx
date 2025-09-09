import React, { ReactNode, useState } from 'react'
import { ExportContext, ExportContextData, ExportContextState, defaultExportContext } from './ExportContext.tsx'

interface Props {
  children: React.ReactNode
}

/**
 * The main context provider
 */
export const ExportContextProvider: React.FunctionComponent<Props> = (props: Props): ReactNode => {
  /**
   * Using react hooks, set the default state
   */
  const [state, setState] = useState<ExportContextData>(defaultExportContext)

  /**
   * Declare the update state method that will handle the state values
   */
  const updateExportContext = (newState: Partial<ExportContextState>) => {
    setState(prev => ({ ...prev, ...newState }))
  }

  /**
   * Context wrapper that will provider the state values to all its children nodes
   */
  return (
    <ExportContext.Provider value={{ ...state, updateExportContext }}>{props.children}</ExportContext.Provider>
  )
}