import React from 'react';
import { useDB } from './DBProvider.tsx';

export const RequireDB = ({ children }) => {
  const { dbReady } = useDB();

  // if (!dbReady) return <p>Initializing database...</p>;
  return children;
};
