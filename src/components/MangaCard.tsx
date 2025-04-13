import { Link } from 'react-router-dom';
import './MangaCard.scss';

function MangaCard({ manga }: { manga: any }) {
  if (!manga || !manga.relationships || !manga.attributes?.title) {
    return null;
  }

  const title =
    manga.attributes.title.en ||
    manga.attributes.title.pt ||
    Object.values(manga.attributes.title)[0]; // Pega o primeiro disponível

  const coverRel = manga.relationships.find((r: any) => r.type === 'cover_art');
  const coverFile = coverRel?.attributes?.fileName;

  if (!coverFile) return null;

  const coverUrl = `https://uploads.mangadex.org/covers/${manga.id}/${coverFile}.256.jpg`;

  return (
    <Link to={`/manga/${manga.id}`} className="manga-card">
      <img src={coverUrl} alt={title} />
      <h3>{title}</h3>
    </Link>
  );
}

export default MangaCard;
