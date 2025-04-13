

export async function fetchMangas() {
    const res = await fetch('https://api.mangadex.org/manga?limit=10&includes[]=cover_art');
    const data = await res.json();
    return data;
  }