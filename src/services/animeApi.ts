import { Anime, AnimeCharacter } from '../types';
import { CURATED_ANIME_LIST } from '../data/curatedAnime';

const JIKAN_BASE_URL = 'https://api.jikan.moe/v4';

// In-memory cache to stay friendly to Jikan's rate limits (3 req/sec)
const cache: { [key: string]: { data: any; timestamp: number } } = {};
const CACHE_TTL = 1000 * 60 * 10; // 10 minutes

async function fetchWithCache(url: string) {
  const now = Date.now();
  if (cache[url] && now - cache[url].timestamp < CACHE_TTL) {
    return cache[url].data;
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!res.ok) {
      throw new Error(`HTTP Error ${res.status}`);
    }

    const json = await res.json();
    cache[url] = { data: json, timestamp: now };
    return json;
  } catch (error) {
    console.warn(`Jikan fetch failed for ${url}, using local cache/fallback`, error);
    return null;
  }
}

export async function getTopAiringAnime(): Promise<Anime[]> {
  const result = await fetchWithCache(`${JIKAN_BASE_URL}/top/anime?filter=airing&limit=15`);
  if (result && result.data && result.data.length > 0) {
    return result.data;
  }
  return CURATED_ANIME_LIST.filter(a => a.status === 'Currently Airing').concat(CURATED_ANIME_LIST.slice(0, 8));
}

export async function getPopularAnime(): Promise<Anime[]> {
  const result = await fetchWithCache(`${JIKAN_BASE_URL}/top/anime?filter=bypopularity&limit=20`);
  if (result && result.data && result.data.length > 0) {
    return result.data;
  }
  return CURATED_ANIME_LIST;
}

export async function getSeasonalAnime(): Promise<Anime[]> {
  const result = await fetchWithCache(`${JIKAN_BASE_URL}/seasons/now?limit=20`);
  if (result && result.data && result.data.length > 0) {
    return result.data;
  }
  return CURATED_ANIME_LIST;
}

export async function searchAnime(query: string, genreId?: number): Promise<Anime[]> {
  if (!query.trim() && (!genreId || genreId === 0)) {
    return CURATED_ANIME_LIST;
  }

  let url = `${JIKAN_BASE_URL}/anime?limit=20&order_by=score&sort=desc`;
  if (query.trim()) {
    url += `&q=${encodeURIComponent(query.trim())}`;
  }
  if (genreId && genreId > 0) {
    url += `&genres=${genreId}`;
  }

  const result = await fetchWithCache(url);
  if (result && result.data && result.data.length > 0) {
    return result.data;
  }

  // Local fallback filter
  return CURATED_ANIME_LIST.filter(anime => {
    const matchesQuery = !query.trim() ||
      anime.title.toLowerCase().includes(query.toLowerCase()) ||
      (anime.title_english && anime.title_english.toLowerCase().includes(query.toLowerCase())) ||
      (anime.title_japanese && anime.title_japanese.toLowerCase().includes(query.toLowerCase()));

    const matchesGenre = !genreId || genreId === 0 ||
      anime.genres.some(g => g.mal_id === genreId);

    return matchesQuery && matchesGenre;
  });
}

export async function getAnimeCharacters(animeId: number): Promise<AnimeCharacter[]> {
  const result = await fetchWithCache(`${JIKAN_BASE_URL}/anime/${animeId}/characters`);
  if (result && result.data) {
    return result.data.slice(0, 10);
  }
  return [];
}
