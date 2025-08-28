import React from 'react';
import './App.css';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import FormationEditorPage from './pages/FormationEditorPage.tsx';
import { IndexedDBController } from './data/IndexedDbController.ts';
import FestivalManager from './pages/FestivalManager.tsx';

export const db: IndexedDBController = new IndexedDBController()

db.init();

function App() {
  return (
    <BrowserRouter basename={process.env.PUBLIC_URL}>
      {/* Routes */}
      <Routes>
        <Route path="/" element={<FestivalManager />} />
        <Route path="/formation" element={<FormationEditorPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
