import React, { ReactNode, useState, createContext } from 'react';
import { Formation } from '../models/Formation';

export interface FormationContextState {
  selectedFormation?: Formation;
  updateFormationContext: (newState: Partial<FormationContextData>) => void;
}

type FormationContextData = {
  selectedFormation: Formation;
};

const defaultFormationState: FormationContextState = {
  updateFormationContext: () => {},
};

export const FormationContext = createContext<FormationContextState>(defaultFormationState);

interface Props {
  children: ReactNode;
}

export const FormationContextProvider: React.FC<Props> = ({ children }) => {
  const [state, setState] = useState<FormationContextData>({} as FormationContextData);

  const updateFormationContext = (newState: Partial<FormationContextData>) => {
    setState((prev) => ({ ...prev, ...newState }));
  };

  return (
    <FormationContext.Provider value={{ ...state, updateFormationContext }}>
      {children}
    </FormationContext.Provider>
  );
};