import React from 'react';
import './App.css';
import { HashRouter, Navigate, Route, Routes } from 'react-router-dom';
import FestivalManagerPage from './pages/FestivalManagerPage.tsx';
import { RequireDB } from './lib/dataAccess/RequireDb.tsx';
import FormationPage from './pages/FormationPage.tsx';
import FormationSelectionPage from './pages/FormationSelectionPage.tsx';

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<FormationSelectionPage />} />
        <Route path="/manager" element={<RequireDB><FestivalManagerPage/></RequireDB>} />
        <Route path="/formation" element={<RequireDB><FormationPage /></RequireDB>} />
        <Route path="*" element={<Navigate to="/" replace/>}/>
      </Routes>
    </HashRouter>
  );
}

export default App;
