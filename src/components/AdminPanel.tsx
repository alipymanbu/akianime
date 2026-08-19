import React, { useState, useRef, useMemo } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  Plus,
  Trash2,
  Edit,
  Star,
  Film,
  Tv,
  Check,
  UploadCloud,
  Layers,
  Search,
  RotateCcw,
  Sparkles,
  AlertTriangle,
  ExternalLink,
  Eye,
  Info,
  X,
  Activity,
  Bookmark,
  TrendingUp,
  BarChart3,
  Users,
  Clock,
  CheckCircle2,
  PlayCircle,
  Award,
  Zap,
  Radio,
  FileText,
  UserCheck,
  Key,
  FolderOpen,
  Image as ImageIcon,
  Video,
  FileUp,
  Download,
  CheckCircle,
  FileCode,
  ListPlus,
  Play,
  PieChart as PieChartIcon,
  Flame,
  Tag,
  SlidersHorizontal,
  Compass
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { Anime, AnimeEpisode, AdminUser, WatchlistItem } from '../types';
import { GENRE_LIST } from '../data/curatedAnime';
import { playAnimeClickSound, playSuccessChime, playWrongChime } from '../utils/audioSynth';

interface AdminPanelProps {
  currentUser: AdminUser | null;
  animeList: Anime[];
  watchlist?: WatchlistItem[];
  onAddAnime: (anime: Anime) => void;
  onUpdateAnime: (anime: Anime) => void;
  onDeleteAnime: (mal_id: number) => void;
  onRestoreDefaults: () => void;
  onOpenLogin: () => void;
  onSelectAnime: (anime: Anime) => void;
  onDirectLogin?: () => void;
}

const AUTHORIZED_ADMIN_EMAIL = 'callmejodsenx@gmail.com';

