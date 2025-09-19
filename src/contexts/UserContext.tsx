import { Festival } from '../models/Festival.ts';
import React from 'react';
import { Formation } from '../models/Formation.ts';
import { Position } from '../models/Position.ts';
import { FormationSection } from '../models/FormationSection.ts';
import { GRID_SIZE } from '../data/consts.ts';
import { AppMode } from '../pages/FestivalManager.tsx';

export interface AppState {
  selectedFestival: Festival | null,
  selectedFormation: Formation | null,
  marginPositions: { 
    participants: number[][],
    props: number[][],
    notes: number[][]
  },
  gridSize: number,
  previousSectionId: string | null,
  selectedSection: FormationSection | null,
  selectedItems: Array<Position>,
  currentSections: Array<FormationSection>,
  compareMode: CompareMode,
  isLoading: boolean,
  mode?: AppMode,
  showNotes: boolean,
  showLegend: boolean,
  updateState: (newState: Partial<AppState>) => void
}

export type CompareMode = "previous" | "none" | "next";

export type AppStateData = Omit<AppState, 'updateState'>;

export const defaultState: AppState = {
  selectedFestival: null,
  selectedFormation: null,
  marginPositions: {participants: [], props: [], notes: []},
  gridSize: GRID_SIZE,
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