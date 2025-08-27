import { createContext, useState } from 'react';
import { Festival } from '../models/Festival.ts';
import React from 'react';
import { Formation } from '../models/Formation.ts';
import { ParticipantPosition, PropPosition } from '../models/Position.ts';
import { FormationSongSection } from '../models/FormationSection.ts';

export interface AppState {
  selectedFestival: Festival | null,
  selectedFormation: Formation | null,
  selectedSection: FormationSongSection | null,
  selectedItem: ParticipantPosition | PropPosition | null,
  snapToGrid: boolean,
  showPrevious: boolean,
  showNext: boolean,
  updateState: (newState: Partial<AppState>) => void
}

export type AppStateData = Omit<AppState, 'updateState'>;

export const defaultState: AppState = {
  selectedFestival: null,
  selectedFormation: null,
  selectedItem: null,
  selectedSection: null,
  snapToGrid: true,
  showPrevious: false,
  showNext: false,
  updateState: (newState: Partial<AppState>) => {},
}

export const UserContext = React.createContext<AppState>(defaultState)