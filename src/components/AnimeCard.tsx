import React from 'react';
import { Play, Bookmark, Check } from 'lucide-react';
import { Anime } from '../types';
import { playAnimeClickSound } from '../utils/audioSynth';

interface AnimeCardProps {
  anime: Anime;
  onSelectAnime: (anime: Anime) => void;
  onOpenTrailer: (anime: Anime) => void;
  isInWatchlist: boolean;
  onToggleWatchlist: (anime: Anime) => void;
}

export const AnimeCard: React.FC<AnimeCardProps> = ({
  anime,
  onSelectAnime,
  onOpenTrailer,
  isInWatchlist,
  onToggleWatchlist,
}) => {
  const imageUrl =
    anime.images.webp?.large_image_url ||
    anime.images.jpg.large_image_url ||
    anime.images.jpg.image_url;

  return (
    <div
      id={`anime-card-${anime.mal_id}`}
      className="group relative flex flex-col bg-[#0F0F0F] hover:bg-[#141414] border border-white/10 hover:border-[#FF2D55] transition-all duration-300 shadow-lg"
    >
      {/* Poster Image Container */}
      <div
        className="relative aspect-[3/4] w-full overflow-hidden cursor-pointer bg-[#0A0A0A]"
        onClick={() => {
          playAnimeClickSound();
          onSelectAnime(anime);
        }}
      >
        <img
          src={imageUrl}
          alt={anime.title}
          loading="lazy"
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 opacity-90 group-hover:opacity-100"
          referrerPolicy="no-referrer"
        />

        {/* Hover Action Overlay */}
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-2.5 z-20">
          {anime.trailer?.youtube_id && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                playAnimeClickSound();
                onOpenTrailer(anime);
              }}
              title="Play Trailer"
              className="px-3.5 py-2 bg-[#FF2D55] text-white hover:bg-white hover:text-black text-[10px] font-black uppercase tracking-widest transition-colors flex items-center gap-1.5"
            >
              <Play className="w-3 h-3 fill-current" />
              Trailer
            </button>
          )}

          <button
            onClick={(e) => {
              e.stopPropagation();
              playAnimeClickSound();
              onToggleWatchlist(anime);
            }}
            title={isInWatchlist ? 'Remove from Archive' : 'Add to Archive'}
            className={`p-2 border transition-colors ${
              isInWatchlist
                ? 'bg-[#FF2D55] border-[#FF2D55] text-white'
                : 'bg-black/80 border-white/20 text-white/80 hover:bg-white hover:text-black'
            }`}
          >
            {isInWatchlist ? <Check className="w-3.5 h-3.5" /> : <Bookmark className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Top Badges (Score & Format) */}
        <div className="absolute top-2 left-2 right-2 flex items-center justify-between pointer-events-none z-10">
          <div className="flex items-center gap-1 px-2 py-0.5 bg-black/90 border border-white/10 text-[9px] font-black text-[#FF2D55] tracking-wider uppercase">
            ★ {anime.score ? anime.score.toFixed(1) : 'N/A'}
          </div>

          <div className="px-1.5 py-0.5 bg-black/90 border border-white/10 text-[8px] font-bold text-white/60 tracking-widest uppercase">
            {anime.status === 'Currently Airing' ? 'AIRING' : anime.episodes ? `${anime.episodes} EPS` : 'MOVIE'}
          </div>
        </div>
      </div>

      {/* Card Content Footer */}
      <div className="p-3.5 flex flex-col flex-1 justify-between bg-[#0F0F0F] border-t border-white/5">
        <div
          className="cursor-pointer"
          onClick={() => {
            playAnimeClickSound();
            onSelectAnime(anime);
          }}
        >
          <h3
            className="font-bold text-xs sm:text-sm text-white group-hover:text-[#FF2D55] line-clamp-1 uppercase tracking-tight transition-colors"
            title={anime.title}
          >
            {anime.title}
          </h3>
          <p className="text-[10px] text-white/40 line-clamp-1 mt-0.5 font-mono">
            {anime.title_japanese || anime.title_english || anime.synopsis?.slice(0, 40)}
          </p>
        </div>

        {/* Genres & Year */}
        <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-white/5 text-[9px] text-white/50 uppercase tracking-widest font-bold">
          <span className="truncate max-w-[110px]">
            {anime.genres && anime.genres[0]?.name ? anime.genres[0].name : 'SERIES'}
          </span>
          <span className="text-white/40">
            {anime.year || anime.season || 'TOP'}
          </span>
        </div>
      </div>
    </div>
  );
};
