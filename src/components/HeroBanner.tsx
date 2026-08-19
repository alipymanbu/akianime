import React, { useState, useEffect } from 'react';
import { Play, Plus, Check, Star, ChevronRight, ChevronLeft, Info, Bookmark } from 'lucide-react';
import { Anime } from '../types';
import { playAnimeClickSound } from '../utils/audioSynth';

interface HeroBannerProps {
  featuredAnimeList: Anime[];
  onSelectAnime: (anime: Anime) => void;
  onOpenTrailer: (anime: Anime) => void;
  isInWatchlist: (mal_id: number) => boolean;
  onToggleWatchlist: (anime: Anime) => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({
  featuredAnimeList,
  onSelectAnime,
  onOpenTrailer,
  isInWatchlist,
  onToggleWatchlist,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (featuredAnimeList.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % featuredAnimeList.length);
    }, 9000);
    return () => clearInterval(interval);
  }, [featuredAnimeList.length]);

  if (!featuredAnimeList || featuredAnimeList.length === 0) return null;

  const currentAnime = featuredAnimeList[currentIndex];
  const inWatchlist = isInWatchlist(currentAnime.mal_id);

  const handleNext = () => {
    playAnimeClickSound();
    setCurrentIndex((prev) => (prev + 1) % featuredAnimeList.length);
  };

  const handlePrev = () => {
    playAnimeClickSound();
    setCurrentIndex((prev) => (prev - 1 + featuredAnimeList.length) % featuredAnimeList.length);
  };

  return (
    <div className="relative w-full bg-[#0A0A0A] border border-white/10 overflow-hidden mb-12 shadow-2xl">
      {/* Editorial Grid Structure (Col 1: Vertical label, Col 7: Main Typography, Col 4: Image Archive) */}
      <div className="grid grid-cols-12 relative min-h-[520px] lg:min-h-[580px]">
        
        {/* Col 1: Vertical Architectural Tag (Visible on MD+) */}
        <div className="hidden md:flex col-span-1 border-r border-white/10 flex-col items-center justify-center py-10 select-none">
          <div className="rotate-[-90deg] whitespace-nowrap text-[9px] uppercase tracking-[0.45em] font-bold text-white/30">
            WINTER ARCHIVE // 2024–2025
          </div>
        </div>

        {/* Col 7 (or 11 on mobile): Editorial Headline & Copy */}
        <div className="col-span-12 md:col-span-7 p-6 sm:p-10 lg:p-14 flex flex-col justify-between z-10">
          <div>
            {/* Tag / Micro Labels */}
            <div className="flex items-center gap-3 mb-4">
              <span className="px-2 py-1 bg-[#FF2D55] text-white text-[10px] font-black uppercase tracking-tighter">
                FEATURED SPOTLIGHT
              </span>
              <span className="text-[10px] uppercase font-bold tracking-widest text-white/40">
                {currentAnime.genres.slice(0, 2).map((g) => g.name).join(' / ')}
              </span>
              {currentAnime.title_japanese && (
                <span className="text-[10px] font-mono text-white/30 hidden sm:inline">
                  {currentAnime.title_japanese}
                </span>
              )}
            </div>

            {/* Huge Editorial Serif / Italic Title */}
            <h1 className="text-4xl sm:text-6xl lg:text-[76px] font-editorial-serif leading-[0.88] font-black tracking-tighter mb-5 italic text-white drop-shadow-sm uppercase">
              {currentAnime.title}
            </h1>

            {/* Synopsis */}
            <p className="max-w-lg text-xs sm:text-sm leading-relaxed text-white/60 font-medium line-clamp-3 sm:line-clamp-4">
              {currentAnime.synopsis}
            </p>
          </div>

          {/* Action Buttons - Editorial Solid Box Style */}
          <div className="flex flex-wrap items-center gap-3 pt-6">
            <button
              id="hero-play-trailer-btn"
              onClick={() => {
                playAnimeClickSound();
                onOpenTrailer(currentAnime);
              }}
              className="bg-white text-black px-8 py-3.5 text-xs font-black uppercase tracking-widest hover:bg-[#FF2D55] hover:text-white transition-colors flex items-center gap-2"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              Watch Trailer
            </button>

            <button
              id="hero-details-btn"
              onClick={() => {
                playAnimeClickSound();
                onSelectAnime(currentAnime);
              }}
              className="border border-white/20 text-white px-7 py-3.5 text-xs font-black uppercase tracking-widest hover:bg-white/10 transition-colors flex items-center gap-2"
            >
              <Info className="w-3.5 h-3.5 text-white/60" />
              Episodes & Cast
            </button>

            <button
              id="hero-watchlist-toggle-btn"
              onClick={() => {
                playAnimeClickSound();
                onToggleWatchlist(currentAnime);
              }}
              className={`p-3.5 border text-xs font-black uppercase tracking-widest transition-colors ${
                inWatchlist
                  ? 'bg-[#FF2D55] border-[#FF2D55] text-white'
                  : 'border-white/20 text-white/70 hover:bg-white/10'
              }`}
              title={inWatchlist ? 'Saved in Archive' : 'Add to Archive'}
            >
              {inWatchlist ? <Check className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Col 4: Image Art Container with Ghost Number & Red Accent Circle */}
        <div className="col-span-12 md:col-span-4 relative border-t md:border-t-0 md:border-l border-white/10 bg-[#121212] overflow-hidden min-h-[300px] md:min-h-full">
          {/* Subtle gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-transparent to-transparent z-10" />

          {/* Featured Image */}
          <img
            src={currentAnime.banner_image || currentAnime.images.jpg.large_image_url}
            alt={currentAnime.title}
            className="w-full h-full object-cover object-center opacity-85 transition-opacity duration-700"
            referrerPolicy="no-referrer"
          />

          {/* Geometric Accent Circle */}
          <div className="absolute top-[-10%] right-[-10%] w-[120%] h-[120%] border-[16px] border-[#FF2D55]/15 rounded-full pointer-events-none" />

          {/* Ghost Index Number & Trending Tag */}
          <div className="absolute bottom-6 right-6 z-20 text-right">
            <div className="text-[72px] lg:text-[88px] font-black italic text-white/10 leading-none select-none font-editorial-serif">
              0{currentIndex + 1}
            </div>
            <div className="text-[10px] font-bold uppercase tracking-widest text-[#FF2D55]">
              Current Spotlight
            </div>
          </div>
        </div>
      </div>

      {/* Editorial Footer Grid (4-Columns with Metadata & Controls) */}
      <footer className="border-t border-white/10 grid grid-cols-2 md:grid-cols-4 items-center bg-[#0D0D0D] text-white">
        <div className="px-6 sm:px-8 border-r border-white/10 h-20 flex flex-col justify-center gap-0.5">
          <span className="text-[9px] uppercase font-bold tracking-widest text-white/40">Episodes / Status</span>
          <span className="text-xs sm:text-sm font-bold tracking-tight uppercase">
            {currentAnime.episodes ? `${currentAnime.episodes} Episodes` : 'Currently Airing'}
          </span>
        </div>

        <div className="px-6 sm:px-8 border-r border-white/10 h-20 flex flex-col justify-center gap-0.5">
          <span className="text-[9px] uppercase font-bold tracking-widest text-white/40">Score / Rank</span>
          <span className="text-xs sm:text-sm font-bold tracking-tight text-[#FF2D55] uppercase">
            ★ {currentAnime.score || '9.0'} MAL // #{currentAnime.rank || 1}
          </span>
        </div>

        <div className="px-6 sm:px-8 border-r border-white/10 h-20 hidden md:flex flex-col justify-center gap-0.5">
          <span className="text-[9px] uppercase font-bold tracking-widest text-white/40">Production Studio</span>
          <span className="text-xs sm:text-sm font-bold tracking-tight uppercase truncate">
            {currentAnime.studios && currentAnime.studios[0] ? currentAnime.studios[0].name : 'KYOTO-X / MADHOUSE'}
          </span>
        </div>

        <div className="px-6 sm:px-8 h-20 flex items-center justify-between">
          {/* Carousel indicator dots */}
          <div className="flex gap-2">
            {featuredAnimeList.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`w-2.5 h-2.5 transition-all ${
                  idx === currentIndex ? 'bg-[#FF2D55]' : 'bg-white/20 hover:bg-white/40'
                }`}
              />
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrev}
              className="p-2 border border-white/15 hover:border-white/40 text-white/60 hover:text-white"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleNext}
              className="p-2 border border-white/15 hover:border-white/40 text-white/60 hover:text-white"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};
