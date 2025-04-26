import { Link } from 'react-router-dom';
import './MangaCard.scss';

interface MangaCardProps {
  manga: {
    id: string;
    attributes: {
      title: { [key: string]: string };
    };
    relationships: {
      type: string;
      attributes?: {
        fileName?: string;
      };
    }[];
  };
}

function MangaCard({ manga }: MangaCardProps) {
  if (!manga || !manga.relationships || !manga.attributes?.title) {
    return null;
  }

  const title =
    manga.attributes.title.en ||
    manga.attributes.title.pt ||
    Object.values(manga.attributes.title)[0] ||
    'Sem título';

  const coverRel = manga.relationships.find((r) => r.type === 'cover_art');
  const coverFile = coverRel?.attributes?.fileName;

  if (!coverFile) return null;

  const coverUrl = `https://uploads.mangadex.org/covers/${manga.id}/${coverFile}.256.jpg`;

  return (
    <Link to={`/manga/${manga.id}`} className="manga-card">
      <img src={coverUrl} alt={title} onError={(e) => (e.currentTarget.src = '/fallback-cover.jpg')} />
      <h3>{title}</h3>
    </Link>
  );
}

export default MangaCard;
