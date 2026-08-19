import React, { useState } from 'react';
import {
  X,
  Play,
  Bookmark,
  Check,
  Star,
  Volume2,
  FastForward,
  Film,
  Users,
  Layers,
  Sparkles,
  Info,
  Calendar,
  Clock,
  Tv,
  ChevronLeft,
  ChevronRight,
  Maximize2
} from 'lucide-react';
import { Anime, AnimeEpisode } from '../types';
import { playAnimeClickSound } from '../utils/audioSynth';

interface AnimeDetailModalProps {
  anime: Anime | null;
  onClose: () => void;
  isInWatchlist: boolean;
  onToggleWatchlist: (anime: Anime) => void;
  onOpenTrailer: (anime: Anime) => void;
}

export const AnimeDetailModal: React.FC<AnimeDetailModalProps> = ({
  anime,
  onClose,
  isInWatchlist,
  onToggleWatchlist,
  onOpenTrailer,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'episodes' | 'cast'>('overview');
  const [selectedEpisodeNum, setSelectedEpisodeNum] = useState<number>(1);
  const [isPlayingSimulation, setIsPlayingSimulation] = useState<boolean>(false);
  const [audioLang, setAudioLang] = useState<'JP Sub' | 'EN Dub'>('JP Sub');

  if (!anime) return null;

  // Build combined episodes list (Custom uploaded episodes priority, or fallback generated)
  const customEpisodes = anime.episode_list || [];
  const totalEps = Math.max(anime.episodes || 12, customEpisodes.length);
  
  const episodesList: AnimeEpisode[] =
    customEpisodes.length > 0
      ? customEpisodes
      : Array.from({ length: Math.min(totalEps, 24) }, (_, i) => ({
          episode_number: i + 1,
          title:
            i === 0
              ? 'The Awakening & The Departure'
              : i === 1
              ? 'Encounter in the Shadow Realm'
              : i === 2
              ? 'Echoes of the Forgotten Kingdom'
              : `Clash of Fates (Part ${i - 2})`,
          duration: '23m 48s',
          video_url: anime.trailer?.embed_url || anime.trailer?.url,
          thumbnail: anime.images.jpg.large_image_url || anime.images.jpg.image_url,
          aired: 'Broadcast Air Date',
        }));

  const activePlayingEpisode =
    episodesList.find((e) => e.episode_number === selectedEpisodeNum) || episodesList[0];

  const handlePlayEpisode = (epNum: number) => {
    playAnimeClickSound();
    setSelectedEpisodeNum(epNum);
    setIsPlayingSimulation(true);
  };

  const isLocalBlobVideo =
    activePlayingEpisode?.video_url?.startsWith('blob:') ||
    activePlayingEpisode?.video_url?.endsWith('.mp4') ||
    activePlayingEpisode?.video_url?.endsWith('.webm') ||
    activePlayingEpisode?.video_url?.startsWith('data:video');

  const isYoutube =
    activePlayingEpisode?.video_url?.includes('youtube.com') ||
    activePlayingEpisode?.video_url?.includes('youtu.be');

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-6 bg-black/90 backdrop-blur-md animate-in fade-in duration-200"
      onClick={() => {
        playAnimeClickSound();
        onClose();
      }}
    >
      <div
        className="relative w-full max-w-5xl max-h-[92vh] bg-[#0A0A0A] border border-white/15 overflow-hidden shadow-2xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[#0F0F0F] select-none">
          <div className="flex items-center gap-3">
            <span className="px-2 py-0.5 bg-[#FF2D55] text-white text-[9px] font-black uppercase tracking-widest">
              ARCHIVE RECORD
            </span>
            <span className="text-[11px] font-mono text-white/40 uppercase tracking-widest hidden sm:inline">
              MAL ID: #{anime.mal_id} // 2025
            </span>
          </div>

          <button
            onClick={() => {
              playAnimeClickSound();
              onClose();
            }}
            className="p-2 text-white/60 hover:text-white border border-white/10 hover:border-white/40 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="overflow-y-auto flex-1 p-6 sm:p-8 space-y-8">
          {/* Header Section: Poster + Title + Actions */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 lg:gap-8 items-start">
            {/* Poster / Trailer Preview */}
            <div className="md:col-span-4 relative group">
              <div className="relative aspect-[3/4] w-full overflow-hidden border border-white/15 bg-black">
                <img
                  src={anime.images.jpg.large_image_url || anime.images.jpg.image_url}
                  alt={anime.title}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  {(anime.trailer?.youtube_id || anime.trailer?.url) && (
                    <button
                      onClick={() => {
                        playAnimeClickSound();
                        onOpenTrailer(anime);
                      }}
                      className="px-5 py-3 bg-[#FF2D55] text-white text-xs font-black uppercase tracking-widest hover:bg-white hover:text-black transition-colors flex items-center gap-2"
                    >
                      <Play className="w-4 h-4 fill-current" />
                      Play Trailer
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Info & Metadata */}
            <div className="md:col-span-8 space-y-5">
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className="text-xs font-black text-[#FF2D55] tracking-wider uppercase">
                    ★ {anime.score || '9.0'} SCORE
                  </span>
                  <span className="text-white/20">•</span>
                  <span className="text-xs font-bold text-white/60 uppercase tracking-wider">
                    {anime.type || 'TV SERIES'} ({anime.episodes ? `${anime.episodes} EPS` : 'ONGOING'})
                  </span>
                  <span className="text-white/20">•</span>
                  <span className="text-xs font-bold text-white/60 uppercase tracking-wider">
                    {anime.rating || 'PG-13 / R-17+'}
                  </span>
                </div>

                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-editorial-serif font-black tracking-tighter italic text-white uppercase leading-[0.9]">
                  {anime.title}
                </h2>
                {anime.title_japanese && (
                  <p className="text-xs font-mono text-white/40 mt-1">{anime.title_japanese}</p>
                )}
              </div>

              {/* Genre Chips */}
              <div className="flex flex-wrap gap-1.5">
                {anime.genres.map((g) => (
                  <span
                    key={g.mal_id}
                    className="px-2.5 py-1 bg-[#1A1A1A] border border-white/10 text-[10px] font-bold text-white/80 uppercase tracking-wider"
                  >
                    {g.name}
                  </span>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3 pt-2">
                <button
                  onClick={() => handlePlayEpisode(1)}
                  className="px-8 py-3 bg-white text-black hover:bg-[#FF2D55] hover:text-white text-xs font-black uppercase tracking-widest transition-colors flex items-center gap-2 cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  Stream Episode 1
                </button>

                <button
                  onClick={() => {
                    playAnimeClickSound();
                    onToggleWatchlist(anime);
                  }}
                  className={`px-6 py-3 border text-xs font-black uppercase tracking-widest transition-colors flex items-center gap-2 cursor-pointer ${
                    isInWatchlist
                      ? 'bg-[#FF2D55] border-[#FF2D55] text-white'
                      : 'border-white/20 text-white hover:bg-white/10'
                  }`}
                >
                  {isInWatchlist ? <Check className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
                  {isInWatchlist ? 'Archived in Watchlist' : 'Add to Watchlist'}
                </button>
              </div>

              {/* Quick Specs Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-3 border-t border-white/10 text-xs">
                <div>
                  <span className="text-[9px] uppercase font-bold text-white/40 tracking-widest block">Studio</span>
                  <span className="text-white font-bold text-xs uppercase">
                    {anime.studios && anime.studios[0] ? anime.studios[0].name : 'KYOTO-X DESIGN'}
                  </span>
                </div>
                <div>
                  <span className="text-[9px] uppercase font-bold text-white/40 tracking-widest block">Season</span>
                  <span className="text-white font-bold text-xs uppercase">
                    {anime.season || 'Fall'} {anime.year || '2025'}
                  </span>
                </div>
                <div>
                  <span className="text-[9px] uppercase font-bold text-white/40 tracking-widest block">Broadcast</span>
                  <span className="text-white font-bold text-xs uppercase">
                    {anime.broadcast?.string || 'Saturdays at 23:00 JST'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Episode Stream Active Player Surface */}
          {isPlayingSimulation && activePlayingEpisode && (
            <div className="p-5 border border-white/15 bg-[#121212] space-y-4 animate-in fade-in">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 bg-[#FF2D55] animate-pulse" />
                  <span className="text-xs font-black text-white uppercase tracking-widest">
                    Active Episode Player // Episode {activePlayingEpisode.episode_number}: {activePlayingEpisode.title}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setAudioLang(audioLang === 'JP Sub' ? 'EN Dub' : 'JP Sub')}
                    className="px-2.5 py-1 text-[10px] font-bold uppercase bg-black border border-white/20 text-white hover:border-[#FF2D55]"
                  >
                    Audio: {audioLang}
                  </button>
                  <button
                    onClick={() => setIsPlayingSimulation(false)}
                    className="text-xs text-white/50 hover:text-white"
                  >
                    Close Player
                  </button>
                </div>
              </div>

              {/* Player Visual Element */}
              <div className="relative aspect-video w-full bg-black border border-white/10 overflow-hidden flex flex-col justify-between">
                {isLocalBlobVideo ? (
                  <video
                    src={activePlayingEpisode.video_url}
                    controls
                    autoPlay
                    className="w-full h-full object-contain"
                  />
                ) : isYoutube ? (
                  <iframe
                    src={
                      activePlayingEpisode.video_url?.includes('embed')
                        ? activePlayingEpisode.video_url
                        : `https://www.youtube-nocookie.com/embed/${anime.trailer?.youtube_id || 'dQw4w9WgXcQ'}?autoplay=1`
                    }
                    title={activePlayingEpisode.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full h-full border-0"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col justify-between p-6 relative">
                    {/* Background Backdrop */}
                    <img
                      src={activePlayingEpisode.thumbnail || anime.images.jpg.large_image_url}
                      alt={activePlayingEpisode.title}
                      className="absolute inset-0 w-full h-full object-cover opacity-20 filter blur-sm"
                    />

                    <div className="relative z-10 flex justify-between items-start">
                      <div className="bg-black/80 px-3 py-1 text-[10px] font-mono text-white/70 border border-white/10">
                        {anime.title} // EP {activePlayingEpisode.episode_number} • 1080P MASTER
                      </div>
                      <div className="px-2 py-0.5 bg-[#FF2D55] text-white text-[9px] font-black uppercase">
                        ONLINE STREAM
                      </div>
                    </div>

                    <div className="relative z-10 text-center space-y-2">
                      <div className="w-14 h-14 bg-white/10 hover:bg-[#FF2D55] text-white flex items-center justify-center mx-auto cursor-pointer transition-colors border border-white/20">
                        <Play className="w-6 h-6 fill-current" />
                      </div>
                      <p className="text-xs font-bold text-white uppercase tracking-widest">
                        Episode {activePlayingEpisode.episode_number}: {activePlayingEpisode.title}
                      </p>
                    </div>

                    {/* Player Controls Bar */}
                    <div className="relative z-10 bg-black/90 p-3 border border-white/10 flex items-center justify-between text-xs text-white">
                      <div className="flex items-center gap-3">
                        <button className="text-white hover:text-[#FF2D55]">
                          <Play className="w-3.5 h-3.5 fill-current" />
                        </button>
                        <span className="text-[10px] font-mono text-white/50">04:15 / {activePlayingEpisode.duration || '23:48'}</span>
                      </div>

                      <button className="px-3 py-1 bg-white/10 hover:bg-[#FF2D55] text-white text-[10px] font-black uppercase tracking-wider transition-colors flex items-center gap-1">
                        <FastForward className="w-3 h-3" />
                        Skip Intro (+85s)
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Episode Switcher Controls */}
              <div className="flex items-center justify-between pt-2">
                <button
                  disabled={selectedEpisodeNum <= 1}
                  onClick={() => handlePlayEpisode(selectedEpisodeNum - 1)}
                  className="px-3 py-1.5 bg-[#1A1A1A] hover:bg-white hover:text-black disabled:opacity-30 disabled:pointer-events-none text-white text-[10px] font-black uppercase tracking-wider transition-colors flex items-center gap-1 border border-white/10"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  Previous Episode
                </button>

                <span className="text-xs font-mono text-white/60">
                  Episode {selectedEpisodeNum} of {episodesList.length}
                </span>

                <button
                  disabled={selectedEpisodeNum >= episodesList.length}
                  onClick={() => handlePlayEpisode(selectedEpisodeNum + 1)}
                  className="px-3 py-1.5 bg-[#1A1A1A] hover:bg-white hover:text-black disabled:opacity-30 disabled:pointer-events-none text-white text-[10px] font-black uppercase tracking-wider transition-colors flex items-center gap-1 border border-white/10"
                >
                  Next Episode
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* Navigation Tabs (Overview / Episodes / Cast) */}
          <div className="border-b border-white/10 flex items-center gap-6">
            {(['overview', 'episodes', 'cast'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => {
                  playAnimeClickSound();
                  setActiveTab(tab);
                }}
                className={`pb-3 text-xs font-bold uppercase tracking-widest transition-colors relative ${
                  activeTab === tab
                    ? 'text-white border-b-2 border-[#FF2D55]'
                    : 'text-white/40 hover:text-white'
                }`}
              >
                {tab === 'overview' && 'Synopsis & Overview'}
                {tab === 'episodes' && `Episodes List (${episodesList.length})`}
                {tab === 'cast' && `Characters & Cast (${anime.characters?.length || 0})`}
              </button>
            ))}
          </div>

          {/* Tab 1: Overview */}
          {activeTab === 'overview' && (
            <div className="space-y-4">
              <h4 className="text-xs font-black uppercase tracking-widest text-[#FF2D55]">Synopsis</h4>
              <p className="text-sm leading-relaxed text-white/70 font-medium">
                {anime.synopsis || 'No synopsis provided for this record.'}
              </p>
              {anime.background && (
                <div className="p-4 bg-[#141414] border border-white/10 text-xs text-white/60 space-y-1">
                  <strong className="text-white uppercase tracking-wider block font-bold">Background Lore:</strong>
                  <p>{anime.background}</p>
                </div>
              )}
            </div>
          )}

          {/* Tab 2: Episodes List */}
          {activeTab === 'episodes' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {episodesList.map((ep) => (
                <div
                  key={ep.episode_number}
                  onClick={() => handlePlayEpisode(ep.episode_number)}
                  className={`p-3.5 border cursor-pointer transition-all flex items-center justify-between ${
                    selectedEpisodeNum === ep.episode_number
                      ? 'bg-[#FF2D55]/15 border-[#FF2D55] text-white'
                      : 'bg-[#121212] border-white/10 hover:border-white/30 text-white/80'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-xs font-mono text-[#FF2D55] font-black">
                      {ep.episode_number < 10 ? `0${ep.episode_number}` : ep.episode_number}
                    </span>
                    <div className="min-w-0">
                      <p className="text-xs font-bold uppercase truncate max-w-[220px]">{ep.title}</p>
                      <span className="text-[10px] text-white/40 font-mono">{ep.duration || '24m'}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {ep.video_url?.startsWith('blob:') && (
                      <span className="px-1.5 py-0.5 bg-emerald-500/20 text-emerald-400 text-[8px] font-black uppercase font-mono">
                        LOCAL
                      </span>
                    )}
                    <Play className="w-3.5 h-3.5 text-white/40 hover:text-white" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Tab 3: Characters & Cast */}
          {activeTab === 'cast' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {anime.characters && anime.characters.length > 0 ? (
                anime.characters.map((char, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 p-3 bg-[#121212] border border-white/10"
                  >
                    <img
                      src={char.image}
                      alt={char.name}
                      className="w-12 h-16 object-cover border border-white/10 flex-shrink-0"
                      referrerPolicy="no-referrer"
                    />
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-white truncate uppercase">{char.name}</p>
                      <p className="text-[10px] text-[#FF2D55] uppercase font-bold">{char.role}</p>
                      <p className="text-[9px] text-white/40 truncate">VA: {char.voiceActor}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full py-8 text-center text-xs text-white/40">
                  Cast information will be loaded from official broadcast archives.
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
