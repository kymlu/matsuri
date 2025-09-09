import { Festival } from '../models/Festival.ts';
import React from 'react';
import { Formation } from '../models/Formation.ts';
import { NotePosition, ParticipantPosition, PropPosition } from '../models/Position.ts';
import { FormationSongSection } from '../models/FormationSection.ts';
import { GRID_SIZE } from '../data/consts.ts';

export interface AppState {
  selectedFestival: Festival | null,
  selectedFormation: Formation | null,
  marginPositions: { 
    participants: number[][],
    props: number[][],
    notes: number[][]
  },
  gridSize: number,
  selectedSection: FormationSongSection | null,
  selectedItem: ParticipantPosition | PropPosition | NotePosition | null,
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
  marginPositions: {participants: [], props: [], notes: []},
  gridSize: GRID_SIZE,
  selectedItem: null,
  selectedSection: null,
  currentSections: [],
  compareMode: "none",
  isAnimating: false,
  updateState: (newState: Partial<AppState>) => {},
}

export const UserContext = React.createContext<AppState>(defaultState)