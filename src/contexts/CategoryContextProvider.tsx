import React, { ReactNode, useState } from 'react'
import { CategoryContext, CategoryContextData, CategoryContextState, defaultCategoryContext } from './CategoryContext.tsx'

interface Props {
  children: React.ReactNode
}

/**
 * The main context provider
 */
export const CategoryContextProvider: React.FunctionComponent<Props> = (props: Props): ReactNode => {
  /**
   * Using react hooks, set the default state
   */
  const [state, setState] = useState<CategoryContextData>(defaultCategoryContext)

  /**
   * Declare the update state method that will handle the state values
   */
  const updateCategoryContext = (newState: Partial<CategoryContextState>) => {
    setState(prev => ({ ...prev, ...newState }))
    localStorage.setItem("formationManager", JSON.stringify({ ...state, ...newState }))
  }

  /**
   * Context wrapper that will provider the state values to all its children nodes
   */
  return (
    <CategoryContext.Provider value={{ ...state, updateCategoryContext }}>{props.children}</CategoryContext.Provider>
  )
}