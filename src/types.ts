export interface AnimeEpisode {
  id?: string;
  episode_number: number;
  title: string;
  title_japanese?: string;
  synopsis?: string;
  duration?: string;
  video_url?: string; // local blob URL, data URL, MP4 stream, or embed
  thumbnail?: string;
  aired?: string;
  filler?: boolean;
}

export interface Anime {
  mal_id: number;
  title: string;
  title_english?: string;
  title_japanese?: string;
  images: {
    jpg: {
      image_url: string;
      small_image_url?: string;
      large_image_url: string;
    };
    webp?: {
      image_url: string;
      small_image_url?: string;
      large_image_url: string;
    };
  };
  banner_image?: string;
  trailer?: {
    youtube_id?: string;
    url?: string;
    embed_url?: string;
  };
  synopsis: string;
  background?: string;
  season?: string;
  year?: number;
  broadcast?: {
    day?: string;
    time?: string;
    timezone?: string;
    string?: string;
  };
  episodes: number | null;
  duration?: string;
  rating?: string;
  score: number | null;
  scored_by?: number;
  rank?: number;
  popularity?: number;
  status: 'Currently Airing' | 'Finished Airing' | 'Not yet aired' | string;
  genres: Array<{ mal_id: number; name: string }>;
  studios: Array<{ mal_id: number; name: string }>;
  themes?: Array<{ mal_id: number; name: string }>;
  demographics?: Array<{ mal_id: number; name: string }>;
  characters?: Array<{ name: string; role: string; image: string; voiceActor: string }>;
  episode_list?: AnimeEpisode[];
  isFeatured?: boolean;
}

export type WatchStatus = 'watching' | 'completed' | 'plan_to_watch' | 'on_hold' | 'dropped';

export interface WatchlistItem {
  anime: Anime;
  status: WatchStatus;
  currentEpisode: number;
  totalEpisodes: number | null;
  userScore: number; // 0-10
  notes: string;
  addedAt: string;
  updatedAt: string;
  isFavorite: boolean;
}

export interface AnimeCharacter {
  character: {
    mal_id: number;
    name: string;
    images: {
      jpg: {
        image_url: string;
      };
    };
  };
  role: string;
  voice_actors?: Array<{
    person: {
      mal_id: number;
      name: string;
      images: {
        jpg: {
          image_url: string;
        };
      };
    };
    language: string;
  }>;
}

export interface TriviaQuestion {
  id: number;
  anime: string;
  question: string;
  options: string[];
  correctIndex: number;
  hint: string;
  explanation: string;
  difficulty: 'Genin (Easy)' | 'Chunin (Medium)' | 'Jonin (Hard)' | 'Hokage (Expert)';
}

export interface TierAssignment {
  [animeId: number]: 'S' | 'A' | 'B' | 'C' | 'D';
}

export interface AdminUser {
  email: string;
  name: string;
  role: 'admin' | 'viewer';
  avatar?: string;
  lastLogin: string;
}

export type AppTheme = 'cyberpunk' | 'midnight' | 'sakura' | 'slate';
