import React from 'react';

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

export const AnimationContext = React.createContext<AnimationContextState>(defaultAnimationContext)