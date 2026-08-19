import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Flame,
  Star,
  Tv,
  Calendar,
  Bookmark,
  Bot,
  Trophy,
  SlidersHorizontal,
  Compass,
  Filter,
  Search,
  Check,
  Plus,
  Play,
  TrendingUp,
  Volume2,
  ShieldCheck
} from 'lucide-react';
import { Anime, WatchlistItem, AppTheme, AdminUser } from './types';
import { CURATED_ANIME_LIST, GENRE_LIST } from './data/curatedAnime';
import { getTopAiringAnime, getPopularAnime, getSeasonalAnime, searchAnime } from './services/animeApi';
import { toggleLofiAtmosphere, playAnimeClickSound, playSuccessChime } from './utils/audioSynth';

import { Navbar } from './components/Navbar';
import { HeroBanner } from './components/HeroBanner';
import { AnimeCard } from './components/AnimeCard';
import { AnimeDetailModal } from './components/AnimeDetailModal';
import { TrailerModal } from './components/TrailerModal';
import { WatchlistTracker } from './components/WatchlistTracker';
import { ScheduleCalendar } from './components/ScheduleCalendar';
import { AIOtakuAssistant } from './components/AIOtakuAssistant';
import { AnimeTrivia } from './components/AnimeTrivia';
import { TierListMaker } from './components/TierListMaker';
import { AdminPanel } from './components/AdminPanel';
import { AdminLoginModal } from './components/AdminLoginModal';
import { Footer } from './components/Footer';

const AUTHORIZED_ADMIN_EMAIL = 'callmejodsenx@gmail.com';

