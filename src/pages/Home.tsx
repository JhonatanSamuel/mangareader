import { useEffect, useState } from 'react';
import MangaCard from '../components/MangaCard';
import { Link } from 'react-router-dom';
import '../styles/Home.scss';

// ✅ Constante com a URL do seu proxy
const API_BASE_URL = 'https://mangadex-proxy-2i3k.onrender.com/api';

const genres = [
  { id: 'b13b2a48-c720-44a9-9c77-39c9979373fb', name: 'Action' },
  { id: '391b0423-d847-456f-aff0-8b0cfc03066b', name: 'Romance' },
  { id: '4d32cc48-9f00-4cca-9b5a-a839f0764984', name: 'Comedy' },
];

const statuses = [
  { value: 'ongoing', label: 'In progress' },
  { value: 'completed', label: 'Completed' },
];

function Home() {
  const fetchCover = async (mangaId: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/manga/${mangaId}?includes[]=cover_art`);
      const data = await response.json();
      const fileName = data.data?.relationships?.find((rel: any) => rel.type === 'cover_art')?.attributes?.fileName;
      return fileName
        ? `https://uploads.mangadex.org/covers/${mangaId}/${fileName}.256.jpg`
        : 'caminho/para/imagem/default.jpg'; // Imagem de fallback caso não encontre
    } catch (error) {
      console.error('Erro ao buscar capa:', error);
      return 'caminho/para/imagem/default.jpg'; // Imagem de fallback em caso de erro
    }
  };

  interface Manga {
    id: string;
    attributes: {
      title: { [key: string]: string };
      description?: { [key: string]: string };
      [key: string]: string | { [key: string]: string } | undefined;
    };
  }

  const [mangas, setMangas] = useState<Manga[]>([]);
  const [topMangas, setTopMangas] = useState<Manga[]>([]);
  const [selectedGenre, setSelectedGenre] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [readingHistory, setReadingHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(false); // Estado de carregamento
  const [error, setError] = useState<string | null>(null); // Estado de erro

  useEffect(() => {
    const fetchFilteredMangas = async () => {
      setLoading(true);
      setError(null); // Resetando o erro
      let url = `${API_BASE_URL}/manga?limit=100&includes[]=cover_art`;
      if (selectedStatus) url += `&status[]=${selectedStatus}`;
      if (selectedGenre) url += `&includedTags[]=${selectedGenre}`;
      if (searchQuery) url += `&title=${encodeURIComponent(searchQuery)}`;

      try {
        const res = await fetch(url);
        if (!res.ok) throw new Error('Erro na requisição');
        const data = await res.json();
        setMangas(data.data);
      } catch (error) {
        setError('Não foi possível carregar os mangás. Tente novamente mais tarde.');
        console.error('Erro ao buscar mangás:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFilteredMangas();
  }, [selectedGenre, selectedStatus, searchQuery]);

  useEffect(() => {
    const stored = localStorage.getItem('readingHistory');
    if (stored) {
      const parsed = JSON.parse(stored);
      const historyArray = Object.values(parsed).sort((a: any, b: any) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      );
      setReadingHistory(historyArray);
    }
  }, []);

  useEffect(() => {
    const stored = localStorage.getItem('readingHistory');
    if (!stored) return;

    const parsed = JSON.parse(stored);
    const sorted = Object.values(parsed).sort((a: any, b: any) =>
      new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );

    const loadCovers = async () => {
      const withCovers = await Promise.all(
        sorted.map(async (item: any) => {
          const coverUrl = await fetchCover(item.mangaId);
          return { ...item, coverUrl };
        })
      );
      setReadingHistory(withCovers);
    };

    loadCovers();
  }, []);

  const handleRemoveFromHistory = (idToRemove: string) => {
    const stored = localStorage.getItem('readingHistory');
    if (!stored) return;

    const parsed = JSON.parse(stored);
    delete parsed[idToRemove];

    localStorage.setItem('readingHistory', JSON.stringify(parsed));

    const updatedHistory = Object.values(parsed).sort((a: any, b: any) =>
      new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );

    setReadingHistory(updatedHistory);
  };

  useEffect(() => {
    const fetchTopMangas = async () => {
      setLoading(true);
      setError(null); // Resetando o erro
      const url = `${API_BASE_URL}/manga?limit=10&includes[]=cover_art&order[followedCount]=desc`;

      try {
        const res = await fetch(url);
        if (!res.ok) throw new Error('Erro ao buscar top mangás');
        const data = await res.json();
        setTopMangas(data.data); // Apenas os 10 primeiros mangás populares
      } catch (error) {
        setError('Não foi possível carregar os mangás mais populares.');
        console.error('Erro ao buscar top 10 mangás:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTopMangas();
  }, []);

  return (
    <div>
      <h2>Explore Manga</h2>

      <div className="search-bar">
        <label htmlFor="search-input">Search</label>
        <input
          id="search-input"
          type="text"
          placeholder="Search for manga or comics..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="filters">
        <label htmlFor="genre-select">Genre</label>
        <select
          id="genre-select"
          onChange={(e) => setSelectedGenre(e.target.value)}
          value={selectedGenre}
        >
          <option value="">All Genres</option>
          {genres.map((genre) => (
            <option key={genre.id} value={genre.id}>
              {genre.name}
            </option>
          ))}
        </select>

        <label htmlFor="status-select">Status</label>
        <select
          id="status-select"
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
        >
          <option value="">All statuses</option>
          {statuses.map((status) => (
            <option key={status.value} value={status.value}>
              {status.label}
            </option>
          ))}
        </select>
      </div>

      {loading && <p>Loading...</p>}
      {error && <p className="error">{error}</p>}

      {readingHistory.length > 0 && (
        <div className="reading-history">
          <h2>Continue lendo</h2>
          <div className="manga-grid">
            {readingHistory.map((item: any) => (
              <div key={item.mangaId} className="manga-history-card">
                <Link to={`/manga/${item.mangaId}/chapter/${item.chapterId}`}>
                  {item.coverUrl && (
                    <img src={item.coverUrl} alt={item.title} className="history-cover" />
                  )}
                  <div className="history-title">{item.title}</div>
                  <div className="chapter-info">
                    Capítulo {item.chapterNumber || ''} {item.chapterTitle || ''}
                  </div>
                </Link>
                <button onClick={() => handleRemoveFromHistory(item.mangaId)}>✖</button>
              </div>
            ))}
          </div>
        </div>
      )}

      <h2 className="section-title">Top 10 Most Popular Mangas</h2>
      <div className="top-manga-row">
        {topMangas.slice(0, 10).map((manga) => (
          <div key={manga.id} className="manga-card-container">
            <MangaCard manga={manga} layout="vertical" />
          </div>
        ))}
      </div>

      <h2 className="section-title">Latest Mangas</h2>
      <div className="manga-grid">
        {mangas.map((manga) => (
          <MangaCard key={manga.id} manga={manga} layout="vertical" />
        ))}
      </div>
    </div>
  );
}

export default Home;
