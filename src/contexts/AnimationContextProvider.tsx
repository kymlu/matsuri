import React, { ReactNode, useState } from 'react'
import { AnimationContext, AnimationContextData, AnimationContextState, defaultAnimationContext } from './AnimationContext.tsx'

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
    localStorage.setItem("animationManager", JSON.stringify({ ...state, ...newState }))
  }

  /**
   * Context wrapper that will provider the state values to all its children nodes
   */
  return (
    <AnimationContext.Provider value={{ ...state, updateAnimationContext }}>{props.children}</AnimationContext.Provider>
  )
}