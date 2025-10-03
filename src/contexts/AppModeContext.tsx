import React, { ReactNode, useState, createContext } from 'react';

export type AppMode = "view" | "edit";
export type UserType = "general" | "admin";

export interface AppModeContextState {
  appMode: AppMode;
  userType: UserType;
  updateAppModeContext: (newState: Partial<AppModeContextData>) => void;
}

type AppModeContextData = {
  appMode: AppMode;
  userType: UserType;
};

const defaultAppMode: AppMode = 'view';
const defaultUserType: UserType = 'general';

const defaultAppModeState: AppModeContextState = {
  appMode: defaultAppMode,
  userType: defaultUserType,
  updateAppModeContext: () => {},
};

export const AppModeContext = createContext<AppModeContextState>(defaultAppModeState);

interface Props {
  children: ReactNode;
}

export const AppModeContextProvider: React.FC<Props> = ({ children }) => {
  const [state, setState] = useState<AppModeContextData>({
    appMode: defaultAppMode,
    userType: defaultUserType,
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