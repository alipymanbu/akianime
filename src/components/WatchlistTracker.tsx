import React, { useState } from 'react';
import {
  Bookmark,
  CheckCircle2,
  Clock,
  Play,
  Trash2,
  Star,
  Plus,
  Minus,
  Sparkles,
  TrendingUp,
  Award,
  Layers,
  Edit3
} from 'lucide-react';
import { WatchlistItem, WatchStatus, Anime } from '../types';
import { playAnimeClickSound, playSuccessChime } from '../utils/audioSynth';

interface WatchlistTrackerProps {
  watchlist: WatchlistItem[];
  onUpdateItem: (mal_id: number, updates: Partial<WatchlistItem>) => void;
  onRemoveItem: (mal_id: number) => void;
  onSelectAnime: (anime: Anime) => void;
  onExploreAnime: () => void;
}

export const WatchlistTracker: React.FC<WatchlistTrackerProps> = ({
  watchlist,
  onUpdateItem,
  onRemoveItem,
  onSelectAnime,
  onExploreAnime,
}) => {
  const [filterStatus, setFilterStatus] = useState<WatchStatus | 'all'>('all');

  const statusTabs: { id: WatchStatus | 'all'; label: string; count: number }[] = [
    { id: 'all', label: 'All Records', count: watchlist.length },
    { id: 'watching', label: 'Currently Watching', count: watchlist.filter((i) => i.status === 'watching').length },
    { id: 'completed', label: 'Completed Series', count: watchlist.filter((i) => i.status === 'completed').length },
    { id: 'plan_to_watch', label: 'Plan to Watch', count: watchlist.filter((i) => i.status === 'plan_to_watch').length },
    { id: 'dropped', label: 'Dropped Archive', count: watchlist.filter((i) => i.status === 'dropped').length },
  ];

  const filteredList =
    filterStatus === 'all' ? watchlist : watchlist.filter((item) => item.status === filterStatus);

  const totalEpisodesWatched = watchlist.reduce((acc, item) => acc + item.currentEpisode, 0);
  const completedCount = watchlist.filter((i) => i.status === 'completed').length;
  const estimatedHours = Math.round((totalEpisodesWatched * 23.5) / 60);

  const handleIncrementEpisode = (item: WatchlistItem) => {
    playAnimeClickSound();
    const newEp = item.currentEpisode + 1;
    const maxEp = item.totalEpisodes || 999;
    const nextStatus = newEp >= maxEp ? 'completed' : item.status;

    if (newEp >= maxEp) {
      playSuccessChime();
    }

    onUpdateItem(item.anime.mal_id, {
      currentEpisode: Math.min(newEp, maxEp),
      status: nextStatus,
      updatedAt: new Date().toISOString(),
    });
  };

  const handleDecrementEpisode = (item: WatchlistItem) => {
    playAnimeClickSound();
    const newEp = Math.max(0, item.currentEpisode - 1);
    onUpdateItem(item.anime.mal_id, {
      currentEpisode: newEp,
      status: newEp === 0 ? 'plan_to_watch' : 'watching',
      updatedAt: new Date().toISOString(),
    });
  };

  const handleStatusChange = (mal_id: number, status: WatchStatus) => {
    playAnimeClickSound();
    onUpdateItem(mal_id, { status, updatedAt: new Date().toISOString() });
  };

  const handleScoreChange = (mal_id: number, userScore: number) => {
    playAnimeClickSound();
    onUpdateItem(mal_id, { userScore, updatedAt: new Date().toISOString() });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header Banner - Editorial Aesthetic */}
      <div className="p-6 sm:p-10 bg-[#0D0D0D] border border-white/10 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="px-2 py-0.5 bg-[#FF2D55] text-white text-[9px] font-black uppercase tracking-widest">
              VOL. 04 // USER ARCHIVE
            </span>
            <span className="text-[10px] uppercase font-bold tracking-widest text-white/40">
              Personal Collection
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-editorial-serif font-black tracking-tighter italic text-white uppercase">
            Curated Anime Watchlist
          </h2>
          <p className="text-xs text-white/60 max-w-xl mt-1 uppercase tracking-wider font-medium">
            Log episodes watched, track seasonal progress, and evaluate your personal ratings archive.
          </p>
        </div>

        {/* Quick Metrics (3 Columns) */}
        <div className="grid grid-cols-3 gap-3 w-full md:w-auto">
          <div className="p-4 bg-[#141414] border border-white/10 text-center min-w-[95px]">
            <span className="text-[9px] text-white/40 uppercase font-bold tracking-widest block">Watched</span>
            <span className="text-xl sm:text-2xl font-black text-white font-mono">{totalEpisodesWatched}</span>
            <span className="text-[8px] text-white/30 uppercase tracking-wider block">Episodes</span>
          </div>
          <div className="p-4 bg-[#141414] border border-white/10 text-center min-w-[95px]">
            <span className="text-[9px] text-white/40 uppercase font-bold tracking-widest block">Finished</span>
            <span className="text-xl sm:text-2xl font-black text-[#FF2D55] font-mono">{completedCount}</span>
            <span className="text-[8px] text-white/30 uppercase tracking-wider block">Series</span>
          </div>
          <div className="p-4 bg-[#141414] border border-white/10 text-center min-w-[95px]">
            <span className="text-[9px] text-white/40 uppercase font-bold tracking-widest block">Time</span>
            <span className="text-xl sm:text-2xl font-black text-white font-mono">{estimatedHours}h</span>
            <span className="text-[8px] text-white/30 uppercase tracking-wider block">Logged</span>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {statusTabs.map((tab) => (
          <button
            key={tab.id}
            id={`filter-tab-${tab.id}`}
            onClick={() => {
              playAnimeClickSound();
              setFilterStatus(tab.id);
            }}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-widest transition-all whitespace-nowrap border ${
              filterStatus === tab.id
                ? 'bg-[#FF2D55] border-[#FF2D55] text-white'
                : 'bg-[#121212] border-white/10 text-white/60 hover:text-white hover:border-white/30'
            }`}
          >
            <span>{tab.label}</span>
            <span
              className={`text-[9px] px-1.5 py-0.2 font-black ${
                filterStatus === tab.id ? 'bg-black/30 text-white' : 'bg-white/10 text-white/50'
              }`}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Watchlist Grid / Empty State */}
      {filteredList.length === 0 ? (
        <div className="text-center py-16 px-4 border border-white/10 bg-[#0F0F0F] space-y-4">
          <Bookmark className="w-10 h-10 text-white/20 mx-auto" />
          <h3 className="text-base font-bold text-white uppercase tracking-wider">No Records in this category</h3>
          <p className="text-xs text-white/40 max-w-md mx-auto">
            Explore the catalog to bookmark anime series and track your progress in the editorial archive.
          </p>
          <button
            onClick={onExploreAnime}
            className="px-6 py-3 bg-white text-black text-xs font-black uppercase tracking-widest hover:bg-[#FF2D55] hover:text-white transition-colors"
          >
            Explore Anime Catalog
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredList.map((item) => {
            const anime = item.anime;
            const maxEps = item.totalEpisodes || anime.episodes || 12;
            const progressPercent = Math.min(100, Math.round((item.currentEpisode / maxEps) * 100));

            return (
              <div
                key={anime.mal_id}
                id={`watchlist-item-${anime.mal_id}`}
                className="flex flex-col sm:flex-row gap-4 p-4 bg-[#0F0F0F] border border-white/10 hover:border-white/30 transition-all shadow-md"
              >
                {/* Poster */}
                <img
                  src={anime.images.jpg.image_url}
                  alt={anime.title}
                  onClick={() => onSelectAnime(anime)}
                  className="w-24 sm:w-28 aspect-[3/4] object-cover border border-white/10 cursor-pointer hover:opacity-90 flex-shrink-0"
                  referrerPolicy="no-referrer"
                />

                {/* Info & Progress */}
                <div className="flex-1 min-w-0 flex flex-col justify-between space-y-3">
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <h4
                        onClick={() => onSelectAnime(anime)}
                        className="font-bold text-xs sm:text-sm text-white hover:text-[#FF2D55] cursor-pointer truncate uppercase tracking-tight"
                      >
                        {anime.title}
                      </h4>
                      <button
                        onClick={() => {
                          playAnimeClickSound();
                          onRemoveItem(anime.mal_id);
                        }}
                        className="text-white/40 hover:text-[#FF2D55] p-1 transition-colors"
                        title="Remove from archive"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <p className="text-[10px] text-white/40 font-mono line-clamp-1 mt-0.5">
                      {anime.title_japanese || anime.genres.map((g) => g.name).join(' / ')}
                    </p>
                  </div>

                  {/* Status Dropdown & Score */}
                  <div className="flex flex-wrap items-center gap-2">
                    <select
                      value={item.status}
                      onChange={(e) => handleStatusChange(anime.mal_id, e.target.value as WatchStatus)}
                      className="bg-black text-[10px] font-bold uppercase tracking-wider text-white px-2 py-1 border border-white/20 focus:outline-none focus:border-[#FF2D55]"
                    >
                      <option value="watching">Watching</option>
                      <option value="completed">Completed</option>
                      <option value="plan_to_watch">Plan to Watch</option>
                      <option value="dropped">Dropped</option>
                    </select>

                    <div className="flex items-center gap-1 bg-black px-2 py-1 border border-white/20">
                      <Star className="w-3 h-3 text-[#FF2D55] fill-[#FF2D55]" />
                      <select
                        value={item.userScore}
                        onChange={(e) => handleScoreChange(anime.mal_id, Number(e.target.value))}
                        className="bg-transparent text-[10px] font-bold text-white focus:outline-none cursor-pointer"
                      >
                        <option value={0}>Rate</option>
                        {[10, 9, 8, 7, 6, 5, 4, 3, 2, 1].map((n) => (
                          <option key={n} value={n} className="bg-black text-white">
                            {n} ★
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Episode Progress Bar & Counter */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-[10px] font-mono uppercase font-bold">
                      <span className="text-white/60">
                        EPISODE <strong className="text-white">{item.currentEpisode}</strong> / {maxEps}
                      </span>
                      <span className="text-[#FF2D55]">{progressPercent}%</span>
                    </div>

                    <div className="w-full bg-black h-1.5 overflow-hidden border border-white/10">
                      <div
                        className="bg-[#FF2D55] h-full transition-all duration-300"
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <button
                        onClick={() => handleDecrementEpisode(item)}
                        disabled={item.currentEpisode <= 0}
                        className="p-1 bg-[#1A1A1A] hover:bg-white/20 disabled:opacity-30 text-white border border-white/10"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => handleIncrementEpisode(item)}
                        disabled={item.currentEpisode >= maxEps}
                        className="flex-1 py-1 bg-white hover:bg-[#FF2D55] hover:text-white disabled:opacity-30 text-black text-[10px] font-black uppercase tracking-widest transition-colors"
                      >
                        +1 Episode
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
