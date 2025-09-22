import React, { ReactNode, useState, createContext } from 'react';
import { DEFAULT_GRID_SIZE } from '../data/consts.ts';

export interface GridSizeContextState {
  gridSize: number;
  updateGridSizeContext: (newState: Partial<GridSizeContextData>) => void;
}

type GridSizeContextData = {
  gridSize: number;
};

const defaultGridSizeState: GridSizeContextState = {
  gridSize: DEFAULT_GRID_SIZE,
  updateGridSizeContext: () => {},
};

export const GridSizeContext = createContext<GridSizeContextState>(defaultGridSizeState);

interface Props {
  children: ReactNode;
}

export const GridSizeContextProvider: React.FC<Props> = ({ children }) => {
  const [state, setState] = useState<GridSizeContextData>({
    gridSize: DEFAULT_GRID_SIZE,
  });

  const updateGridSizeContext = (newState: Partial<GridSizeContextData>) => {
    setState((prev) => ({ ...prev, ...newState }));
  };

  return (
    <GridSizeContext.Provider value={{ ...state, updateGridSizeContext }}>
      {children}
    </GridSizeContext.Provider>
  );
};