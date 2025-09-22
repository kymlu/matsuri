import React from 'react';
import { ParticipantCategory } from '../models/ParticipantCategory.ts';
import { useState } from 'react';
import { ReactNode } from 'react';

export interface CategoryContextState {
  categories: Record<string, ParticipantCategory>,
  updateCategoryContext: (newState: Partial<CategoryContextState>) => void
}

export type CategoryContextData = Omit<CategoryContextState, 'updateCategoryContext'>;

export const defaultCategoryContext: CategoryContextState = {
  categories: {},
  updateCategoryContext: (newState: Partial<CategoryContextState>) => {},
}

export const CategoryContext = React.createContext<CategoryContextState>(defaultCategoryContext);


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
  }

  /**
   * Context wrapper that will provider the state values to all its children nodes
   */
  return (
    <CategoryContext.Provider value={{ ...state, updateCategoryContext }}>{props.children}</CategoryContext.Provider>
  )
}