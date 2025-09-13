import React from 'react';

export interface SettingsContextState {
  enableAnimation: boolean,
  updateSettingsContext: (newState: Partial<SettingsContextState>) => void
}

export type CompareMode = "previous" | "none" | "next";

export type SettingsContextData = Omit<SettingsContextState, 'updateState'>;

export const defaultState: SettingsContextState = {
  enableAnimation: true,
  updateSettingsContext: (newState: Partial<SettingsContextState>) => {},
}

export const SettingsContext = React.createContext<SettingsContextState>(defaultState)