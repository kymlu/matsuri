import React from 'react';
import './App.css';
import { HashRouter, Navigate, Route, Routes } from 'react-router-dom';
import FormationEditorPage from './pages/FormationEditorPage.tsx';
import FestivalManager from './pages/FestivalManager.tsx';
import { RequireDB } from './data/RequireDb.tsx';

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<FestivalManager />} />
        <Route path="/formation" element={<RequireDB><FormationEditorPage /></RequireDB>} />
        <Route path="*" element={<Navigate to="/" replace/>}/>
      </Routes>
    </HashRouter>
  );
}

export default App;
