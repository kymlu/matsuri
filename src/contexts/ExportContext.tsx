import React from 'react';

export interface ExportContextState {
  isExporting: boolean,
  exportProgress: number,
  exportName: string,
  updateExportContext: (newState: Partial<ExportContextState>) => void
}

export type ExportContextData = Omit<ExportContextState, 'updateExportContext'>;

export const defaultExportContext: ExportContextState = {
  isExporting: false,
  exportProgress: 0,
  exportName: "",
  updateExportContext: (newState: Partial<ExportContextState>) => {},
}

export const ExportContext = React.createContext<ExportContextState>(defaultExportContext)