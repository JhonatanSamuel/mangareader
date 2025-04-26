import { useParams, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import '../styles/MangaDetails.scss';

function MangaDetails() {
  const { id } = useParams();

  interface Manga {
    id: string;
    attributes: {
      title?: { [key: string]: string };
      description?: { en?: string };
      status?: string;
    };
    relationships: {
      type: string;
      attributes?: {
        fileName?: string;
      };
    }[];
  }

  interface Chapter {
    id: string;
    attributes: {
      chapter: string | null;
    };
  }

  const [manga, setManga] = useState<Manga | null>(null);
  const [coverUrl, setCoverUrl] = useState<string>('');
  const [chapters, setChapters] = useState<Chapter[]>([]);

  useEffect(() => {
    async function fetchManga() {
      const res = await fetch(`https://api.mangadex.org/manga/${id}?includes[]=cover_art`);
      const data = await res.json();
      const mangaData = data.data;
      setManga(mangaData);

      const coverArt = mangaData.relationships.find((rel: any) => rel.type === 'cover_art');
      if (coverArt) {
        const fileName = coverArt.attributes?.fileName;
        const url = `https://uploads.mangadex.org/covers/${mangaData.id}/${fileName}`;
        setCoverUrl(url);
      }
    }

    async function fetchChapters() {
      const res = await fetch(`https://api.mangadex.org/chapter?manga=${id}&translatedLanguage[]=en&order[chapter]=asc&limit=100`);
      const data = await res.json();
      const sortedChapters = data.data.sort((a: Chapter, b: Chapter) => 
        (parseFloat(a.attributes.chapter || "0") - parseFloat(b.attributes.chapter || "0"))
      );
      setChapters(sortedChapters);
    }

    if (id) {
      fetchManga();
      fetchChapters();
    }
  }, [id]);

  if (!manga) return <div>Loading...</div>;

  return (
    <div className="manga-details">
      <h1>{manga.attributes.title?.en || 'Sem título'}</h1>
      {coverUrl && <img className="reader-image" src={coverUrl} alt={manga.attributes.title?.en || 'Capa do mangá'} />}
      <p dangerouslySetInnerHTML={{ __html: manga.attributes.description?.en || 'Sem descrição disponível.' }}></p>
      <p><strong>Status:</strong> {manga.attributes.status || 'Desconhecido'}</p>

      <h2>Capítulos</h2>
      <ul>
        {chapters.map((chap: Chapter) => (
          <li key={chap.id}>
            <Link className="link" to={`/chapter/${chap.id}`}>
              Capítulo {chap.attributes.chapter || 'Especial'}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default MangaDetails;
