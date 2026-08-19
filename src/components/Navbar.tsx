import React, { useState } from 'react';
import {
  Compass,
  Calendar,
  Bookmark,
  Bot,
  Trophy,
  SlidersHorizontal,
  Search,
  Music,
  Tv,
  X,
  Sparkles,
  ShieldCheck,
  UserCheck,
  LogIn
} from 'lucide-react';
import { AppTheme, Anime, AdminUser } from '../types';
import { playAnimeClickSound } from '../utils/audioSynth';

interface NavbarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  theme: AppTheme;
  onThemeChange: (t: AppTheme) => void;
  isLofiPlaying: boolean;
  onToggleLofi: () => void;
  watchlistCount: number;
  searchResults?: Anime[];
  onSelectAnime: (anime: Anime) => void;
  currentUser: AdminUser | null;
  onOpenLogin: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  searchQuery,
  onSearchChange,
  theme,
  onThemeChange,
  isLofiPlaying,
  onToggleLofi,
  watchlistCount,
  searchResults = [],
  onSelectAnime,
  currentUser,
  onOpenLogin,
}) => {
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isAdmin = currentUser?.email.toLowerCase() === 'callmejodsenx@gmail.com'.toLowerCase();

  const navItems = [
    { id: 'discover', label: 'Home', icon: Compass, badge: null },
    { id: 'seasonal', label: 'Seasonal', icon: Tv, badge: '2024' },
    { id: 'watchlist', label: 'Archive', icon: Bookmark, badge: watchlistCount > 0 ? watchlistCount : null },
    { id: 'schedule', label: 'Schedule', icon: Calendar, badge: null },
    { id: 'ai-assistant', label: 'Sensei AI', icon: Bot, badge: 'AI' },
    { id: 'trivia', label: 'Trivia', icon: Trophy, badge: null },
    { id: 'tierlist', label: 'Index / Tier', icon: SlidersHorizontal, badge: null },
    { id: 'admin', label: 'Admin Matrix', icon: ShieldCheck, badge: isAdmin ? 'ADMIN' : 'PORTAL' },
  ];

  const handleNavClick = (tabId: string) => {
    playAnimeClickSound();
    onSelectTab(tabId);
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-[#0A0A0A]/95 backdrop-blur-md border-b border-white/10 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-12">
        <div className="flex items-center justify-between h-20 gap-4">
          {/* Brand Logo - Editorial Style */}
          <div
            id="brand-logo"
            onClick={() => handleNavClick('discover')}
            className="flex items-center gap-3 cursor-pointer group select-none flex-shrink-0"
          >
            <div className="text-2xl sm:text-3xl font-black tracking-tighter italic font-editorial-serif text-white hover:text-[#FF2D55] transition-colors">
              AK<span className="text-[#FF2D55]">/</span>ANIME
            </div>
            <span className="hidden sm:inline-block text-[9px] uppercase tracking-[0.3em] font-bold text-white/30 pl-2 border-l border-white/10">
              VOL. 04 // EDITORIAL ARCHIVE
            </span>
          </div>

          {/* Search Bar - Editorial Minimalist */}
          <div className="relative flex-1 max-w-xs xl:max-w-sm hidden md:block">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/40 pointer-events-none" />
              <input
                id="main-search-input"
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  onSearchChange(e.target.value);
                  setShowSearchDropdown(true);
                }}
                onFocus={() => setShowSearchDropdown(true)}
                placeholder="SEARCH ARCHIVE..."
                className="w-full bg-[#141414] text-[11px] uppercase tracking-wider text-white placeholder-white/30 px-9 py-2.5 border border-white/10 focus:outline-none focus:border-[#FF2D55] transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => onSearchChange('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Autocomplete dropdown */}
            {showSearchDropdown && searchQuery.trim().length > 1 && searchResults.length > 0 && (
              <div className="absolute left-0 right-0 top-full mt-2 bg-[#121212] border border-white/10 shadow-2xl p-2 z-50 max-h-80 overflow-y-auto space-y-1">
                <div className="text-[9px] font-bold text-white/40 px-3 py-1 uppercase tracking-widest border-b border-white/5">
                  Curated Matches
                </div>
                {searchResults.slice(0, 5).map((anime) => (
                  <div
                    key={anime.mal_id}
                    onClick={() => {
                      onSelectAnime(anime);
                      setShowSearchDropdown(false);
                    }}
                    className="flex items-center gap-3 p-2 hover:bg-white/5 cursor-pointer transition-colors"
                  >
                    <img
                      src={anime.images.jpg.small_image_url || anime.images.jpg.image_url}
                      alt={anime.title}
                      className="w-9 h-12 object-cover border border-white/10 flex-shrink-0"
                      referrerPolicy="no-referrer"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-white truncate uppercase tracking-tight">{anime.title}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] text-[#FF2D55] font-bold">★ {anime.score || 'N/A'}</span>
                        <span className="text-[9px] text-white/30 uppercase tracking-widest">
                          {anime.episodes ? `${anime.episodes} EPS` : 'ONGOING'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Desktop Nav Links - Editorial Typography */}
          <nav className="hidden lg:flex items-center gap-6 xl:gap-8">
            {navItems.map((item) => {
              const isActive = currentTab === item.id;
              const isItemAdmin = item.id === 'admin';
              return (
                <button
                  key={item.id}
                  id={`nav-btn-${item.id}`}
                  onClick={() => handleNavClick(item.id)}
                  className={`text-xs font-bold uppercase tracking-widest transition-all relative py-1 flex items-center gap-1 ${
                    isActive
                      ? 'text-white border-b-2 border-[#FF2D55]'
                      : isItemAdmin && isAdmin
                      ? 'text-[#FF2D55] hover:text-white'
                      : 'text-white/50 hover:text-white'
                  }`}
                >
                  <span>{item.label}</span>
                  {item.badge && (
                    <span
                      className={`text-[8px] font-black px-1.5 py-0.2 tracking-tighter uppercase ${
                        isActive || (isItemAdmin && isAdmin)
                          ? 'bg-[#FF2D55] text-white'
                          : 'bg-white/10 text-white/60'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right Action Controls: Audio & Admin Login Status */}
          <div className="flex items-center gap-3 flex-shrink-0">
            {/* Lo-Fi Lounge player button */}
            <button
              id="lofi-toggle-button"
              onClick={() => {
                playAnimeClickSound();
                onToggleLofi();
              }}
              title="Toggle Editorial Lo-Fi Synth"
              className={`flex items-center gap-2 px-3 py-1.5 text-[10px] uppercase font-black tracking-widest border transition-all duration-300 ${
                isLofiPlaying
                  ? 'bg-[#FF2D55] border-[#FF2D55] text-white'
                  : 'bg-transparent border-white/20 text-white/60 hover:text-white hover:border-white/40'
              }`}
            >
              <Music className={`w-3 h-3 ${isLofiPlaying ? 'animate-bounce' : ''}`} />
              <span className="hidden sm:inline">{isLofiPlaying ? 'Audio // On' : 'Ambient // Audio'}</span>
            </button>

            {/* Login / Profile Trigger */}
            {currentUser ? (
              <button
                onClick={() => {
                  playAnimeClickSound();
                  onOpenLogin();
                }}
                className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 bg-[#141414] border border-[#FF2D55]/60 hover:border-[#FF2D55] text-white text-[10px] font-black uppercase tracking-wider transition-all"
                title={`Logged in as ${currentUser.email}`}
              >
                <div className="w-5 h-5 bg-[#FF2D55] text-white text-[9px] flex items-center justify-center font-bold">
                  {currentUser.name.slice(0, 1).toUpperCase()}
                </div>
                <span className="hidden xl:inline text-[#FF2D55]">ACCOUNT // ACTIVE</span>
              </button>
            ) : (
              <button
                onClick={() => {
                  playAnimeClickSound();
                  onOpenLogin();
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white text-black hover:bg-[#FF2D55] hover:text-white text-[10px] font-black uppercase tracking-widest transition-colors cursor-pointer"
                title="Login"
              >
                <LogIn className="w-3 h-3" />
                <span className="hidden sm:inline">Login</span>
              </button>
            )}

            {/* Mobile menu hamburger */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 bg-[#141414] border border-white/10 text-white hover:border-[#FF2D55]"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Compass className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {isMobileMenuOpen && (
        <div className="lg:hidden border-t border-white/10 bg-[#0A0A0A] px-6 pt-4 pb-8 space-y-3">
          {/* Mobile Search input */}
          <div className="relative mb-4">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/40" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="SEARCH ANIME ARCHIVE..."
              className="w-full bg-[#141414] text-xs uppercase tracking-wider text-white placeholder-white/30 pl-10 pr-4 py-2.5 border border-white/10 focus:outline-none focus:border-[#FF2D55]"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            {navItems.map((item) => {
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`flex items-center justify-between p-3 text-xs uppercase font-bold tracking-widest border transition-colors ${
                    isActive
                      ? 'bg-[#FF2D55] border-[#FF2D55] text-white'
                      : 'bg-[#141414] border-white/10 text-white/60 hover:text-white'
                  }`}
                >
                  <span className="truncate">{item.label}</span>
                  {item.badge && (
                    <span className="text-[8px] font-black px-1.5 py-0.5 bg-black/40 text-white">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="pt-2 border-t border-white/10 flex justify-between items-center">
            <span className="text-[10px] uppercase font-bold text-white/40">
              AkiAnime Portal
            </span>
            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                onOpenLogin();
              }}
              className="text-[10px] uppercase font-black text-[#FF2D55] hover:underline"
            >
              {currentUser ? 'Manage Account' : 'Login'}
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
