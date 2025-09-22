import React, { ReactNode, useState, createContext } from 'react';

export type AppMode = "view" | "edit";

export interface AppModeContextState {
  appMode: AppMode;
  updateAppModeContext: (newState: Partial<AppModeContextData>) => void;
}

type AppModeContextData = {
  appMode: AppMode;
};

const defaultAppMode: AppMode = 'view';

const defaultAppModeState: AppModeContextState = {
  appMode: defaultAppMode,
  updateAppModeContext: () => {},
};

export const AppModeContext = createContext<AppModeContextState>(defaultAppModeState);

interface Props {
  children: ReactNode;
}

export const AppModeContextProvider: React.FC<Props> = ({ children }) => {
  const [state, setState] = useState<AppModeContextData>({
    appMode: defaultAppMode,
  });

  const updateAppModeContext = (newState: Partial<AppModeContextData>) => {
    setState((prev) => ({ ...prev, ...newState }));
  };

  return (
    <AppModeContext.Provider value={{ ...state, updateAppModeContext }}>
      {children}
    </AppModeContext.Provider>
  );
};