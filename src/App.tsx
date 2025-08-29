import React from 'react';
import './App.css';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import FormationEditorPage from './pages/FormationEditorPage.tsx';
import FestivalManager from './pages/FestivalManager.tsx';
import { RequireDB } from './data/RequireDb.tsx';

function App() {
  return (
    <BrowserRouter basename={process.env.PUBLIC_URL}>
      {/* Routes */}
      <Routes>
        <Route path="/" element={<FestivalManager />} />
        <Route path="/formation" element={<RequireDB><FormationEditorPage /></RequireDB>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
