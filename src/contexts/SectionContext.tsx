import React from 'react';
import { FormationSection } from '../models/FormationSection';

export interface SectionContextState {
  sections: Array<FormationSection>,
  updateSectionContext: (newState: Partial<SectionContextState>) => void
}

export type SectionContextData = Omit<SectionContextState, 'updateSectionContext'>;

export const defaultSectionContext: SectionContextState = {
  sections: Array<FormationSection>(),
  updateSectionContext: (newState: Partial<SectionContextState>) => {},
}

export const SectionContext = React.createContext<SectionContextState>(defaultSectionContext)