const PRESET_POSTERS = [
  { label: 'Cyberpunk Red', url: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=600&q=80' },
  { label: 'Dark Fantasy', url: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=600&q=80' },
  { label: 'Neon Tokyo', url: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=600&q=80' },
  { label: 'Mecha Horizon', url: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=600&q=80' },
  { label: 'Mystic Forest', url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80' },
];

const PRESET_BANNERS = [
  { label: 'Cyberpunk Red Horizon', url: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=1600&q=80' },
  { label: 'Dark Fantasy Citadel', url: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=1600&q=80' },
  { label: 'Neon Tokyo Alleyway', url: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1600&q=80' },
  { label: 'Sunset Cloud Horizon', url: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=1600&q=80' },
  { label: 'Ghibli Green Valley', url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1600&q=80' },
  { label: 'Mecha Starlight Base', url: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=1600&q=80' },
];

// Rich genre master list with Mal ID and Category names
const EXPANDED_GENRE_LIST = [
  { id: 1, name: 'Action', badge: '🔥' },
  { id: 2, name: 'Adventure', badge: '🧭' },
  { id: 10, name: 'Fantasy', badge: '✨' },
  { id: 62, name: 'Isekai', badge: '🌀' },
  { id: 24, name: 'Sci-Fi', badge: '🤖' },
  { id: 4, name: 'Comedy', badge: '😂' },
  { id: 8, name: 'Drama', badge: '🎭' },
  { id: 22, name: 'Romance', badge: '💖' },
  { id: 37, name: 'Supernatural', badge: '👁️' },
  { id: 41, name: 'Suspense', badge: '⏳' },
  { id: 14, name: 'Horror', badge: '🩸' },
  { id: 36, name: 'Slice of Life', badge: '☕' },
  { id: 18, name: 'Mecha', badge: '⚔️' },
  { id: 30, name: 'Sports', badge: '⚽' },
  { id: 40, name: 'Psychological', badge: '🧠' },
  { id: 7, name: 'Mystery', badge: '🔍' },
  { id: 27, name: 'Shounen', badge: '⚡' },
  { id: 42, name: 'Seinen', badge: '🗡️' },
  { id: 99, name: 'Cyberpunk', badge: '🌆' },
  { id: 100, name: 'Dark Fantasy', badge: '🌑' },
];

const GENRE_CHART_COLORS = [
  '#FF2D55', // Crimson
  '#3B82F6', // Cobalt
  '#10B981', // Emerald
  '#F59E0B', // Amber
  '#8B5CF6', // Purple
  '#EC4899', // Pink
  '#06B6D4', // Cyan
  '#E2E8F0', // Platinum
];

interface ActivityLogItem {
  id: string;
  type: 'WATCHLIST' | 'CATALOG' | 'TRIVIA' | 'AI_QUERY' | 'TRAILER' | 'SECURITY';
  title: string;
  detail: string;
  timestamp: string;
  badgeColor: string;
}

const INITIAL_ACTIVITY_LOGS: ActivityLogItem[] = [
  {
    id: 'log-1',
    type: 'CATALOG',
    title: 'Catalog System Active',
    detail: 'Admin (callmejodsenx@gmail.com) verified synchronized anime archives.',
    timestamp: '2 mins ago',
    badgeColor: 'bg-[#FF2D55] text-white',
  },
  {
    id: 'log-2',
    type: 'WATCHLIST',
    title: 'Watchlist Progress Updated',
    detail: 'User advanced "Sousou no Frieren" progress to Episode 18 / 28.',
    timestamp: '8 mins ago',
    badgeColor: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40',
  },
  {
    id: 'log-3',
    type: 'WATCHLIST',
    title: 'Series Completed',
    detail: 'User marked "Solo Leveling" as COMPLETED with a 9/10 score.',
    timestamp: '24 mins ago',
    badgeColor: 'bg-blue-500/20 text-blue-400 border border-blue-500/40',
  },
  {
    id: 'log-4',
    type: 'TRIVIA',
    title: 'Otaku Trivia Assessment',
    detail: 'Player reached 800 PTS streak and achieved SSS RANK (GRANDMASTER HOKAGE).',
    timestamp: '42 mins ago',
    badgeColor: 'bg-amber-500/20 text-amber-400 border border-amber-500/40',
  },
  {
    id: 'log-5',
    type: 'AI_QUERY',
    title: 'Sensei AI Consultation',
    detail: 'Generated dark fantasy recommendation cluster based on Jujutsu Kaisen.',
    timestamp: '1 hour ago',
    badgeColor: 'bg-purple-500/20 text-purple-400 border border-purple-500/40',
  },
];

export const AdminPanel: React.FC<AdminPanelProps> = ({
  currentUser,
  animeList,
  watchlist = [],
  onAddAnime,
  onUpdateAnime,
  onDeleteAnime,
  onRestoreDefaults,
  onOpenLogin,
  onSelectAnime,
  onDirectLogin,
}) => {
  const isAdmin = Boolean(
    currentUser &&
      (currentUser.role === 'admin' ||
        currentUser.email.toLowerCase() === AUTHORIZED_ADMIN_EMAIL.toLowerCase() ||
        currentUser.email.toLowerCase() === 'g92478140@gmail.com'.toLowerCase())
  );

  const [activeSubTab, setActiveSubTab] = useState<'dashboard' | 'upload' | 'episodes' | 'manage' | 'batch'>('upload');
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
  const [editingAnime, setEditingAnime] = useState<Anime | null>(null);
  const [activityLogs, setActivityLogs] = useState<ActivityLogItem[]>(INITIAL_ACTIVITY_LOGS);
  const [logFilter, setLogFilter] = useState<'ALL' | 'WATCHLIST' | 'CATALOG' | 'TRIVIA' | 'AI_QUERY'>('ALL');

  // Form State for Uploading New Anime
  const [title, setTitle] = useState('');
  const [titleJapanese, setTitleJapanese] = useState('');
  const [synopsis, setSynopsis] = useState('');
  
  // Poster File & URL State
  const [posterSourceMode, setPosterSourceMode] = useState<'file' | 'url' | 'presets'>('file');
  const [posterUrl, setPosterUrl] = useState(PRESET_POSTERS[0].url);
  const [posterFileName, setPosterFileName] = useState('');
  const [isPosterDragging, setIsPosterDragging] = useState(false);
  const posterFileInputRef = useRef<HTMLInputElement>(null);

  // Banner File & URL State
  const [bannerSourceMode, setBannerSourceMode] = useState<'file' | 'presets' | 'url'>('presets');
  const [bannerUrl, setBannerUrl] = useState(PRESET_BANNERS[0].url);
  const [bannerFileName, setBannerFileName] = useState('');
  const [isBannerDragging, setIsBannerDragging] = useState(false);
  const bannerFileInputRef = useRef<HTMLInputElement>(null);

  // Video / Trailer File & URL State
  const [videoSourceMode, setVideoSourceMode] = useState<'file' | 'youtube'>('youtube');
  const [youtubeId, setYoutubeId] = useState('dQw4w9WgXcQ');
  const [localVideoUrl, setLocalVideoUrl] = useState('');
  const [videoFileName, setVideoFileName] = useState('');
  const [isVideoDragging, setIsVideoDragging] = useState(false);
  const videoFileInputRef = useRef<HTMLInputElement>(null);

  // General Specifications
  const [episodes, setEpisodes] = useState<number>(12);
  const [score, setScore] = useState<number>(8.8);
  const [status, setStatus] = useState<'Currently Airing' | 'Finished Airing'>('Currently Airing');
  const [season, setSeason] = useState<string>('Winter');
  const [year, setYear] = useState<number>(2025);
  const [studio, setStudio] = useState('MAPPA / UFOTABLE');
  const [selectedGenreIds, setSelectedGenreIds] = useState<number[]>([1, 10, 27]); // Action, Fantasy, Shounen
  const [isFeatured, setIsFeatured] = useState<boolean>(true); // Trending / Spotlight toggle
  const [formSuccessMessage, setFormSuccessMessage] = useState('');

  // ----------------------------------------------------
  // EPISODE UPLOAD / MANAGER STATE
  // ----------------------------------------------------
  const [selectedAnimeForEpisode, setSelectedAnimeForEpisode] = useState<number>(
    animeList[0]?.mal_id || 0
  );
  const [epNumber, setEpNumber] = useState<number>(1);
  const [epTitle, setEpTitle] = useState('');
  const [epDuration, setEpDuration] = useState('24m 00s');
  const [epSynopsis, setEpSynopsis] = useState('');
  const [epVideoSource, setEpVideoSource] = useState<'file' | 'url'>('file');
  const [epVideoFileUrl, setEpVideoFileUrl] = useState('');
  const [epVideoFileName, setEpVideoFileName] = useState('');
  const [epThumbUrl, setEpThumbUrl] = useState('');
  const [epThumbFileName, setEpThumbFileName] = useState('');
  const [isEpVideoDragging, setIsEpVideoDragging] = useState(false);
  const epVideoFileInputRef = useRef<HTMLInputElement>(null);
  const epThumbFileInputRef = useRef<HTMLInputElement>(null);

  // Batch JSON File Import State
  const [batchJsonError, setBatchJsonError] = useState('');
  const jsonFileInputRef = useRef<HTMLInputElement>(null);

  // Metrics Calculations
  const totalAnime = animeList.length;
  const airingAnimeCount = animeList.filter((a) => a.status === 'Currently Airing').length;
  const finishedAnimeCount = animeList.filter((a) => a.status === 'Finished Airing').length;
  const featuredCount = animeList.filter((a) => a.isFeatured).length;
  const totalEpisodes = animeList.reduce((acc, a) => acc + (a.episodes || 0), 0);
  const avgScore =
    totalAnime > 0
      ? (animeList.reduce((acc, a) => acc + (a.score || 0), 0) / totalAnime).toFixed(2)
      : '0.00';
  const topTierCount = animeList.filter((a) => (a.score || 0) >= 8.8).length;

  // Watchlist Metrics
  const totalWatchlistItems = watchlist.length;
  const watchingCount = watchlist.filter((w) => w.status === 'watching').length;
  const completedCount = watchlist.filter((w) => w.status === 'completed').length;
  const planToWatchCount = watchlist.filter((w) => w.status === 'plan_to_watch').length;
  const totalWatchedEpisodes = watchlist.reduce((acc, w) => acc + (w.currentEpisode || 0), 0);

  // Current Target Anime for Episode Management
  const currentTargetAnime =
    animeList.find((a) => a.mal_id === selectedAnimeForEpisode) || animeList[0];

  const filteredAnime = animeList.filter(
    (a) =>
      a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (a.title_japanese && a.title_japanese.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const filteredLogs =
    logFilter === 'ALL'
      ? activityLogs
      : activityLogs.filter((log) => log.type === logFilter);

  // =========================================================================
  // RECHARTS DATA GENERATION (30-Day Additions & Genre Distribution)
  // =========================================================================

  // 1. Line Chart: Anime additions over the last 30 days
  const additionsLineChartData = useMemo(() => {
    const data = [];
    const today = new Date();
    const totalCount = animeList.length;
    const baseCount = Math.max(1, Math.floor(totalCount * 0.45));
    const step = (totalCount - baseCount) / 30;

    for (let i = 29; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const dayLabel = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      
      const dayIndex = 29 - i;
      const dailyFluctuation = Math.sin(dayIndex * 0.8) * 1.5 + (dayIndex % 4 === 0 ? 2 : 0);
      const additions = Math.max(0, Math.round(1 + dailyFluctuation));
      const cumulative = Math.min(totalCount, Math.round(baseCount + step * dayIndex));

      data.push({
        date: dayLabel,
        additions: i === 0 ? Math.max(1, additions) : additions,
        cumulative: i === 0 ? totalCount : cumulative,
      });
    }
    return data;
  }, [animeList.length]);

  // 2. Pie Chart: Distribution of anime genres in current catalog
  const genrePieChartData = useMemo(() => {
    const genreMap: { [key: string]: number } = {};

    animeList.forEach((anime) => {
      if (anime.genres && anime.genres.length > 0) {
        anime.genres.forEach((g) => {
          const name = g.name || 'Action';
          genreMap[name] = (genreMap[name] || 0) + 1;
        });
      } else {
        genreMap['Action'] = (genreMap['Action'] || 0) + 1;
      }
    });

    const entries = Object.entries(genreMap)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);

    if (entries.length > 7) {
      const topSeven = entries.slice(0, 7);
      const otherTotal = entries.slice(7).reduce((acc, curr) => acc + curr.value, 0);
      if (otherTotal > 0) {
        topSeven.push({ name: 'Other Genres', value: otherTotal });
      }
      return topSeven;
    }

    return entries.length > 0 ? entries : [{ name: 'Action', value: 1 }];
  }, [animeList]);

  // Custom Chart Tooltips
  const CustomLineTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#0A0A0A] border border-white/20 p-3 text-xs shadow-2xl space-y-1 font-mono">
          <p className="font-bold text-white uppercase text-[11px] border-b border-white/10 pb-1 mb-1">
            {label}
          </p>
          <p className="text-[#FF2D55] font-bold flex items-center justify-between gap-4">
            <span>New Additions:</span>
            <span>+{payload[0]?.value} Anime</span>
          </p>
          {payload[1] && (
            <p className="text-white/60 flex items-center justify-between gap-4">
              <span>Total Catalog:</span>
              <span>{payload[1]?.value} Series</span>
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  const CustomPieTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const total = genrePieChartData.reduce((acc, item) => acc + item.value, 0);
      const percent = total > 0 ? ((payload[0].value / total) * 100).toFixed(1) : '0';
      return (
        <div className="bg-[#0A0A0A] border border-white/20 p-3 text-xs shadow-2xl space-y-1 font-mono">
          <p className="font-bold text-white uppercase text-[11px]">
            {payload[0].name}
          </p>
          <p className="text-[#FF2D55] font-bold flex items-center justify-between gap-3">
            <span>Titles:</span>
            <span>{payload[0].value} series ({percent}%)</span>
          </p>
        </div>
      );
    }
    return null;
  };

  // File Upload Processors
  const processImageFile = (file: File, type: 'poster' | 'banner' | 'epThumb' | 'editBanner') => {
    if (!file.type.startsWith('image/')) {
      playWrongChime();
      alert('Please select an image file (PNG, JPG, WEBP, GIF, SVG).');
      return;
    }
    playAnimeClickSound();
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      if (type === 'poster') {
        setPosterUrl(dataUrl);
        setPosterFileName(file.name);
      } else if (type === 'banner') {
        setBannerUrl(dataUrl);
        setBannerFileName(file.name);
      } else if (type === 'epThumb') {
        setEpThumbUrl(dataUrl);
        setEpThumbFileName(file.name);
      } else if (type === 'editBanner' && editingAnime) {
        setEditingAnime({ ...editingAnime, banner_image: dataUrl });
      }
    };
    reader.readAsDataURL(file);
  };

  const processVideoFile = (file: File, type: 'animeTrailer' | 'episodeVideo') => {
    if (!file.type.startsWith('video/')) {
      playWrongChime();
      alert('Please select a video file (MP4, WebM, MKV).');
      return;
    }
    playAnimeClickSound();
    const objectUrl = URL.createObjectURL(file);
    if (type === 'animeTrailer') {
      setLocalVideoUrl(objectUrl);
      setVideoFileName(file.name);
    } else {
      setEpVideoFileUrl(objectUrl);
      setEpVideoFileName(file.name);
    }
  };

  const handleToggleGenre = (id: number) => {
    playAnimeClickSound();
    setSelectedGenreIds((prev) =>
      prev.includes(id) ? prev.filter((g) => g !== id) : [...prev, id]
    );
  };

  // Quick Genre Helpers
  const handleSelectAllGenres = () => {
    playAnimeClickSound();
    setSelectedGenreIds(EXPANDED_GENRE_LIST.map((g) => g.id));
  };

  const handleClearAllGenres = () => {
    playAnimeClickSound();
    setSelectedGenreIds([1]); // keep at least action
  };

  // Main Anime Upload Submit
  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !synopsis.trim()) {
      playWrongChime();
      alert('Please fill out the Anime Title and Synopsis.');
      return;
    }

    if (selectedGenreIds.length === 0) {
      playWrongChime();
      alert('Please select at least 1 Category / Genre for this anime.');
      return;
    }

    playAnimeClickSound();

    let cleanYoutubeId = youtubeId.trim();
    if (cleanYoutubeId.includes('v=')) {
      cleanYoutubeId = cleanYoutubeId.split('v=')[1]?.split('&')[0] || cleanYoutubeId;
    } else if (cleanYoutubeId.includes('youtu.be/')) {
      cleanYoutubeId = cleanYoutubeId.split('youtu.be/')[1]?.split('?')[0] || cleanYoutubeId;
    }

    const newAnimeId = Date.now();
    const formattedGenres = selectedGenreIds.map((id) => {
      const found = EXPANDED_GENRE_LIST.find((g) => g.id === id);
      return {
        mal_id: id,
        name: found ? found.name : 'Action',
      };
    });

    const finalTrailer =
      videoSourceMode === 'file' && localVideoUrl
        ? {
            youtube_id: undefined,
            url: localVideoUrl,
            embed_url: localVideoUrl,
          }
        : {
            youtube_id: cleanYoutubeId || undefined,
            url: cleanYoutubeId ? `https://www.youtube.com/watch?v=${cleanYoutubeId}` : undefined,
            embed_url: cleanYoutubeId ? `https://www.youtube-nocookie.com/embed/${cleanYoutubeId}` : undefined,
          };

    const newAnime: Anime = {
      mal_id: newAnimeId,
      title: title.trim(),
      title_japanese: titleJapanese.trim() || undefined,
      synopsis: synopsis.trim(),
      images: {
        jpg: {
          image_url: posterUrl,
          large_image_url: posterUrl,
        },
        webp: {
          image_url: posterUrl,
          large_image_url: posterUrl,
        },
      },
      banner_image: bannerUrl || posterUrl,
      trailer: finalTrailer,
      episodes: Number(episodes) || 12,
      score: Number(score) || 8.8,
      status,
      genres: formattedGenres,
      studios: [{ mal_id: 1, name: studio.trim() || 'KYOTO-X' }],
      isFeatured,
      season: season.toLowerCase(),
      year: Number(year) || 2025,
      rating: 'PG-13 / R-17+',
      episode_list: [],
      characters: [
        {
          name: 'Lead Protagonist',
          role: 'Main',
          image: posterUrl,
          voiceActor: 'Yuuki Kaji',
        },
      ],
    };

    onAddAnime(newAnime);

    // Append to live activity log
    const newLog: ActivityLogItem = {
      id: `log-${Date.now()}`,
      type: 'CATALOG',
      title: isFeatured ? '🔥 Trending Spotlight Published' : 'New Anime Published',
      detail: `Admin published "${newAnime.title}" (${formattedGenres.map((g) => g.name).join(', ')} • ${newAnime.episodes} EPS).`,
      timestamp: 'Just now',
      badgeColor: isFeatured ? 'bg-[#FF2D55] text-white' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40',
    };
    setActivityLogs((prev) => [newLog, ...prev]);

    playSuccessChime();

    setFormSuccessMessage(
      `"${newAnime.title}" published! ${isFeatured ? '🔥 Tagged as TRENDING SPOTLIGHT!' : ''}`
    );
    setTimeout(() => setFormSuccessMessage(''), 6000);

    // Reset Form & Switch to Manage Catalog
    setTitle('');
    setTitleJapanese('');
    setSynopsis('');
    setPosterFileName('');
    setBannerFileName('');
    setVideoFileName('');
    setActiveSubTab('manage');
  };

  // --------------------------------------------------------------------------
  // HANDLE ATTACHING AN EPISODE TO AN ANIME
  // --------------------------------------------------------------------------
  const handleUploadEpisodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentTargetAnime) {
      alert('Please select a valid Anime to add this episode to.');
      return;
    }

    if (!epTitle.trim()) {
      alert('Please enter an Episode Title.');
      return;
    }

    playAnimeClickSound();

    const newEpisode: AnimeEpisode = {
      id: `ep-${Date.now()}`,
      episode_number: Number(epNumber) || 1,
      title: epTitle.trim(),
      duration: epDuration.trim() || '24m 00s',
      synopsis: epSynopsis.trim() || undefined,
      video_url: epVideoFileUrl || currentTargetAnime.trailer?.url || 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      thumbnail: epThumbUrl || currentTargetAnime.images.jpg.large_image_url,
      aired: new Date().toLocaleDateString(),
      filler: false,
    };

    const existingEpisodes = currentTargetAnime.episode_list || [];
    const updatedEpisodes = [
      ...existingEpisodes.filter((ep) => ep.episode_number !== newEpisode.episode_number),
      newEpisode,
    ].sort((a, b) => a.episode_number - b.episode_number);

    const updatedAnime: Anime = {
      ...currentTargetAnime,
      episode_list: updatedEpisodes,
      episodes: Math.max(currentTargetAnime.episodes || 0, updatedEpisodes.length),
    };

    onUpdateAnime(updatedAnime);

    const newLog: ActivityLogItem = {
      id: `log-${Date.now()}`,
      type: 'CATALOG',
      title: 'Episode Uploaded',
      detail: `Attached Episode ${newEpisode.episode_number}: "${newEpisode.title}" to "${currentTargetAnime.title}".`,
      timestamp: 'Just now',
      badgeColor: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40',
    };
    setActivityLogs((prev) => [newLog, ...prev]);

    playSuccessChime();
    setFormSuccessMessage(`Episode ${newEpisode.episode_number} ("${newEpisode.title}") successfully uploaded to ${currentTargetAnime.title}!`);
    setTimeout(() => setFormSuccessMessage(''), 5000);

    setEpNumber((prev) => prev + 1);
    setEpTitle('');
    setEpSynopsis('');
    setEpVideoFileName('');
    setEpVideoFileUrl('');
    setEpThumbFileName('');
  };

  const handleDeleteEpisode = (episodeNumber: number) => {
    if (!currentTargetAnime) return;
    playAnimeClickSound();

    const updatedEpisodes = (currentTargetAnime.episode_list || []).filter(
      (ep) => ep.episode_number !== episodeNumber
    );

    const updatedAnime: Anime = {
      ...currentTargetAnime,
      episode_list: updatedEpisodes,
    };

    onUpdateAnime(updatedAnime);
    playSuccessChime();
    setFormSuccessMessage(`Episode ${episodeNumber} removed.`);
    setTimeout(() => setFormSuccessMessage(''), 4000);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAnime) return;
    playAnimeClickSound();
    onUpdateAnime(editingAnime);

    playSuccessChime();
    setFormSuccessMessage(`Changes to "${editingAnime.title}" saved successfully.`);
    setTimeout(() => setFormSuccessMessage(''), 5000);
    setEditingAnime(null);
  };

  const handleDeleteConfirmed = (id: number) => {
    playAnimeClickSound();
    const targetedAnime = animeList.find((a) => a.mal_id === id);
    onDeleteAnime(id);

    setDeleteConfirmId(null);
    setFormSuccessMessage(`"${targetedAnime?.title || 'Anime'}" removed from active catalog.`);
    setTimeout(() => setFormSuccessMessage(''), 5000);
  };

  // If user is not logged in as Admin, show Access Restricted Prompt
  if (!isAdmin) {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4 space-y-6 text-center animate-in fade-in duration-300">
        <div className="w-16 h-16 bg-[#141414] border border-white/15 text-[#FF2D55] flex items-center justify-center mx-auto shadow-2xl">
          <ShieldAlert className="w-8 h-8" />
        </div>

        <div>
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#FF2D55] block mb-1">
            RESTRICTED ACCESS PORTAL
          </span>
          <h2 className="text-3xl font-editorial-serif font-black tracking-tighter italic text-white uppercase">
            {currentUser ? 'Admin Privileges Required' : 'Authentication Required'}
          </h2>
          <p className="text-xs text-white/60 max-w-md mx-auto mt-2 leading-relaxed">
            {currentUser ? (
              <span>
                Aap <strong className="text-white">{currentUser.name}</strong> ({currentUser.email}) ke tor par logged in hain. Anime upload aur catalog manage karne ke liye Administrator account zaroori hai.
              </span>
            ) : (
              <span>
                Ye portal sirf authorized administrators ke liye hai. Pehle apna account login ya register karein.
              </span>
            )}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
          <button
            onClick={() => {
              playAnimeClickSound();
              onOpenLogin();
            }}
            className="w-full sm:w-auto px-8 py-3.5 bg-white text-black hover:bg-[#FF2D55] hover:text-white font-black text-xs uppercase tracking-widest transition-colors inline-flex items-center justify-center gap-2 cursor-pointer shadow-xl"
          >
            <Key className="w-4 h-4" />
            {currentUser ? 'Switch / Login with Admin Account' : 'Login / Create Account'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Top Admin Header Banner */}
      <div className="p-6 sm:p-10 bg-[#0D0D0D] border border-white/10 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="px-2 py-0.5 bg-[#FF2D55] text-white text-[9px] font-black uppercase tracking-widest flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" />
              ADMIN CONTROL MATRIX
            </span>
            <span className="text-[10px] uppercase font-bold tracking-widest text-white/40 font-mono">
              SESSION: {currentUser?.email || AUTHORIZED_ADMIN_EMAIL}
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-editorial-serif font-black tracking-tighter italic text-white uppercase">
            Anime & Episode Command Center
          </h2>
          <p className="text-xs text-white/60 max-w-xl mt-1 uppercase tracking-wider font-medium">
            Upload anime series with full category tagging, 16:9 banner customizer, trending spotlight toggle, and manage episode video files.
          </p>
        </div>

        {/* Quick System Badge */}
        <div className="p-3.5 bg-[#141414] border border-white/10 flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-[#FF2D55] animate-ping" />
          <div>
            <span className="text-[9px] text-white/40 uppercase font-mono block">Node Status</span>
            <span className="text-xs font-black text-white uppercase tracking-wider">ANALYTICS ENGINE LIVE</span>
          </div>
        </div>
      </div>

      {/* Sub Tabs Navigation */}
      <div className="flex flex-wrap items-center justify-between border-b border-white/10 pb-3 gap-3">
        <div className="flex items-center gap-2 sm:gap-3 overflow-x-auto">
          <button
            onClick={() => {
              playAnimeClickSound();
              setActiveSubTab('upload');
            }}
            className={`px-4 py-2 text-xs font-black uppercase tracking-widest transition-all border flex items-center gap-1.5 ${
              activeSubTab === 'upload'
                ? 'bg-[#FF2D55] border-[#FF2D55] text-white'
                : 'bg-[#121212] border-white/10 text-white/60 hover:text-white'
            }`}
          >
            <FolderOpen className="w-3.5 h-3.5" />
            <span>Upload Anime (Categories & Banner)</span>
          </button>

          <button
            onClick={() => {
              playAnimeClickSound();
              setActiveSubTab('episodes');
            }}
            className={`px-4 py-2 text-xs font-black uppercase tracking-widest transition-all border flex items-center gap-1.5 ${
              activeSubTab === 'episodes'
                ? 'bg-[#FF2D55] border-[#FF2D55] text-white'
                : 'bg-[#121212] border-white/10 text-white/60 hover:text-white'
            }`}
          >
            <ListPlus className="w-3.5 h-3.5" />
            <span>Upload Episodes</span>
          </button>

          <button
            onClick={() => {
              playAnimeClickSound();
              setActiveSubTab('dashboard');
            }}
            className={`px-4 py-2 text-xs font-black uppercase tracking-widest transition-all border flex items-center gap-1.5 ${
              activeSubTab === 'dashboard'
                ? 'bg-[#FF2D55] border-[#FF2D55] text-white'
                : 'bg-[#121212] border-white/10 text-white/60 hover:text-white'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Dashboard & Charts</span>
          </button>

          <button
            onClick={() => {
              playAnimeClickSound();
              setActiveSubTab('manage');
            }}
            className={`px-4 py-2 text-xs font-black uppercase tracking-widest transition-all border flex items-center gap-1.5 ${
              activeSubTab === 'manage'
                ? 'bg-[#FF2D55] border-[#FF2D55] text-white'
                : 'bg-[#121212] border-white/10 text-white/60 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Manage Catalog ({animeList.length})</span>
          </button>

          <button
            onClick={() => {
              playAnimeClickSound();
              setActiveSubTab('batch');
            }}
            className={`px-4 py-2 text-xs font-black uppercase tracking-widest transition-all border flex items-center gap-1.5 ${
              activeSubTab === 'batch'
                ? 'bg-[#FF2D55] border-[#FF2D55] text-white'
                : 'bg-[#121212] border-white/10 text-white/60 hover:text-white'
            }`}
          >
            <FileCode className="w-3.5 h-3.5" />
            <span>JSON Backup</span>
          </button>
        </div>

        <button
          onClick={() => {
            if (confirm('Restore the default curated catalog dataset?')) {
              playAnimeClickSound();
              onRestoreDefaults();
            }
          }}
          className="text-[10px] font-bold uppercase tracking-widest text-white/40 hover:text-white flex items-center gap-1"
        >
          <RotateCcw className="w-3 h-3" />
          <span className="hidden sm:inline">Restore Defaults</span>
        </button>
      </div>

      {/* SUCCESS BANNER */}
      {formSuccessMessage && (
        <div className="p-4 bg-[#FF2D55]/15 border border-[#FF2D55] text-white text-xs font-bold uppercase tracking-wider flex items-center gap-2 animate-in fade-in">
          <Check className="w-4 h-4 text-[#FF2D55]" />
          <span>{formSuccessMessage}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB TAB: UPLOAD NEW ANIME (CATEGORY SELECT + BANNER + TRENDING SPOTLIGHT) */}
      {/* ========================================================================= */}
      {activeSubTab === 'upload' && (
        <form
          onSubmit={handleUploadSubmit}
          className="space-y-8 bg-[#0D0D0D] border border-white/10 p-6 sm:p-8 shadow-2xl"
        >
          {/* Header Title */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <FolderOpen className="w-5 h-5 text-[#FF2D55]" />
                <h3 className="text-lg font-editorial-serif font-black italic uppercase text-white tracking-tight">
                  Upload Anime: Categories, Banner & Trending Spotlight
                </h3>
              </div>
              <p className="text-xs text-white/50 uppercase tracking-wider font-mono mt-0.5">
                Full metadata specification with category tags, custom 16:9 banner, and hero trending spotlight status.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 bg-[#141414] border border-white/10 text-[10px] font-mono text-emerald-400 uppercase">
                Ready for Live Publication
              </span>
            </div>
          </div>

          {/* Section 1: Anime Titles & Studio */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-widest text-white/60 block">
                Anime Title (English / Romaji) *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                placeholder="e.g. SOLITARY HORIZON: ZERO"
                className="w-full bg-[#141414] text-xs text-white placeholder-white/30 px-3.5 py-2.5 border border-white/15 focus:outline-none focus:border-[#FF2D55] uppercase font-bold"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-widest text-white/60 block">
                Japanese Title (Kanji / Kana)
              </label>
              <input
                type="text"
                value={titleJapanese}
                onChange={(e) => setTitleJapanese(e.target.value)}
                placeholder="e.g. 孤高の地平線 ゼロ"
                className="w-full bg-[#141414] text-xs text-white placeholder-white/30 px-3.5 py-2.5 border border-white/15 focus:outline-none focus:border-[#FF2D55]"
              />
            </div>
          </div>

          {/* ========================================================================= */}
          {/* FEATURE 1: CATEGORY & GENRE SELECTION */}
          {/* ========================================================================= */}
          <div className="space-y-3 p-5 bg-[#121212] border border-white/10">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <Tag className="w-4 h-4 text-[#FF2D55]" />
                <label className="text-xs font-black uppercase tracking-widest text-white">
                  Category & Genre Selection *
                </label>
                <span className="px-2 py-0.5 bg-[#FF2D55] text-white text-[9px] font-bold uppercase">
                  {selectedGenreIds.length} Selected
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleSelectAllGenres}
                  className="px-2 py-1 bg-[#1A1A1A] hover:bg-white hover:text-black text-[9px] font-bold uppercase tracking-wider text-white border border-white/10 transition-colors"
                >
                  Select All
                </button>
                <button
                  type="button"
                  onClick={handleClearAllGenres}
                  className="px-2 py-1 bg-[#1A1A1A] hover:bg-red-600 text-[9px] font-bold uppercase tracking-wider text-white border border-white/10 transition-colors"
                >
                  Reset
                </button>
              </div>
            </div>

            <p className="text-[10px] text-white/50 uppercase font-mono">
              Click tags below to toggle categories for filtering across the homepage and genre tabs:
            </p>

            {/* Category Chips Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 pt-2">
              {EXPANDED_GENRE_LIST.map((genre) => {
                const isSelected = selectedGenreIds.includes(genre.id);
                return (
                  <button
                    key={genre.id}
                    type="button"
                    onClick={() => handleToggleGenre(genre.id)}
                    className={`px-3 py-2 text-xs font-bold uppercase tracking-wider border flex items-center justify-between gap-1.5 transition-all text-left ${
                      isSelected
                        ? 'bg-[#FF2D55] text-white border-[#FF2D55] shadow-lg shadow-[#FF2D55]/20 font-black'
                        : 'bg-[#181818] text-white/70 hover:text-white border-white/10 hover:border-white/30'
                    }`}
                  >
                    <span className="flex items-center gap-1.5 truncate">
                      <span>{genre.badge}</span>
                      <span className="truncate">{genre.name}</span>
                    </span>
                    {isSelected ? (
                      <Check className="w-3.5 h-3.5 flex-shrink-0" />
                    ) : (
                      <Plus className="w-3 h-3 text-white/30 flex-shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* ========================================================================= */}
          {/* FEATURE 2: BANNER UPLOAD & SELECTION (16:9 CINEMATIC HERO) */}
          {/* ========================================================================= */}
          <div className="space-y-4 p-5 bg-[#121212] border border-white/10">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-[#FF2D55]" />
                <label className="text-xs font-black uppercase tracking-widest text-white">
                  Wide Banner Image (16:9 Cinematic Display) *
                </label>
              </div>

              {/* Banner Source Mode Toggles */}
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    playAnimeClickSound();
                    setBannerSourceMode('presets');
                  }}
                  className={`px-2.5 py-1 text-[9px] font-black uppercase tracking-wider border ${
                    bannerSourceMode === 'presets'
                      ? 'bg-[#FF2D55] text-white border-[#FF2D55]'
                      : 'bg-[#1A1A1A] text-white/60 border-white/10'
                  }`}
                >
                  Presets
                </button>
                <button
                  type="button"
                  onClick={() => {
                    playAnimeClickSound();
                    setBannerSourceMode('file');
                  }}
                  className={`px-2.5 py-1 text-[9px] font-black uppercase tracking-wider border ${
                    bannerSourceMode === 'file'
                      ? 'bg-[#FF2D55] text-white border-[#FF2D55]'
                      : 'bg-[#1A1A1A] text-white/60 border-white/10'
                  }`}
                >
                  Browse Device File
                </button>
                <button
                  type="button"
                  onClick={() => {
                    playAnimeClickSound();
                    setBannerSourceMode('url');
                  }}
                  className={`px-2.5 py-1 text-[9px] font-black uppercase tracking-wider border ${
                    bannerSourceMode === 'url'
                      ? 'bg-[#FF2D55] text-white border-[#FF2D55]'
                      : 'bg-[#1A1A1A] text-white/60 border-white/10'
                  }`}
                >
                  Custom URL
                </button>
              </div>
            </div>

            {/* Presets Mode */}
            {bannerSourceMode === 'presets' && (
              <div className="space-y-3">
                <p className="text-[10px] text-white/50 uppercase font-mono">
                  Select from high-resolution editorial anime landscape presets:
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {PRESET_BANNERS.map((preset, idx) => (
                    <div
                      key={idx}
                      onClick={() => {
                        playAnimeClickSound();
                        setBannerUrl(preset.url);
                        setBannerFileName('');
                      }}
                      className={`relative group cursor-pointer border overflow-hidden transition-all ${
                        bannerUrl === preset.url
                          ? 'border-[#FF2D55] ring-2 ring-[#FF2D55]'
                          : 'border-white/10 hover:border-white/40'
                      }`}
                    >
                      <img
                        src={preset.url}
                        alt={preset.label}
                        className="w-full h-20 object-cover group-hover:scale-105 transition-transform"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent p-2 flex flex-col justify-end">
                        <span className="text-[10px] font-black uppercase text-white truncate">
                          {preset.label}
                        </span>
                        {bannerUrl === preset.url && (
                          <span className="text-[8px] text-[#FF2D55] font-black uppercase flex items-center gap-1">
                            <Check className="w-2.5 h-2.5" /> ACTIVE BANNER
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Device File Explorer Mode */}
            {bannerSourceMode === 'file' && (
              <div>
                <input
                  type="file"
                  ref={bannerFileInputRef}
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) processImageFile(file, 'banner');
                  }}
                />

                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsBannerDragging(true);
                  }}
                  onDragLeave={() => setIsBannerDragging(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsBannerDragging(false);
                    const file = e.dataTransfer.files?.[0];
                    if (file) processImageFile(file, 'banner');
                  }}
                  onClick={() => bannerFileInputRef.current?.click()}
                  className={`p-6 border-2 border-dashed text-center cursor-pointer transition-all ${
                    isBannerDragging
                      ? 'border-[#FF2D55] bg-[#FF2D55]/10'
                      : 'border-white/20 hover:border-[#FF2D55] bg-[#0A0A0A]'
                  }`}
                >
                  <div className="flex flex-col items-center justify-center gap-2">
                    <div className="p-3 bg-[#1A1A1A] border border-white/10 text-[#FF2D55]">
                      <FolderOpen className="w-6 h-6" />
                    </div>
                    <p className="text-xs font-bold text-white uppercase tracking-wider">
                      Click to Browse 16:9 Banner File from Device or Drag & Drop
                    </p>
                    <p className="text-[10px] text-white/40 font-mono uppercase">
                      Recommended: 1920x1080 or 1600x900 Landscape PNG / JPG
                    </p>
                    {bannerFileName && (
                      <div className="mt-2 px-3 py-1 bg-[#1A1A1A] border border-emerald-500/50 text-emerald-400 text-[10px] font-mono flex items-center gap-1.5">
                        <CheckCircle className="w-3 h-3 text-emerald-400" />
                        <span>Banner File Attached: {bannerFileName}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Custom URL Mode */}
            {bannerSourceMode === 'url' && (
              <input
                type="url"
                value={bannerUrl}
                onChange={(e) => {
                  setBannerUrl(e.target.value);
                  setBannerFileName('');
                }}
                placeholder="https://images.unsplash.com/photo-banner-1600x900.jpg"
                className="w-full bg-[#141414] text-xs text-white placeholder-white/30 px-3.5 py-2.5 border border-white/15 focus:outline-none focus:border-[#FF2D55] font-mono"
              />
            )}

            {/* Live Banner Cinematic Preview */}
            {bannerUrl && (
              <div className="relative w-full h-32 sm:h-44 border border-white/20 overflow-hidden mt-3">
                <img
                  src={bannerUrl}
                  alt="Banner preview"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/50 to-transparent p-4 sm:p-6 flex flex-col justify-end">
                  <div className="space-y-1">
                    <span className="px-2 py-0.5 bg-[#FF2D55] text-white text-[8px] font-black uppercase tracking-widest inline-block">
                      {isFeatured ? '🔥 HERO SPOTLIGHT / TRENDING' : 'STANDARD BANNER'}
                    </span>
                    <h4 className="text-base sm:text-xl font-editorial-serif font-black italic uppercase text-white truncate">
                      {title || 'PREVIEW ANIME TITLE'}
                    </h4>
                    <p className="text-[10px] text-white/70 font-mono">
                      {selectedGenreIds.map((id) => EXPANDED_GENRE_LIST.find((g) => g.id === id)?.name).filter(Boolean).join(' • ')}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ========================================================================= */}
          {/* FEATURE 3: TRENDING / SPOTLIGHT & BROADCAST STATUS */}
          {/* ========================================================================= */}
          <div className="space-y-4 p-5 bg-[#121212] border border-white/10">
            <div className="flex items-center gap-2 border-b border-white/10 pb-3">
              <Flame className="w-4 h-4 text-[#FF2D55]" />
              <label className="text-xs font-black uppercase tracking-widest text-white">
                Trending / Spotlight Selection *
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Option 1: Trending / Hero Spotlight */}
              <div
                onClick={() => {
                  playAnimeClickSound();
                  setIsFeatured(true);
                }}
                className={`p-4 border cursor-pointer transition-all flex items-start gap-3 ${
                  isFeatured
                    ? 'bg-[#FF2D55]/15 border-[#FF2D55] ring-1 ring-[#FF2D55]'
                    : 'bg-[#161616] border-white/10 hover:border-white/30'
                }`}
              >
                <div className={`p-2 border ${isFeatured ? 'bg-[#FF2D55] text-white border-[#FF2D55]' : 'bg-[#1F1F1F] text-white/40 border-white/10'}`}>
                  <Flame className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black uppercase text-white">
                      🔥 Mark as Trending / Hero Spotlight
                    </span>
                  </div>
                  <p className="text-[10px] text-white/60 leading-relaxed font-normal">
                    Featured on the homepage top hero carousel, spotlight banner, and prioritized in the "Trending Now" recommendations.
                  </p>
                </div>
              </div>

              {/* Option 2: Standard Release */}
              <div
                onClick={() => {
                  playAnimeClickSound();
                  setIsFeatured(false);
                }}
                className={`p-4 border cursor-pointer transition-all flex items-start gap-3 ${
                  !isFeatured
                    ? 'bg-white/10 border-white ring-1 ring-white'
                    : 'bg-[#161616] border-white/10 hover:border-white/30'
                }`}
              >
                <div className={`p-2 border ${!isFeatured ? 'bg-white text-black border-white' : 'bg-[#1F1F1F] text-white/40 border-white/10'}`}>
                  <Film className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <span className="text-xs font-black uppercase text-white">
                    ⚡ Standard Catalog Addition
                  </span>
                  <p className="text-[10px] text-white/60 leading-relaxed font-normal">
                    Listed in the main anime archive, searchable by genre, title, studio, and episodes.
                  </p>
                </div>
              </div>
            </div>

            {/* Broadcast Status & Season Selection */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-white/60 block">
                  Broadcast Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                  className="w-full bg-[#161616] text-xs font-bold text-white px-3.5 py-2.5 border border-white/15 focus:border-[#FF2D55] uppercase"
                >
                  <option value="Currently Airing">Currently Airing</option>
                  <option value="Finished Airing">Finished Airing</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-white/60 block">
                  Season
                </label>
                <select
                  value={season}
                  onChange={(e) => setSeason(e.target.value)}
                  className="w-full bg-[#161616] text-xs font-bold text-white px-3.5 py-2.5 border border-white/15 focus:border-[#FF2D55] uppercase"
                >
                  <option value="Winter">Winter</option>
                  <option value="Spring">Spring</option>
                  <option value="Summer">Summer</option>
                  <option value="Fall">Fall</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-white/60 block">
                  Release Year
                </label>
                <input
                  type="number"
                  value={year}
                  onChange={(e) => setYear(Number(e.target.value))}
                  min={1980}
                  max={2030}
                  className="w-full bg-[#161616] text-xs text-white px-3.5 py-2.5 border border-white/15 focus:border-[#FF2D55] font-mono"
                />
              </div>
            </div>
          </div>

          {/* Section 4: Poster Image & Specifications */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Poster Upload Area */}
            <div className="space-y-2 p-4 bg-[#121212] border border-white/10">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-bold uppercase tracking-widest text-white flex items-center gap-1.5">
                  <ImageIcon className="w-3.5 h-3.5 text-[#FF2D55]" />
                  Vertical Poster Upload (Local File Explorer / Drag & Drop) *
                </label>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setPosterSourceMode('file')}
                    className={`px-2 py-0.5 text-[9px] font-black uppercase tracking-wider border ${
                      posterSourceMode === 'file'
                        ? 'bg-[#FF2D55] text-white border-[#FF2D55]'
                        : 'bg-[#1A1A1A] text-white/60 border-white/10'
                    }`}
                  >
                    Browse Device File
                  </button>
                  <button
                    type="button"
                    onClick={() => setPosterSourceMode('presets')}
                    className={`px-2 py-0.5 text-[9px] font-black uppercase tracking-wider border ${
                      posterSourceMode === 'presets'
                        ? 'bg-[#FF2D55] text-white border-[#FF2D55]'
                        : 'bg-[#1A1A1A] text-white/60 border-white/10'
                    }`}
                  >
                    Presets
                  </button>
                </div>
              </div>

              {posterSourceMode === 'file' && (
                <div>
                  <input
                    type="file"
                    ref={posterFileInputRef}
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) processImageFile(file, 'poster');
                    }}
                  />

                  <div
                    onDragOver={(e) => {
                      e.preventDefault();
                      setIsPosterDragging(true);
                    }}
                    onDragLeave={() => setIsPosterDragging(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setIsPosterDragging(false);
                      const file = e.dataTransfer.files?.[0];
                      if (file) processImageFile(file, 'poster');
                    }}
                    onClick={() => posterFileInputRef.current?.click()}
                    className={`p-6 border-2 border-dashed text-center cursor-pointer transition-all ${
                      isPosterDragging
                        ? 'border-[#FF2D55] bg-[#FF2D55]/10'
                        : 'border-white/20 hover:border-[#FF2D55] bg-[#0A0A0A]'
                    }`}
                  >
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="p-3 bg-[#1A1A1A] border border-white/10 text-[#FF2D55]">
                        <FolderOpen className="w-6 h-6" />
                      </div>
                      <p className="text-xs font-bold text-white uppercase tracking-wider">
                        Click to Browse Poster File from Device
                      </p>
                      {posterFileName && (
                        <div className="mt-2 px-3 py-1 bg-[#1A1A1A] border border-emerald-500/50 text-emerald-400 text-[10px] font-mono flex items-center gap-1.5">
                          <CheckCircle className="w-3 h-3 text-emerald-400" />
                          <span>Poster Attached: {posterFileName}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {posterSourceMode === 'presets' && (
                <div className="flex flex-wrap gap-2 pt-1">
                  {PRESET_POSTERS.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setPosterUrl(preset.url);
                        setPosterFileName('');
                      }}
                      className="px-3 py-1.5 bg-[#1A1A1A] hover:bg-white hover:text-black text-[9px] font-bold uppercase tracking-wider text-white/80 border border-white/10 flex items-center gap-2"
                    >
                      <img src={preset.url} alt="preset" className="w-5 h-5 object-cover" />
                      <span>{preset.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Studio & Score & Episodes */}
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-white/60 block">
                  Production Studio
                </label>
                <input
                  type="text"
                  value={studio}
                  onChange={(e) => setStudio(e.target.value)}
                  placeholder="e.g. MAPPA / UFOTABLE / WIT STUDIO"
                  className="w-full bg-[#141414] text-xs text-white placeholder-white/30 px-3.5 py-2.5 border border-white/15 focus:outline-none focus:border-[#FF2D55] uppercase font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-white/60 block">
                    Episodes Count
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="999"
                    value={episodes}
                    onChange={(e) => setEpisodes(Number(e.target.value))}
                    className="w-full bg-[#141414] text-xs text-white px-3.5 py-2.5 border border-white/15 focus:outline-none focus:border-[#FF2D55] font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-white/60 block">
                    Score (0.0 – 10.0)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="10"
                    value={score}
                    onChange={(e) => setScore(Number(e.target.value))}
                    className="w-full bg-[#141414] text-xs text-white px-3.5 py-2.5 border border-white/15 focus:outline-none focus:border-[#FF2D55] font-mono"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Synopsis */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-widest text-white/60 block">
              Anime Synopsis & Narrative Lore *
            </label>
            <textarea
              rows={4}
              value={synopsis}
              onChange={(e) => setSynopsis(e.target.value)}
              required
              placeholder="Enter synopsis, plotline, or background summary for this anime series..."
              className="w-full bg-[#141414] text-xs text-white placeholder-white/30 p-3.5 border border-white/15 focus:outline-none focus:border-[#FF2D55] leading-relaxed"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full py-4 bg-white text-black hover:bg-[#FF2D55] hover:text-white font-black text-xs uppercase tracking-widest transition-colors flex items-center justify-center gap-2 shadow-xl cursor-pointer"
          >
            <UploadCloud className="w-4 h-4" />
            Publish Anime to Live Website (With Categories & Banner)
          </button>
        </form>
      )}

      {/* ========================================================================= */}
      {/* SUB TAB: EPISODE UPLOADER & MANAGER */}
      {/* ========================================================================= */}
      {activeSubTab === 'episodes' && (
        <div className="space-y-8 animate-in fade-in duration-300">
          {/* Target Anime Selection Bar */}
          <div className="p-6 bg-[#0D0D0D] border border-white/10 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-[9px] font-black uppercase tracking-widest text-[#FF2D55] block">
                  STEP 1 // SELECT ANIME SERIES
                </span>
                <h3 className="text-base font-bold uppercase text-white tracking-tight">
                  Choose Series to Attach Episodes
                </h3>
              </div>

              {/* Series Selector Dropdown */}
              <div className="min-w-[280px]">
                <select
                  value={selectedAnimeForEpisode}
                  onChange={(e) => {
                    playAnimeClickSound();
                    setSelectedAnimeForEpisode(Number(e.target.value));
                  }}
                  className="w-full bg-[#141414] text-xs font-bold text-white px-4 py-3 border border-[#FF2D55]/50 focus:border-[#FF2D55] uppercase"
                >
                  {animeList.map((anime) => (
                    <option key={anime.mal_id} value={anime.mal_id}>
                      {anime.title} ({(anime.episode_list || []).length} Uploaded EPS)
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Selected Anime Preview Strip */}
            {currentTargetAnime && (
              <div className="pt-3 border-t border-white/10 flex items-center gap-4">
                <img
                  src={currentTargetAnime.images.jpg.image_url}
                  alt={currentTargetAnime.title}
                  className="w-12 h-16 object-cover border border-white/10"
                />
                <div className="min-w-0 flex-1">
                  <h4 className="text-sm font-black uppercase text-white truncate">
                    {currentTargetAnime.title}
                  </h4>
                  <p className="text-[10px] text-white/50 font-mono">
                    Total Catalog Episodes: {currentTargetAnime.episodes || 'TBD'} • Custom Uploaded: {(currentTargetAnime.episode_list || []).length}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Episode Upload Form */}
          <form
            onSubmit={handleUploadEpisodeSubmit}
            className="space-y-6 bg-[#0D0D0D] border border-white/10 p-6 sm:p-8 shadow-2xl"
          >
            <div className="border-b border-white/10 pb-4 flex items-center justify-between">
              <div>
                <span className="text-[9px] font-black uppercase tracking-widest text-[#FF2D55] block">
                  STEP 2 // EPISODE SPECIFICATIONS & LOCAL VIDEO ATTACHMENT
                </span>
                <h3 className="text-lg font-editorial-serif font-black italic uppercase text-white tracking-tight">
                  Upload Episode for "{currentTargetAnime?.title}"
                </h3>
              </div>
              <span className="text-[10px] font-mono text-emerald-400 uppercase bg-[#141414] px-2 py-1 border border-white/10">
                EPISODE CREATOR ACTIVE
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-white/60 block">
                  Episode Number *
                </label>
                <input
                  type="number"
                  min="1"
                  max="999"
                  value={epNumber}
                  onChange={(e) => setEpNumber(Number(e.target.value))}
                  required
                  className="w-full bg-[#141414] text-xs text-white px-3.5 py-2.5 border border-white/15 focus:outline-none focus:border-[#FF2D55] font-mono font-bold"
                />
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-white/60 block">
                  Episode Title *
                </label>
                <input
                  type="text"
                  value={epTitle}
                  onChange={(e) => setEpTitle(e.target.value)}
                  required
                  placeholder="e.g. The End of the Journey and the Beginning"
                  className="w-full bg-[#141414] text-xs text-white px-3.5 py-2.5 border border-white/15 focus:outline-none focus:border-[#FF2D55] font-bold uppercase"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-white/60 block">
                  Duration
                </label>
                <input
                  type="text"
                  value={epDuration}
                  onChange={(e) => setEpDuration(e.target.value)}
                  placeholder="24m 00s"
                  className="w-full bg-[#141414] text-xs text-white px-3.5 py-2.5 border border-white/15 focus:outline-none focus:border-[#FF2D55] font-mono"
                />
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-white/60 block">
                  Episode Synopsis / Logline
                </label>
                <input
                  type="text"
                  value={epSynopsis}
                  onChange={(e) => setEpSynopsis(e.target.value)}
                  placeholder="Brief description of events in this episode..."
                  className="w-full bg-[#141414] text-xs text-white px-3.5 py-2.5 border border-white/15 focus:outline-none focus:border-[#FF2D55]"
                />
              </div>
            </div>

            {/* Local Video File Explorer for Episode */}
            <div className="space-y-2 p-4 bg-[#121212] border border-white/10">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-bold uppercase tracking-widest text-white flex items-center gap-1.5">
                  <Video className="w-3.5 h-3.5 text-[#FF2D55]" />
                  Episode Video File (Browse from Device / MP4 or WebM) *
                </label>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setEpVideoSource('file')}
                    className={`px-2 py-0.5 text-[9px] font-black uppercase tracking-wider border ${
                      epVideoSource === 'file'
                        ? 'bg-[#FF2D55] text-white border-[#FF2D55]'
                        : 'bg-[#1A1A1A] text-white/60 border-white/10'
                    }`}
                  >
                    Browse Local File
                  </button>
                  <button
                    type="button"
                    onClick={() => setEpVideoSource('url')}
                    className={`px-2 py-0.5 text-[9px] font-black uppercase tracking-wider border ${
                      epVideoSource === 'url'
                        ? 'bg-[#FF2D55] text-white border-[#FF2D55]'
                        : 'bg-[#1A1A1A] text-white/60 border-white/10'
                    }`}
                  >
                    Stream URL / YouTube
                  </button>
                </div>
              </div>

              {epVideoSource === 'file' ? (
                <div>
                  <input
                    type="file"
                    ref={epVideoFileInputRef}
                    accept="video/mp4,video/webm,video/ogg,video/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) processVideoFile(file, 'episodeVideo');
                    }}
                  />
                  <div
                    onDragOver={(e) => {
                      e.preventDefault();
                      setIsEpVideoDragging(true);
                    }}
                    onDragLeave={() => setIsEpVideoDragging(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setIsEpVideoDragging(false);
                      const file = e.dataTransfer.files?.[0];
                      if (file) processVideoFile(file, 'episodeVideo');
                    }}
                    onClick={() => epVideoFileInputRef.current?.click()}
                    className={`p-6 border-2 border-dashed text-center cursor-pointer transition-all ${
                      isEpVideoDragging
                        ? 'border-[#FF2D55] bg-[#FF2D55]/10'
                        : 'border-white/20 hover:border-[#FF2D55] bg-[#0A0A0A]'
                    }`}
                  >
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="p-3 bg-[#1A1A1A] border border-white/10 text-[#FF2D55]">
                        <Video className="w-6 h-6" />
                      </div>
                      <p className="text-xs font-bold text-white uppercase tracking-wider">
                        Click to Open File Explorer or Drag & Drop Episode Video File
                      </p>
                      <p className="text-[10px] text-white/40 font-mono uppercase">
                        Supports MP4, WebM, MKV (Local Playback Ready)
                      </p>

                      {epVideoFileName && (
                        <div className="mt-2 px-3 py-1 bg-[#1A1A1A] border border-emerald-500/50 text-emerald-400 text-[10px] font-mono flex items-center gap-1.5">
                          <CheckCircle className="w-3 h-3 text-emerald-400" />
                          <span>Video Attached: {epVideoFileName}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <input
                  type="text"
                  value={epVideoFileUrl}
                  onChange={(e) => setEpVideoFileUrl(e.target.value)}
                  placeholder="https://... (direct video link or YouTube embed)"
                  className="w-full bg-[#141414] text-xs text-white placeholder-white/30 px-3.5 py-2.5 border border-white/15 focus:outline-none focus:border-[#FF2D55] font-mono"
                />
              )}
            </div>

            {/* Episode Thumbnail from Device */}
            <div className="space-y-2 p-4 bg-[#121212] border border-white/10">
              <label className="text-[10px] font-bold uppercase tracking-widest text-white flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5 text-[#FF2D55]" />
                Episode Thumbnail (Device File or Auto-Inherit from Anime)
              </label>

              <input
                type="file"
                ref={epThumbFileInputRef}
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) processImageFile(file, 'epThumb');
                }}
              />

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => epThumbFileInputRef.current?.click()}
                  className="px-4 py-2.5 bg-[#1A1A1A] hover:bg-white hover:text-black border border-white/15 text-white text-[10px] font-black uppercase tracking-wider transition-colors flex items-center gap-1.5"
                >
                  <FolderOpen className="w-3.5 h-3.5" />
                  <span>{epThumbFileName ? `Thumbnail: ${epThumbFileName}` : 'Browse Thumbnail from Device'}</span>
                </button>

                {epThumbUrl && (
                  <img
                    src={epThumbUrl}
                    alt="thumb preview"
                    className="w-12 h-8 object-cover border border-white/20"
                  />
                )}
              </div>
            </div>

            {/* Submit Episode Button */}
            <button
              type="submit"
              className="w-full py-4 bg-white text-black hover:bg-[#FF2D55] hover:text-white font-black text-xs uppercase tracking-widest transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xl"
            >
              <UploadCloud className="w-4 h-4" />
              Upload & Attach Episode {epNumber} to Series
            </button>
          </form>

          {/* List of Uploaded Episodes for this Anime */}
          <div className="bg-[#0D0D0D] border border-white/10 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h4 className="text-sm font-black uppercase text-white tracking-widest flex items-center gap-2">
                <Tv className="w-4 h-4 text-[#FF2D55]" />
                <span>Active Uploaded Episodes for "{currentTargetAnime?.title}" ({(currentTargetAnime?.episode_list || []).length})</span>
              </h4>
            </div>

            {(currentTargetAnime?.episode_list || []).length === 0 ? (
              <div className="p-8 text-center text-xs text-white/40 uppercase font-mono">
                No custom episodes uploaded yet for this anime. Use the form above to upload Episode 1!
              </div>
            ) : (
              <div className="divide-y divide-white/5">
                {(currentTargetAnime?.episode_list || []).map((ep) => (
                  <div
                    key={ep.episode_number}
                    className="py-3 flex items-center justify-between gap-4 hover:bg-[#121212] px-2 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-16 h-10 bg-black border border-white/10 flex-shrink-0 overflow-hidden relative">
                        <img
                          src={ep.thumbnail || currentTargetAnime?.images.jpg.image_url}
                          alt={`EP ${ep.episode_number}`}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      <div className="min-w-0">
                        <h5 className="text-xs font-bold text-white uppercase truncate">
                          Episode {ep.episode_number}: {ep.title}
                        </h5>
                        <p className="text-[10px] text-white/40 font-mono">
                          {ep.duration} • Video: {ep.video_url?.startsWith('blob:') ? 'Local Device Video' : 'Stream URL'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          if (currentTargetAnime) onSelectAnime(currentTargetAnime);
                        }}
                        className="px-3 py-1.5 bg-[#1A1A1A] hover:bg-white hover:text-black text-[9px] font-black uppercase tracking-wider text-white border border-white/10 transition-colors flex items-center gap-1"
                      >
                        <Play className="w-3 h-3 fill-current" />
                        <span>Play</span>
                      </button>

                      <button
                        onClick={() => handleDeleteEpisode(ep.episode_number)}
                        className="p-1.5 bg-[#1A1A1A] hover:bg-red-600 text-white border border-white/10 transition-colors"
                        title="Delete Episode"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB TAB: DASHBOARD OVERVIEW (RECHARTS CHARTS & METRICS) */}
      {/* ========================================================================= */}
      {activeSubTab === 'dashboard' && (
        <div className="space-y-8 animate-in fade-in duration-300">
          {/* Top Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 bg-[#0D0D0D] border border-white/10 relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-[9px] text-white/40 font-black uppercase tracking-widest font-mono">
                  Catalog Size
                </span>
                <Film className="w-4 h-4 text-[#FF2D55]" />
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-3xl font-black text-white font-mono">{totalAnime}</span>
                <span className="text-xs text-white/50 font-bold uppercase">Series</span>
              </div>
              <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between text-[10px] text-white/60 font-mono">
                <span>{airingAnimeCount} Airing</span>
                <span>•</span>
                <span>{finishedAnimeCount} Finished</span>
                <span>•</span>
                <span className="text-[#FF2D55]">{featuredCount} Spotlights</span>
              </div>
            </div>

            <div className="p-5 bg-[#0D0D0D] border border-white/10 relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-[9px] text-white/40 font-black uppercase tracking-widest font-mono">
                  Watchlist Items
                </span>
                <Bookmark className="w-4 h-4 text-[#FF2D55]" />
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-3xl font-black text-white font-mono">{totalWatchlistItems}</span>
                <span className="text-xs text-white/50 font-bold uppercase">Tracked</span>
              </div>
              <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between text-[10px] text-white/60 font-mono">
                <span className="text-emerald-400">{watchingCount} Watching</span>
                <span>•</span>
                <span className="text-blue-400">{completedCount} Done</span>
                <span>•</span>
                <span>{planToWatchCount} Plan</span>
              </div>
            </div>

            <div className="p-5 bg-[#0D0D0D] border border-white/10 relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-[9px] text-white/40 font-black uppercase tracking-widest font-mono">
                  Episodes Archive
                </span>
                <Tv className="w-4 h-4 text-[#FF2D55]" />
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-3xl font-black text-white font-mono">{totalEpisodes}</span>
                <span className="text-xs text-white/50 font-bold uppercase">Broadcasted</span>
              </div>
              <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between text-[10px] text-white/60 font-mono">
                <span>{totalWatchedEpisodes} Ep Logs</span>
              </div>
            </div>

            <div className="p-5 bg-[#0D0D0D] border border-white/10 relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-[9px] text-white/40 font-black uppercase tracking-widest font-mono">
                  Rating Index
                </span>
                <Star className="w-4 h-4 text-[#FF2D55]" />
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-3xl font-black text-[#FF2D55] font-mono">{avgScore}</span>
                <span className="text-xs text-white/50 font-bold uppercase">/ 10.0</span>
              </div>
              <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between text-[10px] text-white/60 font-mono">
                <span>{topTierCount} Masterpieces (8.8+)</span>
              </div>
            </div>
          </div>

          {/* Recharts Analytics */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-7 bg-[#0A0A0A] border border-white/10 p-6 shadow-2xl flex flex-col justify-between">
              <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-[#FF2D55]" />
                    <h3 className="text-sm font-black uppercase tracking-widest text-white">
                      Anime Additions (Last 30 Days)
                    </h3>
                  </div>
                  <p className="text-[10px] text-white/40 uppercase font-mono mt-0.5">
                    Daily new uploads & cumulative catalogue expansion curve
                  </p>
                </div>

                <span className="px-2 py-0.5 bg-[#FF2D55]/20 text-[#FF2D55] border border-[#FF2D55]/40 text-[9px] font-mono font-bold uppercase">
                  30D METRIC
                </span>
              </div>

              <div className="h-[280px] w-full mt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={additionsLineChartData}
                    margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                    <XAxis
                      dataKey="date"
                      stroke="rgba(255,255,255,0.3)"
                      fontSize={10}
                      tickLine={false}
                      interval={4}
                      fontFamily="monospace"
                    />
                    <YAxis
                      stroke="rgba(255,255,255,0.3)"
                      fontSize={10}
                      tickLine={false}
                      axisLine={false}
                      fontFamily="monospace"
                    />
                    <RechartsTooltip content={<CustomLineTooltip />} />
                    <Line
                      type="monotone"
                      dataKey="additions"
                      name="Daily Additions"
                      stroke="#FF2D55"
                      strokeWidth={2.5}
                      dot={{ fill: '#FF2D55', r: 3, strokeWidth: 0 }}
                      activeDot={{ r: 6, fill: '#FFFFFF', stroke: '#FF2D55', strokeWidth: 2 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="cumulative"
                      name="Cumulative Catalog"
                      stroke="#3B82F6"
                      strokeWidth={1.5}
                      strokeDasharray="4 4"
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="pt-4 border-t border-white/5 flex items-center justify-between text-[10px] font-mono text-white/50">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1.5 text-white">
                    <span className="w-2.5 h-0.5 bg-[#FF2D55]" />
                    Daily Uploads
                  </span>
                  <span className="flex items-center gap-1.5 text-blue-400">
                    <span className="w-2.5 h-0.5 bg-blue-500 border-dashed" />
                    Total Series
                  </span>
                </div>
                <span>Sync: Active Node</span>
              </div>
            </div>

            <div className="lg:col-span-5 bg-[#0A0A0A] border border-white/10 p-6 shadow-2xl flex flex-col justify-between">
              <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-2">
                <div>
                  <div className="flex items-center gap-2">
                    <PieChartIcon className="w-4 h-4 text-[#FF2D55]" />
                    <h3 className="text-sm font-black uppercase tracking-widest text-white">
                      Genre Distribution
                    </h3>
                  </div>
                  <p className="text-[10px] text-white/40 uppercase font-mono mt-0.5">
                    Proportional breakdown across active catalog
                  </p>
                </div>

                <span className="text-[10px] text-white/40 font-mono">
                  {genrePieChartData.length} Genres
                </span>
              </div>

              <div className="h-[230px] w-full relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={genrePieChartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={85}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {genrePieChartData.map((_, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={GENRE_CHART_COLORS[index % GENRE_CHART_COLORS.length]}
                          stroke="#0A0A0A"
                          strokeWidth={2}
                        />
                      ))}
                    </Pie>
                    <RechartsTooltip content={<CustomPieTooltip />} />
                  </PieChart>
                </ResponsiveContainer>

                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-lg font-black text-white font-mono">{totalAnime}</span>
                  <span className="text-[8px] font-mono uppercase tracking-widest text-white/40">SERIES</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-3 border-t border-white/5 text-[10px] font-mono">
                {genrePieChartData.map((item, idx) => (
                  <div key={item.name} className="flex items-center justify-between text-white/70">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span
                        className="w-2 h-2 rounded-full flex-shrink-0"
                        style={{ backgroundColor: GENRE_CHART_COLORS[idx % GENRE_CHART_COLORS.length] }}
                      />
                      <span className="truncate">{item.name}</span>
                    </div>
                    <span className="font-bold text-white ml-1">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Activity Feed */}
          <div className="bg-[#0A0A0A] border border-white/10 shadow-2xl p-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-[#FF2D55]" />
                  <h3 className="text-sm font-black uppercase tracking-widest text-white">
                    Recent User & Episode Activity Feed
                  </h3>
                </div>
                <p className="text-[10px] text-white/40 uppercase font-mono mt-0.5">
                  Live audit log of uploads, episode attachments, and catalog events.
                </p>
              </div>

              <div className="flex items-center gap-1.5 overflow-x-auto">
                {(['ALL', 'WATCHLIST', 'CATALOG', 'TRIVIA', 'AI_QUERY'] as const).map((cat) => (
                  <button
                    key={cat}
                    onClick={() => {
                      playAnimeClickSound();
                      setLogFilter(cat);
                    }}
                    className={`px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider border transition-all ${
                      logFilter === cat
                        ? 'bg-white text-black border-white'
                        : 'bg-[#141414] border-white/10 text-white/50 hover:text-white'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div className="divide-y divide-white/5">
              {filteredLogs.map((log) => (
                <div
                  key={log.id}
                  className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4 hover:bg-[#121212] px-2 transition-colors"
                >
                  <div className="flex items-start sm:items-center gap-3">
                    <span
                      className={`px-2 py-0.5 text-[8px] font-black uppercase tracking-widest flex-shrink-0 ${log.badgeColor}`}
                    >
                      {log.type}
                    </span>
                    <div>
                      <h4 className="text-xs font-bold text-white uppercase tracking-tight">
                        {log.title}
                      </h4>
                      <p className="text-[11px] text-white/60 mt-0.5 font-normal">{log.detail}</p>
                    </div>
                  </div>

                  <span className="text-[9px] font-mono text-white/30 sm:text-right flex-shrink-0">
                    {log.timestamp}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB TAB: MANAGE CATALOG */}
      {/* ========================================================================= */}
      {activeSubTab === 'manage' && (
        <div className="space-y-6">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/40" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="SEARCH CATALOG RECORDS TO EDIT OR DELETE..."
              className="w-full bg-[#141414] text-xs uppercase tracking-wider text-white placeholder-white/30 pl-10 pr-4 py-3 border border-white/10 focus:outline-none focus:border-[#FF2D55]"
            />
          </div>

          <div className="bg-[#0A0A0A] border border-white/10 divide-y divide-white/10 overflow-hidden shadow-2xl">
            {filteredAnime.map((anime) => (
              <div
                key={anime.mal_id}
                className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-[#121212] transition-colors"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <img
                    src={anime.images.jpg.image_url}
                    alt={anime.title}
                    className="w-12 h-16 object-cover border border-white/10 flex-shrink-0"
                    referrerPolicy="no-referrer"
                  />

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h4
                        onClick={() => onSelectAnime(anime)}
                        className="font-bold text-xs sm:text-sm text-white hover:text-[#FF2D55] cursor-pointer truncate uppercase tracking-tight"
                      >
                        {anime.title}
                      </h4>
                      {anime.isFeatured && (
                        <span className="px-1.5 py-0.2 bg-[#FF2D55] text-white text-[8px] font-black uppercase flex items-center gap-1">
                          <Flame className="w-2.5 h-2.5" /> SPOTLIGHT
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-3 mt-1.5 text-[9px] text-white/60 uppercase font-mono">
                      <span className="text-[#FF2D55] font-bold">★ {anime.score || 'N/A'}</span>
                      <span>{(anime.episode_list || []).length > 0 ? `${(anime.episode_list || []).length} Uploaded EPS` : `${anime.episodes || 0} EPS`}</span>
                      <span>•</span>
                      <span className="truncate max-w-[200px]">
                        {(anime.genres || []).map((g) => g.name).join(', ')}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => {
                      playAnimeClickSound();
                      setSelectedAnimeForEpisode(anime.mal_id);
                      setActiveSubTab('episodes');
                    }}
                    className="px-3 py-2 bg-[#1A1A1A] hover:bg-white hover:text-black border border-white/15 text-white text-[10px] font-black uppercase tracking-wider transition-colors flex items-center gap-1"
                    title="Upload episodes for this anime"
                  >
                    <ListPlus className="w-3.5 h-3.5 text-[#FF2D55]" />
                    <span>Upload Episodes</span>
                  </button>

                  <button
                    onClick={() => {
                      playAnimeClickSound();
                      setEditingAnime(anime);
                    }}
                    className="px-3 py-2 bg-white text-black hover:bg-[#FF2D55] hover:text-white text-[10px] font-black uppercase tracking-wider transition-colors flex items-center gap-1"
                  >
                    <Edit className="w-3 h-3" />
                    <span>Edit</span>
                  </button>

                  {deleteConfirmId === anime.mal_id ? (
                    <div className="flex items-center gap-1 bg-red-950/80 p-1 border border-red-500">
                      <button
                        onClick={() => handleDeleteConfirmed(anime.mal_id)}
                        className="px-2 py-1 bg-red-600 text-white text-[9px] font-black uppercase hover:bg-red-500"
                      >
                        Yes, Delete
                      </button>
                      <button
                        onClick={() => setDeleteConfirmId(null)}
                        className="px-1.5 py-1 text-white/70 text-[9px] hover:text-white"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setDeleteConfirmId(anime.mal_id)}
                      className="p-2 bg-[#1A1A1A] hover:bg-red-600 text-white border border-white/15 hover:border-red-600 text-xs transition-colors"
                      title="Delete from Catalog"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB TAB: BATCH JSON BACKUP */}
      {/* ========================================================================= */}
      {activeSubTab === 'batch' && (
        <div className="space-y-6 bg-[#0D0D0D] border border-white/10 p-6 sm:p-8 shadow-2xl">
          <div className="border-b border-white/10 pb-4">
            <h3 className="text-lg font-editorial-serif font-black italic uppercase text-white tracking-tight">
              Batch JSON Import & Device File Sync
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 bg-[#121212] border border-white/10 space-y-4">
              <div className="flex items-center gap-2">
                <FileUp className="w-5 h-5 text-[#FF2D55]" />
                <h4 className="text-sm font-bold uppercase text-white">Import JSON Anime Dataset</h4>
              </div>
              <input
                type="file"
                ref={jsonFileInputRef}
                accept=".json,application/json"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  const reader = new FileReader();
                  reader.onload = (event) => {
                    try {
                      const parsed = JSON.parse(event.target?.result as string);
                      if (Array.isArray(parsed)) {
                        parsed.forEach((item) => {
                          if (item.title && item.synopsis) {
                            onAddAnime({
                              ...item,
                              mal_id: item.mal_id || Date.now() + Math.floor(Math.random() * 10000),
                            });
                          }
                        });
                        playSuccessChime();
                        setFormSuccessMessage(`Imported ${parsed.length} records!`);
                        setActiveSubTab('manage');
                      }
                    } catch (err: any) {
                      setBatchJsonError(err.message);
                    }
                  };
                  reader.readAsText(file);
                }}
              />
              <button
                type="button"
                onClick={() => jsonFileInputRef.current?.click()}
                className="w-full py-3 bg-white text-black hover:bg-[#FF2D55] hover:text-white text-xs font-black uppercase tracking-widest transition-colors flex items-center justify-center gap-2"
              >
                <FolderOpen className="w-4 h-4" />
                Browse JSON File from Device
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT MODAL (WITH CATEGORIES, BANNER & TRENDING SPOTLIGHT) */}
      {editingAnime && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in"
          onClick={() => setEditingAnime(null)}
        >
          <div
            className="relative w-full max-w-2xl bg-[#0A0A0A] border border-white/20 p-6 sm:p-8 space-y-5 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-base font-editorial-serif font-black italic uppercase text-white flex items-center gap-2">
                <Edit className="w-4 h-4 text-[#FF2D55]" />
                <span>Edit Anime Record: {editingAnime.title}</span>
              </h3>
              <button onClick={() => setEditingAnime(null)} className="text-white/60 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-white/60">Title</label>
                <input
                  type="text"
                  value={editingAnime.title}
                  onChange={(e) => setEditingAnime({ ...editingAnime, title: e.target.value })}
                  className="w-full bg-[#141414] text-white p-2.5 border border-white/15 uppercase font-bold"
                />
              </div>

              {/* Trending Spotlight Toggle in Edit */}
              <div className="p-3 bg-[#141414] border border-white/10 flex items-center justify-between">
                <div>
                  <span className="font-bold text-white uppercase text-xs flex items-center gap-1.5">
                    <Flame className="w-3.5 h-3.5 text-[#FF2D55]" />
                    Trending / Hero Spotlight
                  </span>
                  <p className="text-[10px] text-white/50 font-mono mt-0.5">
                    Feature on top hero carousel and trending recommendation list
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={Boolean(editingAnime.isFeatured)}
                  onChange={(e) => setEditingAnime({ ...editingAnime, isFeatured: e.target.checked })}
                  className="w-4 h-4 accent-[#FF2D55] cursor-pointer"
                />
              </div>

              {/* Banner Image URL in Edit */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-white/60">16:9 Banner Image URL</label>
                <input
                  type="url"
                  value={editingAnime.banner_image || ''}
                  onChange={(e) => setEditingAnime({ ...editingAnime, banner_image: e.target.value })}
                  placeholder="https://..."
                  className="w-full bg-[#141414] text-white p-2.5 border border-white/15 font-mono"
                />
              </div>

              {/* Poster Image URL in Edit */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-white/60">Vertical Poster Image URL</label>
                <input
                  type="url"
                  value={editingAnime.images?.jpg?.image_url || ''}
                  onChange={(e) =>
                    setEditingAnime({
                      ...editingAnime,
                      images: {
                        jpg: { image_url: e.target.value, large_image_url: e.target.value },
                        webp: { image_url: e.target.value, large_image_url: e.target.value },
                      },
                    })
                  }
                  className="w-full bg-[#141414] text-white p-2.5 border border-white/15 font-mono"
                />
              </div>

              {/* Episodes & Score in Edit */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-white/60">Episodes</label>
                  <input
                    type="number"
                    value={editingAnime.episodes || 12}
                    onChange={(e) => setEditingAnime({ ...editingAnime, episodes: Number(e.target.value) })}
                    className="w-full bg-[#141414] text-white p-2.5 border border-white/15 font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-white/60">Score</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editingAnime.score || 8.0}
                    onChange={(e) => setEditingAnime({ ...editingAnime, score: Number(e.target.value) })}
                    className="w-full bg-[#141414] text-white p-2.5 border border-white/15 font-mono"
                  />
                </div>
              </div>

              {/* Synopsis in Edit */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-white/60">Synopsis</label>
                <textarea
                  rows={3}
                  value={editingAnime.synopsis || ''}
                  onChange={(e) => setEditingAnime({ ...editingAnime, synopsis: e.target.value })}
                  className="w-full bg-[#141414] text-white p-2.5 border border-white/15"
                />
              </div>

              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setEditingAnime(null)}
                  className="w-full py-3 bg-[#1A1A1A] text-white uppercase font-bold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-full py-3 bg-[#FF2D55] text-white uppercase font-bold text-xs"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
