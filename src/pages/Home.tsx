import { useEffect, useState } from 'react';
import MangaCard from '../components/MangaCard';
import { Link } from 'react-router-dom';
import '../styles/Home.scss';

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
      const response = await fetch(`https://api.mangadex.org/cover?limit=1&manga[]=${mangaId}`);
      const data = await response.json();
      const fileName = data.data[0]?.attributes?.fileName;
      return fileName
        ? `https://uploads.mangadex.org/covers/${mangaId}/${fileName}.256.jpg`
        : null;
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


  useEffect(() => {
    const fetchFilteredMangas = async () => {
      let url = 'https://api.mangadex.org/manga?limit=100&includes[]=cover_art';
      if (selectedStatus) url += `&status[]=${selectedStatus}`;
      if (selectedGenre) url += `&includedTags[]=${selectedGenre}`;
      if (searchQuery) url += `&title=${encodeURIComponent(searchQuery)}`;

      try {
        const res = await fetch(url);
        if (!res.ok) throw new Error('Erro na requisição');
        const data = await res.json();
        setMangas(data.data);
      } catch (error) {
        console.error('Erro ao buscar mangás:', error);
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
      const url =
        'https://api.mangadex.org/manga?limit=10&includes[]=cover_art&order[followedCount]=desc';

      try {
        const res = await fetch(url);
        if (!res.ok) throw new Error('Erro ao buscar top mangás');
        const data = await res.json();
        setTopMangas(data.data);
      } catch (error) {
        console.error('Erro ao buscar top 10 mangás:', error);
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
                <div className="chapter-info">Capítulo {item.chapterNumber || ''} {item.chapterTitle || ''}</div>

              </Link>
              <button onClick={() => handleRemoveFromHistory(item.mangaId)}>✖</button>
            </div>
          ))}
        </div>
      </div>
    )}


      <h2 className="section-title">Top 10 Most Popular Mangas</h2>
      <div className="ranking-carousel">
        {topMangas.map((manga) => (
          <div className="scroll-item" key={manga.id}>
            <MangaCard manga={manga} layout="vertical" />
          </div>
        ))}
      </div>

      <div className="manga-grid">
        {mangas.map((manga) => (
          <MangaCard key={manga.id} manga={manga} layout="vertical" />
        ))}
      </div>
    </div>
  );
}

export default Home;