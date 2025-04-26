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
      chapter: string | null;
      title?: string;
    };
  }

  const fetchChapterData = useCallback(async (chapterId: string) => {
    setLoading(true);
    try {
      const chapterRes = await fetch(`https://api.mangadex.org/chapter/${chapterId}`);
      const chapterData = await chapterRes.json();
      const attributes = chapterData.data.attributes;
      setChapterNumber(attributes.chapter || 'Especial');

      const mangaRel = chapterData.data.relationships.find((rel: any) => rel.type === 'manga');
      if (mangaRel) setMangaId(mangaRel.id);

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

  const fetchMangaAndChapters = useCallback(async (mangaId: string) => {
    try {
      const mangaRes = await fetch(`https://api.mangadex.org/manga/${mangaId}?includes[]=cover_art`);
      const mangaData = await mangaRes.json();
      setMangaTitle(mangaData.data.attributes.title?.en || 'Sem título');

      const chaptersRes = await fetch(`https://api.mangadex.org/chapter?manga=${mangaId}&translatedLanguage[]=en&order[chapter]=asc&limit=100`);
      const chaptersData = await chaptersRes.json();
      setChapters(chaptersData.data);
    } catch (err) {
      console.error("Erro ao carregar informações do mangá:", err);
    }
  }, []);

  useEffect(() => {
    if (chapterId) {
      fetchChapterData(chapterId);
    }
  }, [chapterId, fetchChapterData]);

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
      <Link to="/" className="back-button">← Voltar para Home</Link>

      <div className="chapter-navigation">
        <button onClick={() => previousChapter && navigate(`/chapter/${previousChapter.id}`)} disabled={!previousChapter}>
          ⬅ Capítulo Anterior
        </button>

        <h2 className="chapter-info">
          {mangaTitle} - Capítulo {chapterNumber}
        </h2>

        <button onClick={() => nextChapter && navigate(`/chapter/${nextChapter.id}`)} disabled={!nextChapter}>
          Próximo Capítulo ➡
        </button>
      </div>

      {chapters.length > 0 && (
        <div className="chapter-selector">
          <label htmlFor="chapter-select">Selecione o Capítulo</label>
          <select id="chapter-select" onChange={handleChapterChange} value={chapterId}>
            {chapters.map((chapter) => (
              <option key={chapter.id} value={chapter.id}>
                Capítulo {chapter.attributes.chapter || 'Especial'}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="chapter-images">
        {images.map((url, index) => (
          <img
            key={index}
            src={url}
            alt={`Página ${index + 1}`}
            className="chapter-image"
            loading="lazy"
          />
        ))}
      </div>

      <div className="chapter-navigation">
        <button onClick={() => previousChapter && navigate(`/chapter/${previousChapter.id}`)} disabled={!previousChapter}>
          ⬅ Capítulo Anterior
        </button>
        <button onClick={() => nextChapter && navigate(`/chapter/${nextChapter.id}`)} disabled={!nextChapter}>
          Próximo Capítulo ➡
        </button>
      </div>
    </div>
  );
}

export default ChapterReader;
