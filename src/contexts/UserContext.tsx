import { Festival } from '../models/Festival.ts';
import React from 'react';
import { Position } from '../models/Position.ts';
import { FormationSection } from '../models/FormationSection.ts';

export interface AppState {
  selectedFestival: Festival | null,
  previousSectionId: string | null,
  selectedSection: FormationSection | null,
  selectedItems: Array<Position>,
  currentSections: Array<FormationSection>,
  compareMode: CompareMode,
  isLoading: boolean,
  showNotes: boolean,
  showLegend: boolean,
  updateState: (newState: Partial<AppState>) => void
}

export type CompareMode = "previous" | "none" | "next";

export type AppStateData = Omit<AppState, 'updateState'>;

export const defaultState: AppState = {
  selectedFestival: null,
  selectedItems: [],
  previousSectionId: null,
  selectedSection: null,
  currentSections: [],
  compareMode: "none",
  isLoading: false,
  showNotes: true,
  showLegend: false,
  updateState: (newState: Partial<AppState>) => {},
}

export const UserContext = React.createContext<AppState>(defaultState)