import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import App from './App.tsx';
import Home from './pages/Home.tsx';
import MangaDetails from './pages/MangaDetails.tsx';
import ChapterReader from './pages/ChapterReader';


ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>

      <BrowserRouter>
        <Routes>
          <Route path="/" element={<App />}>
            <Route index element={<Home />} />
            <Route path="manga/:id" element={<MangaDetails />} />
            <Route path="chapter/:id" element={<ChapterReader />} />
            <Route path="manga/:mangaId/chapter/:id" element={<ChapterReader />} />

          </Route>
        </Routes>
      </BrowserRouter>
  </React.StrictMode>
);
