import React from 'react';
import { useState } from 'react';
import { ReactNode } from 'react';

export interface AnimationContextState {
  paths: Record<string, string>,
  isAnimating: boolean,
  updateAnimationContext: (newState: Partial<AnimationContextState>) => void
}

export type AnimationContextData = Omit<AnimationContextState, 'updateAnimationContext'>;

export const defaultAnimationContext: AnimationContextState = {
  paths: {},
  isAnimating: false,
  updateAnimationContext: (newState: Partial<AnimationContextState>) => {},
}

export const AnimationContext = React.createContext<AnimationContextState>(defaultAnimationContext);


interface Props {
  children: React.ReactNode
}

/**
 * The main context provider
 */
export const AnimationContextProvider: React.FunctionComponent<Props> = (props: Props): ReactNode => {
  /**
   * Using react hooks, set the default state
   */
  const [state, setState] = useState<AnimationContextData>(defaultAnimationContext)

  /**
   * Declare the update state method that will handle the state values
   */
  const updateAnimationContext = (newState: Partial<AnimationContextState>) => {
    setState(prev => ({ ...prev, ...newState }))
  }

  /**
   * Context wrapper that will provider the state values to all its children nodes
   */
  return (
    <AnimationContext.Provider value={{ ...state, updateAnimationContext }}>{props.children}</AnimationContext.Provider>
  )
}