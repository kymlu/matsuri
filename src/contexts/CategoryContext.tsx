import React from 'react';
import { ParticipantCategory } from '../models/ParticipantCategory.ts';

export interface CategoryContextState {
  categories: Record<string, ParticipantCategory>,
  updateCategoryContext: (newState: Partial<CategoryContextState>) => void
}

export type CategoryContextData = Omit<CategoryContextState, 'updateCategoryContext'>;

export const defaultCategoryContext: CategoryContextState = {
  categories: {},
  updateCategoryContext: (newState: Partial<CategoryContextState>) => {},
}

export const CategoryContext = React.createContext<CategoryContextState>(defaultCategoryContext)