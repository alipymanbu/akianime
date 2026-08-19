import React from 'react';
import { Film, Heart, Sparkles, Github, Globe } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full border-t border-white/10 bg-[#0A0A0A] text-white/50 py-12 mt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-12 space-y-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Logo & Slogan */}
          <div className="flex items-center gap-3">
            <div className="text-2xl font-black tracking-tighter italic font-editorial-serif text-white">
              AK<span className="text-[#FF2D55]">/</span>ANIME
            </div>
            <div className="pl-3 border-l border-white/10">
              <p className="text-[10px] uppercase font-bold tracking-widest text-white/60">
                Editorial Anime Archive & Broadcast Index
              </p>
            </div>
          </div>

          {/* Japanese Kanji Quote */}
          <div className="text-center md:text-right">
            <p className="text-xs font-mono text-[#FF2D55] tracking-widest">
              「諦めたらそこで試合終了ですよ」
            </p>
            <p className="text-[10px] text-white/40 uppercase tracking-wider mt-0.5">
              "If you surrender, that is where the match concludes." // Master Anzai
            </p>
          </div>
        </div>

        <div className="border-t border-white/5 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[10px] uppercase tracking-widest text-white/40 font-mono">
          <p>© {new Date().getFullYear()} AK/ANIME • Editorial Otaku Archive System</p>
          <div className="flex items-center gap-4">
            <span>Powered by Jikan API & Gemini AI</span>
            <span>//</span>
            <span>Tokyo Broadcast Sync</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
