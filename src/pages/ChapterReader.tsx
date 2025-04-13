import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import '../styles/ChapterReader.scss';

function ChapterReader() {
  const { id: chapterId } = useParams();
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [mangaId, setMangaId] = useState<string>('');
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [chapterNumber, setChapterNumber] = useState<string>('');
  const [mangaTitle, setMangaTitle] = useState<string>('');
  const navigate = useNavigate();

  interface Chapter {
    id: string;
    attributes: {
      chapter: string;
      title?: string;
    };
  }

  // 1. Buscar imagens do capítulo + número do capítulo
  const fetchChapterData = useCallback(async (chapterId: string) => {
    setLoading(true);
    try {
      // Pega dados do capítulo
      const chapterRes = await fetch(`https://api.mangadex.org/chapter/${chapterId}`);
      const chapterData = await chapterRes.json();
      const attributes = chapterData.data.attributes;
      setChapterNumber(attributes.chapter || '');
      
      // Salva o mangaId se ainda não estiver salvo
      interface Relationship {
        id: string;
        type: string;
      }
      const mangaRel = chapterData.data.relationships.find((rel: Relationship) => rel.type === 'manga');
      if (mangaRel) setMangaId(mangaRel.id);

      // Pega imagens
      const res = await fetch(`https://api.mangadex.org/at-home/server/${chapterId}`);
      const data = await res.json();
      const baseUrl = data.baseUrl;
      const chapterHash = data.chapter.hash;
      const pageArray = data.chapter.data;
      const fullUrls = pageArray.map((file: string) => `${baseUrl}/data/${chapterHash}/${file}`);
      setImages(fullUrls);
    } catch (err) {
      console.error("Erro ao carregar capítulo:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // 2. Buscar dados do mangá e capítulos
  const fetchMangaAndChapters = useCallback(async (mangaId: string) => {
    try {
      // Título
      const mangaRes = await fetch(`https://api.mangadex.org/manga/${mangaId}?includes[]=cover_art`);
      const mangaData = await mangaRes.json();
      setMangaTitle(mangaData.data.attributes.title?.en || 'Sem título');

      // Lista de capítulos
      const chaptersRes = await fetch(`https://api.mangadex.org/chapter?manga=${mangaId}&translatedLanguage[]=en&order[chapter]=asc&limit=100`);
      const chaptersData = await chaptersRes.json();
      setChapters(chaptersData.data);
    } catch (err) {
      console.error("Erro ao carregar informações do mangá:", err);
    }
  }, []);

  // 3. Carregar dados quando capítulo mudar
  useEffect(() => {
    if (chapterId) {
      fetchChapterData(chapterId);
    }
  }, [chapterId, fetchChapterData]);

  // 4. Quando mangaId mudar, buscar info do mangá
  useEffect(() => {
    if (mangaId) {
      fetchMangaAndChapters(mangaId);
    }
  }, [mangaId, fetchMangaAndChapters]);

  const currentIndex = chapters.findIndex(ch => ch.id === chapterId);
  const previousChapter = currentIndex > 0 ? chapters[currentIndex - 1] : null;
  const nextChapter = currentIndex >= 0 && currentIndex < chapters.length - 1 ? chapters[currentIndex + 1] : null;

  const handleChapterChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedChapterId = event.target.value;
    if (selectedChapterId !== chapterId) {
      navigate(`/chapter/${selectedChapterId}`);
    }
  };



  const renderImages = useCallback(() => {
    return images.map((url, index) => (
      <img
        key={index}
        src={url}
        alt={`Página ${index + 1}`}
        className="chapter-image"
        loading="lazy"
      />
    ));
  }, [images]);

  useEffect(() => {
    if (mangaId && chapterId && mangaTitle) {
      const history = JSON.parse(localStorage.getItem('readingHistory') || '{}');
  
      history[mangaId] = {
        mangaId,
        chapterId,
        title: mangaTitle,
        updatedAt: new Date().toISOString(),
      };
  
      localStorage.setItem('readingHistory', JSON.stringify(history));
    }
  }, [mangaId, chapterId, mangaTitle]);
  

  if (loading) return <div>Loading images...</div>;

  return (
    <div className="chapter-reader">
      <Link to="/" className="back-button">← Back to Home </Link>

      {/* Navegação entre capítulos */}
      <div className="chapter-navigation">
        <button onClick={() => previousChapter && navigate(`/chapter/${previousChapter.id}`)} disabled={!previousChapter}>
          ⬅ Previous Chapter
        </button>

        <h2 className="chapter-info">
          {mangaTitle ? `${mangaTitle} - Capítulo ${chapterNumber}` : `Capítulo ${chapterNumber}`}
        </h2>

        <button onClick={() => nextChapter && navigate(`/chapter/${nextChapter.id}`)} disabled={!nextChapter}>
        Next Chapter ➡
        </button>
      </div>

      {/* Seletor de capítulos */}
      {chapters.length > 0 && (
        <div className="chapter-selector">
          <label htmlFor="chapter-select">Select the Chapter</label>
          <select
            id="chapter-select"
            onChange={handleChapterChange}
            value={chapterId}
          >
            {chapters.map((chapter) => (
              <option key={chapter.id} value={chapter.id}>
                Chapter {chapter.attributes.chapter}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Imagens do capítulo */}
      <div className="chapter-images">
        {renderImages()}
      </div>

      {/* Botões no fim */}
      <div className="chapter-navigation">
        <button onClick={() => previousChapter && navigate(`/chapter/${previousChapter.id}`)} disabled={!previousChapter}>
          ⬅ Previous Chapter
        </button>
        <button onClick={() => nextChapter && navigate(`/chapter/${nextChapter.id}`)} disabled={!nextChapter}>
           Next Chapter ➡
        </button>
      </div>
    </div>
  );
}

export default ChapterReader;
