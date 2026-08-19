import React, { useState } from 'react';
import { Calendar, Clock, Star, Bell, Play, Flame } from 'lucide-react';
import { WEEKLY_SCHEDULE_DATA } from '../data/curatedAnime';
import { playAnimeClickSound } from '../utils/audioSynth';

export const ScheduleCalendar: React.FC = () => {
  const [selectedDay, setSelectedDay] = useState<string>('Saturday');
  const [remindedTitles, setRemindedTitles] = useState<string[]>([]);

  const activeDayData =
    WEEKLY_SCHEDULE_DATA.find((d) => d.day === selectedDay) || WEEKLY_SCHEDULE_DATA[0];

  const handleToggleReminder = (title: string) => {
    playAnimeClickSound();
    setRemindedTitles((prev) =>
      prev.includes(title) ? prev.filter((t) => t !== title) : [...prev, title]
    );
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header Banner - Editorial */}
      <div className="p-6 sm:p-10 bg-[#0D0D0D] border border-white/10 shadow-2xl space-y-2">
        <div className="flex items-center gap-3">
          <span className="px-2 py-0.5 bg-[#FF2D55] text-white text-[9px] font-black uppercase tracking-widest">
            SIMULCAST TIMETABLE
          </span>
          <span className="text-[10px] uppercase font-bold tracking-widest text-white/40">
            Tokyo Broadcast Time (JST)
          </span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-editorial-serif font-black tracking-tighter italic text-white uppercase">
          Weekly Broadcast Schedule
        </h2>
        <p className="text-xs text-white/60 max-w-xl uppercase tracking-wider font-medium">
          Official Japanese network airings and global simulcast releases indexed by broadcast day.
        </p>
      </div>

      {/* Day Selector - Editorial Blocks */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {WEEKLY_SCHEDULE_DATA.map((dayObj) => {
          const isSelected = selectedDay === dayObj.day;
          return (
            <button
              key={dayObj.day}
              id={`day-btn-${dayObj.day}`}
              onClick={() => {
                playAnimeClickSound();
                setSelectedDay(dayObj.day);
              }}
              className={`flex flex-col items-center min-w-[100px] sm:min-w-[125px] p-3.5 border transition-all ${
                isSelected
                  ? 'bg-[#FF2D55] border-[#FF2D55] text-white'
                  : 'bg-[#0F0F0F] border-white/10 text-white/50 hover:text-white hover:border-white/30'
              }`}
            >
              <span className="text-[9px] uppercase font-mono tracking-widest opacity-80">{dayObj.dayJa}</span>
              <span className="text-xs sm:text-sm font-black uppercase tracking-wider mt-0.5">{dayObj.day}</span>
              <span className="text-[9px] uppercase font-mono mt-1 opacity-70">
                {dayObj.airingAnime.length} Releases
              </span>
            </button>
          );
        })}
      </div>

      {/* Airing Anime List for the selected day */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <h3 className="text-xs font-black uppercase tracking-widest text-white flex items-center gap-2">
            <span className="w-2 h-2 bg-[#FF2D55]" />
            <span>
              {activeDayData.day} Lineup // {activeDayData.dayJa}
            </span>
          </h3>
          <span className="text-[10px] font-mono text-white/40 uppercase">All times in Tokyo JST</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {activeDayData.airingAnime.map((anime, idx) => {
            const hasReminder = remindedTitles.includes(anime.title);
            return (
              <div
                key={idx}
                className="flex items-center gap-4 p-4 bg-[#0F0F0F] border border-white/10 hover:border-white/30 transition-all shadow-md group"
              >
                <img
                  src={anime.image}
                  alt={anime.title}
                  className="w-16 h-20 object-cover border border-white/10 flex-shrink-0"
                  referrerPolicy="no-referrer"
                />

                <div className="min-w-0 flex-1 space-y-1">
                  <h4 className="font-bold text-xs sm:text-sm text-white group-hover:text-[#FF2D55] truncate uppercase tracking-tight">
                    {anime.title}
                  </h4>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="px-1.5 py-0.5 bg-white/10 text-white font-mono text-[9px] uppercase">
                      {anime.episode}
                    </span>
                    <span className="flex items-center gap-1 font-mono text-white/60 text-[10px]">
                      <Clock className="w-3 h-3 text-white/40" />
                      {anime.time}
                    </span>
                  </div>
                  <div className="text-[10px] text-[#FF2D55] font-black uppercase">
                    ★ {anime.score} SCORE
                  </div>
                </div>

                <button
                  onClick={() => handleToggleReminder(anime.title)}
                  className={`p-2.5 border transition-all ${
                    hasReminder
                      ? 'bg-[#FF2D55] border-[#FF2D55] text-white'
                      : 'bg-black border-white/15 text-white/50 hover:text-white'
                  }`}
                  title={hasReminder ? 'Reminder Active' : 'Set Broadcast Notification'}
                >
                  <Bell className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
