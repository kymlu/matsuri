import React, { ReactNode, useState, createContext } from 'react';
import { DEFAULT_GRID_SIZE } from '../lib/consts.ts';

export interface VisualSettingsContextState {
  gridSize: number;
  followingId: string | null;
  updateVisualSettingsContext: (newState: Partial<VisualSettingsContextData>) => void;
}

type VisualSettingsContextData = {
  gridSize: number;
  followingId: string | null;
};

const defaultGridSizeState: VisualSettingsContextState = {
  gridSize: DEFAULT_GRID_SIZE,
  followingId: null,
  updateVisualSettingsContext: () => {},
};

export const VisualSettingsContext = createContext<VisualSettingsContextState>(defaultGridSizeState);

interface Props {
  children: ReactNode;
}

export const VisualSettingsContextProvider: React.FC<Props> = ({ children }) => {
  const [state, setState] = useState<VisualSettingsContextData>({
    gridSize: DEFAULT_GRID_SIZE,
    followingId: null,
  });

  const updateVisualSettingsContext = (newState: Partial<VisualSettingsContextData>) => {
    setState((prev) => ({ ...prev, ...newState }));
  };

  return (
    <VisualSettingsContext.Provider value={{ ...state, updateVisualSettingsContext }}>
      {children}
    </VisualSettingsContext.Provider>
  );
};