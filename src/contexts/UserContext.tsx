import { Festival } from '../models/Festival.ts';
import React from 'react';
import { Formation } from '../models/Formation.ts';
import { NotePosition, ParticipantPosition, PropPosition } from '../models/Position.ts';
import { FormationSongSection } from '../models/FormationSection.ts';

export interface AppState {
  selectedFestival: Festival | null,
  selectedFormation: Formation | null,
  marginPositions: number[][],
  selectedSection: FormationSongSection | null,
  selectedItem: ParticipantPosition | PropPosition | NotePosition | null,
  sections: Array<FormationSongSection>,
  currentSections: Array<FormationSongSection>,
  compareMode: CompareMode,
  isAnimating: boolean,
  updateState: (newState: Partial<AppState>) => void
}

export type CompareMode = "previous" | "none" | "next";

export type AppStateData = Omit<AppState, 'updateState'>;

export const defaultState: AppState = {
  selectedFestival: null,
  selectedFormation: null,
  marginPositions: [],
  selectedItem: null,
  selectedSection: null,
  sections: [],
  currentSections: [],
  compareMode: "none",
  isAnimating: false,
  updateState: (newState: Partial<AppState>) => {},
}

export const UserContext = React.createContext<AppState>(defaultState)