import React from 'react';

export interface ExportContextState {
  isExporting: boolean,
  exportProgress: number,
  updateExportContext: (newState: Partial<ExportContextState>) => void
}

export type ExportContextData = Omit<ExportContextState, 'updateExportContext'>;

export const defaultExportContext: ExportContextState = {
  isExporting: false,
  exportProgress: 0,
  updateExportContext: (newState: Partial<ExportContextState>) => {},
}

export const ExportContext = React.createContext<ExportContextState>(defaultExportContext)