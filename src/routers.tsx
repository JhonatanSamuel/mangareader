import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import MangaDetails from './pages/MangaDetails';

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/manga/:id" element={<MangaDetails />} />
      </Routes>
    </BrowserRouter>
  );
}
