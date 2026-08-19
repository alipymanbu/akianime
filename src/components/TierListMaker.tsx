import React, { useState } from 'react';
import { SlidersHorizontal, RotateCcw, Sparkles, Check, Download, Layers } from 'lucide-react';
import { Anime, TierAssignment } from '../types';
import { CURATED_ANIME_LIST } from '../data/curatedAnime';
import { playAnimeClickSound } from '../utils/audioSynth';

interface TierListMakerProps {
  animeList: Anime[];
  onSelectAnime: (anime: Anime) => void;
}

export const TierListMaker: React.FC<TierListMakerProps> = ({ animeList, onSelectAnime }) => {
  const tiers: { id: 'S' | 'A' | 'B' | 'C' | 'D'; label: string; bg: string; text: string }[] = [
    { id: 'S', label: 'TIER S // GOD TIER', bg: 'bg-[#FF2D55]', text: 'text-white' },
    { id: 'A', label: 'TIER A // MASTERPIECE', bg: 'bg-[#C01535]', text: 'text-white' },
    { id: 'B', label: 'TIER B // RECOMMENDED', bg: 'bg-[#262626]', text: 'text-white' },
    { id: 'C', label: 'TIER C // AVERAGE', bg: 'bg-[#1A1A1A]', text: 'text-white/80' },
    { id: 'D', label: 'TIER D // SKIP / DROP', bg: 'bg-[#101010]', text: 'text-white/50' },
  ];

  const [assignments, setAssignments] = useState<TierAssignment>({
    52991: 'S', // Frieren
    51009: 'S', // JJK S2
    5114: 'S',  // FMAB
    52299: 'A', // Solo Leveling
    38000: 'A', // Demon Slayer
    16498: 'A', // AOT
    44511: 'B', // Chainsaw Man
    50265: 'B', // Spy x Family
  });

  const availableAnime = animeList.length > 0 ? animeList : CURATED_ANIME_LIST;

  const handleAssignTier = (animeId: number, tier: 'S' | 'A' | 'B' | 'C' | 'D') => {
    playAnimeClickSound();
    setAssignments((prev) => ({
      ...prev,
      [animeId]: tier,
    }));
  };

  const handleRemoveFromTier = (animeId: number) => {
    playAnimeClickSound();
    setAssignments((prev) => {
      const copy = { ...prev };
      delete copy[animeId];
      return copy;
    });
  };

  const handleReset = () => {
    playAnimeClickSound();
    setAssignments({});
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header Banner - Editorial */}
      <div className="p-6 sm:p-10 bg-[#0D0D0D] border border-white/10 shadow-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="px-2 py-0.5 bg-[#FF2D55] text-white text-[9px] font-black uppercase tracking-widest">
              RANKING MATRIX
            </span>
            <span className="text-[10px] uppercase font-bold tracking-widest text-white/40">
              Custom Tier Evaluation
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-editorial-serif font-black tracking-tighter italic text-white uppercase">
            Anime Tier List Maker
          </h2>
          <p className="text-xs text-white/60 max-w-xl uppercase tracking-wider font-medium">
            Classify and rank franchise records into custom editorial tiers.
          </p>
        </div>

        <button
          onClick={handleReset}
          className="px-5 py-3 bg-black border border-white/15 text-white/70 hover:text-white hover:border-white/40 transition-colors text-[10px] font-black uppercase tracking-widest flex items-center gap-2 flex-shrink-0"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Reset Matrix
        </button>
      </div>

      {/* Tier Board */}
      <div className="bg-[#0A0A0A] border border-white/10 overflow-hidden shadow-2xl divide-y divide-white/10">
        {tiers.map((tier) => {
          const assignedAnime = availableAnime.filter((a) => assignments[a.mal_id] === tier.id);
          return (
            <div key={tier.id} className="flex flex-col sm:flex-row min-h-[100px]">
              {/* Tier Label */}
              <div
                className={`w-full sm:w-48 ${tier.bg} ${tier.text} font-black text-xs sm:text-sm uppercase tracking-widest flex items-center justify-center p-4 text-center flex-shrink-0 border-b sm:border-b-0 sm:border-r border-white/10`}
              >
                {tier.label}
              </div>

              {/* Tier Drop/Item Area */}
              <div className="flex-1 p-4 flex flex-wrap items-center gap-3 bg-[#0F0F0F] min-h-[90px]">
                {assignedAnime.length > 0 ? (
                  assignedAnime.map((anime) => (
                    <div
                      key={anime.mal_id}
                      className="group relative w-16 sm:w-20 aspect-[3/4] overflow-hidden border border-white/15 shadow-md cursor-pointer hover:border-[#FF2D55] transition-all"
                      onClick={() => handleRemoveFromTier(anime.mal_id)}
                      title={`Click to remove ${anime.title} from tier`}
                    >
                      <img
                        src={anime.images.jpg.image_url}
                        alt={anime.title}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 flex items-center justify-center text-[9px] text-[#FF2D55] font-black uppercase tracking-widest transition-opacity">
                        Remove
                      </div>
                    </div>
                  ))
                ) : (
                  <span className="text-[10px] text-white/30 uppercase tracking-widest font-mono px-2">
                    No series assigned in this tier
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Anime Selection Pool */}
      <div className="space-y-4 pt-4">
        <h3 className="text-xs font-black uppercase tracking-widest text-white flex items-center justify-between border-b border-white/10 pb-2">
          <span>Unranked Archive Pool</span>
          <span className="text-[10px] text-white/40 font-mono">Select tier (S–D) to place</span>
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {availableAnime.map((anime) => {
            const currentTier = assignments[anime.mal_id];
            return (
              <div
                key={anime.mal_id}
                className="flex flex-col bg-[#0F0F0F] border border-white/10 p-2 space-y-2"
              >
                <div
                  className="relative aspect-[3/4] overflow-hidden cursor-pointer"
                  onClick={() => onSelectAnime(anime)}
                >
                  <img
                    src={anime.images.jpg.image_url}
                    alt={anime.title}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  {currentTier && (
                    <div className="absolute top-1.5 right-1.5 px-2 py-0.5 bg-[#FF2D55] text-white font-black text-[10px]">
                      {currentTier}
                    </div>
                  )}
                </div>

                <p className="text-[11px] font-bold text-white truncate uppercase">{anime.title}</p>

                {/* Tier Selection Buttons */}
                <div className="grid grid-cols-5 gap-1">
                  {(['S', 'A', 'B', 'C', 'D'] as const).map((tierKey) => (
                    <button
                      key={tierKey}
                      onClick={() => handleAssignTier(anime.mal_id, tierKey)}
                      className={`py-1 text-[10px] font-black transition-all ${
                        currentTier === tierKey
                          ? 'bg-white text-black'
                          : 'bg-[#1A1A1A] hover:bg-white/20 text-white/70'
                      }`}
                    >
                      {tierKey}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
