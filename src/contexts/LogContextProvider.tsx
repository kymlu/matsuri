import React, { ReactNode, useState } from 'react'
import { defaultState, LogContext, LogContextState } from './LogContext.tsx';

interface Props {
  children: React.ReactNode
}

export const LogContextProvider: React.FunctionComponent<Props> = (props: Props): ReactNode => {
  const [state, setState] = useState<LogContextState>(defaultState)

  const updateLogContext = (newLog: string) => {
    var newLogs = [...state.logs, newLog];
    setState({logs: newLogs} as LogContextState);
    localStorage.setItem('siteLog', JSON.stringify(newLogs));
  }

  return (
    <LogContext.Provider value={{ ...state, updateLogContext }}>{props.children}</LogContext.Provider>
  )
}