import React from 'react';

export interface LogContextState {
  logs: string[],
  updateLogContext: (newLog: string) => void
}

export type CompareMode = "previous" | "none" | "next";

export type LogContextData = Omit<LogContextState, 'updateState'>;

export const defaultState: LogContextState = {
  logs: [],
  updateLogContext: (newLog: string) => {},
}

export const LogContext = React.createContext<LogContextState>(defaultState)