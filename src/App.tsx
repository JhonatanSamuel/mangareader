import { Outlet } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import './styles/App.scss';

function App() {
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    document.body.classList.toggle('dark', darkMode);
  }, [darkMode]);

  return (
    <>
      <button className="theme-toggle" onClick={() => setDarkMode(!darkMode)}>
        {darkMode ? '☀️ Modo Claro' : '🌙 Modo Escuro'}
      </button>

      <header className="header">
        <h1>
          <Link to="/" className="logo-link">Mangaland</Link>
        </h1>
      </header>

      <main>
        <Outlet />
      </main>
    </>
  );
}

export default App;
