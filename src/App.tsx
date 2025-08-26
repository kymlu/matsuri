import React from 'react';
import './App.css';
import { BrowserRouter, Link, Route, Routes } from 'react-router-dom';
import FormationEditorPage from './pages/FormationEditorPage.tsx';
import Home from './pages/Home.tsx';

function App() {
  return (
    <BrowserRouter>
      {/* Navigation */}
      <nav>
        {/* <Link to="/">Home</Link> |{" "}
        <Link to="/about">About</Link> |{" "}
        <Link to="/contact">Contact</Link> */}
      </nav>

      {/* Routes */}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/formation" element={<FormationEditorPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
