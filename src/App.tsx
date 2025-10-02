import React from 'react';
import './App.css';
import { HashRouter, Navigate, Route, Routes } from 'react-router-dom';
import FestivalManager from './pages/FestivalManager.tsx';
import { RequireDB } from './lib/dataAccess/RequireDb.tsx';
import FormationPage from './pages/FormationPage.tsx';

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<FestivalManager />} />
        <Route path="/formation" element={<RequireDB><FormationPage /></RequireDB>} />
        <Route path="*" element={<Navigate to="/" replace/>}/>
      </Routes>
    </HashRouter>
  );
}

export default App;