export default function App() {
  const [currentTab, setCurrentTab] = useState<string>('discover');
  const [theme, setTheme] = useState<AppTheme>('cyberpunk');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedGenreId, setSelectedGenreId] = useState<number>(0);
  const [isLofiPlaying, setIsLofiPlaying] = useState<boolean>(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(false);

  // Deleted anime IDs persisted so API fetch won't resurrect deleted records
  const [deletedIds, setDeletedIds] = useState<number[]>(() => {
    try {
      const saved = localStorage.getItem('aniverse_deleted_ids');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [];
  });

  useEffect(() => {
    try {
      localStorage.setItem('aniverse_deleted_ids', JSON.stringify(deletedIds));
    } catch (e) {}
  }, [deletedIds]);

  // Current logged in User (Defaulted to null - all accounts signed out)
  const [currentUser, setCurrentUser] = useState<AdminUser | null>(() => {
    try {
      const saved = localStorage.getItem('aniverse_admin_user');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return null;
  });

  useEffect(() => {
    try {
      if (currentUser) {
        localStorage.setItem('aniverse_admin_user', JSON.stringify(currentUser));
      } else {
        localStorage.removeItem('aniverse_admin_user');
      }
    } catch (e) {}
  }, [currentUser]);

  // Anime datasets with LocalStorage persistence for Admin Uploads/Deletions
  const [popularAnime, setPopularAnime] = useState<Anime[]>(() => {
    try {
      const customSaved = localStorage.getItem('aniverse_custom_catalog');
      if (customSaved) {
        const parsed = JSON.parse(customSaved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return CURATED_ANIME_LIST;
  });

  const [topAiringAnime, setTopAiringAnime] = useState<Anime[]>([]);
  const [seasonalAnime, setSeasonalAnime] = useState<Anime[]>([]);
  const [searchResults, setSearchResults] = useState<Anime[]>([]);
  const [isLoadingAnime, setIsLoadingAnime] = useState<boolean>(false);

  // Sync custom catalog changes to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem('aniverse_custom_catalog', JSON.stringify(popularAnime));
    } catch (e) {}
  }, [popularAnime]);

  // Selected modals
  const [selectedAnime, setSelectedAnime] = useState<Anime | null>(null);
  const [trailerAnime, setTrailerAnime] = useState<Anime | null>(null);

  // Watchlist state with LocalStorage persistence
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>(() => {
    try {
      const saved = localStorage.getItem('aniverse_watchlist');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [
      {
        anime: CURATED_ANIME_LIST[0], // Frieren
        status: 'watching',
        currentEpisode: 18,
        totalEpisodes: 28,
        userScore: 10,
        notes: 'Absolute masterpiece. Madhouse excellence.',
        addedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isFavorite: true,
      },
      {
        anime: CURATED_ANIME_LIST[1], // Solo Leveling
        status: 'completed',
        currentEpisode: 12,
        totalEpisodes: 12,
        userScore: 9,
        notes: 'Shadow monarch awakening.',
        addedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isFavorite: true,
      },
    ];
  });

  useEffect(() => {
    try {
      localStorage.setItem('aniverse_watchlist', JSON.stringify(watchlist));
    } catch (e) {}
  }, [watchlist]);

  // Initial Fetch of real Anime from API (filtering out any deleted IDs)
  useEffect(() => {
    setIsLoadingAnime(true);
    Promise.all([
      getPopularAnime(),
      getTopAiringAnime(),
      getSeasonalAnime(),
    ])
      .then(([pop, air, seas]) => {
        // Saved custom uploaded anime from localStorage
        const customUploaded = popularAnime.filter(
          (a) => !CURATED_ANIME_LIST.some((c) => c.mal_id === a.mal_id) && !deletedIds.includes(a.mal_id)
        );

        if (pop && pop.length > 0) {
          const validApiPop = pop.filter((p) => !deletedIds.includes(p.mal_id));
          const merged = [
            ...customUploaded,
            ...validApiPop.filter((p) => !customUploaded.some((c) => c.mal_id === p.mal_id)),
          ];
          setPopularAnime(merged);
        }
        if (air && air.length > 0) {
          setTopAiringAnime(air.filter((a) => !deletedIds.includes(a.mal_id)));
        }
        if (seas && seas.length > 0) {
          setSeasonalAnime(seas.filter((s) => !deletedIds.includes(s.mal_id)));
        }
      })
      .finally(() => {
        setIsLoadingAnime(false);
      });
  }, []);

  // Debounced search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery.trim() || selectedGenreId > 0) {
        setIsLoadingAnime(true);
        // First filter local/uploaded anime
        const localMatches = popularAnime.filter((a) => {
          if (deletedIds.includes(a.mal_id)) return false;
          const matchesQuery = searchQuery.trim()
            ? a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
              (a.title_japanese && a.title_japanese.toLowerCase().includes(searchQuery.toLowerCase()))
            : true;
          const matchesGenre = selectedGenreId > 0
            ? a.genres?.some((g) => g.mal_id === selectedGenreId)
            : true;
          return matchesQuery && matchesGenre;
        });

        searchAnime(searchQuery, selectedGenreId)
          .then((res) => {
            const validRes = res.filter((r) => !deletedIds.includes(r.mal_id));
            const combined = [...localMatches, ...validRes.filter((r) => !localMatches.some((l) => l.mal_id === r.mal_id))];
            setSearchResults(combined);
          })
          .catch(() => {
            setSearchResults(localMatches);
          })
          .finally(() => {
            setIsLoadingAnime(false);
          });
      } else {
        setSearchResults([]);
      }
    }, 400);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, selectedGenreId, popularAnime, deletedIds]);

  // Admin Catalog Handlers
  const handleAddAnime = (newAnime: Anime) => {
    setPopularAnime((prev) => [newAnime, ...prev.filter((a) => a.mal_id !== newAnime.mal_id)]);
  };

  const handleUpdateAnime = (updatedAnime: Anime) => {
    setPopularAnime((prev) =>
      prev.map((a) => (a.mal_id === updatedAnime.mal_id ? updatedAnime : a))
    );
    if (selectedAnime?.mal_id === updatedAnime.mal_id) {
      setSelectedAnime(updatedAnime);
    }
  };

  const handleDeleteAnime = (malId: number) => {
    setDeletedIds((prev) => [...prev, malId]);
    setPopularAnime((prev) => prev.filter((a) => a.mal_id !== malId));
    setSeasonalAnime((prev) => prev.filter((a) => a.mal_id !== malId));
    setWatchlist((prev) => prev.filter((item) => item.anime.mal_id !== malId));
    if (selectedAnime?.mal_id === malId) {
      setSelectedAnime(null);
    }
  };

  const handleRestoreDefaults = () => {
    localStorage.removeItem('aniverse_custom_catalog');
    localStorage.removeItem('aniverse_deleted_ids');
    setDeletedIds([]);
    setPopularAnime(CURATED_ANIME_LIST);
  };

  const handleDirectAdminLogin = () => {
    const adminObj: AdminUser = {
      email: AUTHORIZED_ADMIN_EMAIL,
      name: 'Senx (Lead Administrator)',
      role: 'admin',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
      lastLogin: new Date().toISOString(),
    };
    setCurrentUser(adminObj);
    playSuccessChime();
  };

  const isInWatchlist = (mal_id: number) => {
    return watchlist.some((item) => item.anime.mal_id === mal_id);
  };

  const handleToggleWatchlist = (anime: Anime) => {
    playAnimeClickSound();
    setWatchlist((prev) => {
      const exists = prev.find((item) => item.anime.mal_id === anime.mal_id);
      if (exists) {
        return prev.filter((item) => item.anime.mal_id !== anime.mal_id);
      } else {
        const newItem: WatchlistItem = {
          anime,
          status: 'watching',
          currentEpisode: 1,
          totalEpisodes: anime.episodes || null,
          userScore: 0,
          notes: '',
          addedAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          isFavorite: false,
        };
        return [newItem, ...prev];
      }
    });
  };

  const handleUpdateWatchlistItem = (mal_id: number, updates: Partial<WatchlistItem>) => {
    setWatchlist((prev) =>
      prev.map((item) =>
        item.anime.mal_id === mal_id ? { ...item, ...updates, updatedAt: new Date().toISOString() } : item
      )
    );
  };

  const handleRemoveWatchlistItem = (mal_id: number) => {
    setWatchlist((prev) => prev.filter((item) => item.anime.mal_id !== mal_id));
  };

  const handleToggleLofi = () => {
    toggleLofiAtmosphere((playing) => setIsLofiPlaying(playing));
  };

  const displayedAnimeList =
    searchQuery.trim() || selectedGenreId > 0
      ? searchResults
      : currentTab === 'seasonal'
      ? seasonalAnime.length > 0 ? seasonalAnime : popularAnime
      : popularAnime;

  const featuredSpotlight = popularAnime.filter((a) => a.isFeatured);

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#F5F5F5] font-editorial-sans flex flex-col antialiased selection:bg-[#FF2D55] selection:text-white">
      {/* Top Navigation */}
      <Navbar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        theme={theme}
        onThemeChange={setTheme}
        isLofiPlaying={isLofiPlaying}
        onToggleLofi={handleToggleLofi}
        watchlistCount={watchlist.length}
        searchResults={searchResults}
        onSelectAnime={(anime) => setSelectedAnime(anime)}
        currentUser={currentUser}
        onOpenLogin={() => setIsLoginModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-8 lg:px-12 pt-8">
        {/* Tab 1: Discover & Main Catalog */}
        {currentTab === 'discover' && (
          <div className="space-y-12">
            {/* Hero Carousel Spotlight */}
            {!searchQuery && selectedGenreId === 0 && featuredSpotlight.length > 0 && (
              <HeroBanner
                featuredAnimeList={featuredSpotlight}
                onSelectAnime={(anime) => setSelectedAnime(anime)}
                onOpenTrailer={(anime) => setTrailerAnime(anime)}
                isInWatchlist={isInWatchlist}
                onToggleWatchlist={handleToggleWatchlist}
              />
            )}

            {/* Catalog Section Header & Genre Filter Bar */}
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div className="flex items-center gap-3">
                  <span className="w-2.5 h-2.5 bg-[#FF2D55]" />
                  <div>
                    <h2 className="text-xl sm:text-2xl font-editorial-serif font-black text-white uppercase tracking-tight italic">
                      {searchQuery
                        ? `Search Results // "${searchQuery}"`
                        : selectedGenreId > 0
                        ? `${GENRE_LIST.find((g) => g.id === selectedGenreId)?.name} Archive`
                        : 'Curated Catalog & Top Rated Archive'}
                    </h2>
                  </div>
                </div>

                {(searchQuery || selectedGenreId > 0) && (
                  <button
                    onClick={() => {
                      playAnimeClickSound();
                      setSearchQuery('');
                      setSelectedGenreId(0);
                    }}
                    className="text-[10px] font-black uppercase tracking-widest text-[#FF2D55] hover:text-white"
                  >
                    Clear Filter
                  </button>
                )}
              </div>

              {/* Genre Pills */}
              <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
                {GENRE_LIST.map((genre) => (
                  <button
                    key={genre.id}
                    id={`genre-pill-${genre.id}`}
                    onClick={() => {
                      playAnimeClickSound();
                      setSelectedGenreId(genre.id);
                    }}
                    className={`px-3.5 py-1.5 text-[10px] sm:text-xs font-bold uppercase tracking-widest transition-all whitespace-nowrap border ${
                      selectedGenreId === genre.id
                        ? 'bg-[#FF2D55] border-[#FF2D55] text-white'
                        : 'bg-[#121212] border-white/10 text-white/50 hover:text-white hover:border-white/30'
                    }`}
                  >
                    {genre.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Anime Cards Grid */}
            {isLoadingAnime ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 py-8">
                {Array.from({ length: 10 }).map((_, i) => (
                  <div
                    key={i}
                    className="aspect-[3/4] bg-[#121212] border border-white/10 animate-pulse"
                  />
                ))}
              </div>
            ) : displayedAnimeList.length === 0 ? (
              <div className="text-center py-16 px-4 border border-white/10 bg-[#0F0F0F] space-y-3">
                <Search className="w-8 h-8 text-white/20 mx-auto" />
                <h3 className="text-sm font-bold uppercase tracking-wider text-white">No Archive Records Found</h3>
                <p className="text-xs text-white/40">
                  Try adjusting your search criteria or resetting filters.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
                {displayedAnimeList.map((anime) => (
                  <AnimeCard
                    key={anime.mal_id}
                    anime={anime}
                    onSelectAnime={(a) => setSelectedAnime(a)}
                    onOpenTrailer={(a) => setTrailerAnime(a)}
                    isInWatchlist={isInWatchlist(anime.mal_id)}
                    onToggleWatchlist={handleToggleWatchlist}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Seasonal Anime */}
        {currentTab === 'seasonal' && (
          <div className="space-y-8 animate-in fade-in duration-300">
            <div className="p-6 sm:p-10 bg-[#0D0D0D] border border-white/10 shadow-2xl space-y-2">
              <div className="flex items-center gap-3">
                <span className="px-2 py-0.5 bg-[#FF2D55] text-white text-[9px] font-black uppercase tracking-widest">
                  WINTER / SPRING 2024–2025
                </span>
                <span className="text-[10px] uppercase font-bold tracking-widest text-white/40">
                  Simulcast Premieres
                </span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-editorial-serif font-black tracking-tighter italic text-white uppercase">
                Seasonal Anime Broadcasts
              </h2>
              <p className="text-xs text-white/60 max-w-xl uppercase tracking-wider font-medium">
                Premiering television broadcasts, original net animations, and seasonal anime releases.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
              {(seasonalAnime.length > 0 ? seasonalAnime : popularAnime).map((anime) => (
                <AnimeCard
                  key={anime.mal_id}
                  anime={anime}
                  onSelectAnime={(a) => setSelectedAnime(a)}
                  onOpenTrailer={(a) => setTrailerAnime(a)}
                  isInWatchlist={isInWatchlist(anime.mal_id)}
                  onToggleWatchlist={handleToggleWatchlist}
                />
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: Watchlist Tracker */}
        {currentTab === 'watchlist' && (
          <WatchlistTracker
            watchlist={watchlist}
            onUpdateItem={handleUpdateWatchlistItem}
            onRemoveItem={handleRemoveWatchlistItem}
            onSelectAnime={(a) => setSelectedAnime(a)}
            onExploreAnime={() => setCurrentTab('discover')}
          />
        )}

        {/* Tab 4: Schedule */}
        {currentTab === 'schedule' && <ScheduleCalendar />}

        {/* Tab 5: AI Otaku Assistant */}
        {currentTab === 'ai-assistant' && <AIOtakuAssistant />}

        {/* Tab 6: Trivia Quiz */}
        {currentTab === 'trivia' && <AnimeTrivia />}

        {/* Tab 7: Tier List Maker */}
        {currentTab === 'tierlist' && (
          <TierListMaker
            animeList={popularAnime}
            onSelectAnime={(a) => setSelectedAnime(a)}
          />
        )}

        {/* Tab 8: Admin Panel (Upload / Edit / Delete / Dashboard) */}
        {currentTab === 'admin' && (
          <AdminPanel
            currentUser={currentUser}
            animeList={popularAnime}
            watchlist={watchlist}
            onAddAnime={handleAddAnime}
            onUpdateAnime={handleUpdateAnime}
            onDeleteAnime={handleDeleteAnime}
            onRestoreDefaults={handleRestoreDefaults}
            onOpenLogin={() => setIsLoginModalOpen(true)}
            onSelectAnime={(a) => setSelectedAnime(a)}
            onDirectLogin={handleDirectAdminLogin}
          />
        )}
      </main>

      {/* Global Modals */}
      {selectedAnime && (
        <AnimeDetailModal
          anime={selectedAnime}
          onClose={() => setSelectedAnime(null)}
          isInWatchlist={isInWatchlist(selectedAnime.mal_id)}
          onToggleWatchlist={handleToggleWatchlist}
          onOpenTrailer={(a) => setTrailerAnime(a)}
        />
      )}

      {trailerAnime && (
        <TrailerModal
          anime={trailerAnime}
          onClose={() => setTrailerAnime(null)}
        />
      )}

      {/* Admin Login Authentication Modal */}
      <AdminLoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLoginSuccess={(user) => setCurrentUser(user)}
        currentUser={currentUser}
        onLogout={() => setCurrentUser(null)}
      />

      {/* Footer */}
      <Footer />
    </div>
  );
}
