import React from 'react';
import { X, ExternalLink, Video } from 'lucide-react';
import { Anime } from '../types';
import { playAnimeClickSound } from '../utils/audioSynth';

interface TrailerModalProps {
  anime: Anime | null;
  onClose: () => void;
}

export const TrailerModal: React.FC<TrailerModalProps> = ({ anime, onClose }) => {
  if (!anime) return null;

  const isLocalOrDirectVideo =
    anime.trailer?.embed_url?.startsWith('blob:') ||
    anime.trailer?.embed_url?.startsWith('data:video') ||
    anime.trailer?.url?.endsWith('.mp4') ||
    anime.trailer?.url?.endsWith('.webm');

  const youtubeId = anime.trailer?.youtube_id;
  const embedUrl = youtubeId
    ? `https://www.youtube-nocookie.com/embed/${youtubeId}?autoplay=1&rel=0&modestbranding=1`
    : anime.trailer?.embed_url;

  if (!isLocalOrDirectVideo && !youtubeId && !embedUrl) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/90 backdrop-blur-md animate-in fade-in duration-200"
      onClick={() => {
        playAnimeClickSound();
        onClose();
      }}
    >
      <div
        className="relative w-full max-w-4xl bg-[#0A0A0A] border border-white/20 overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="flex items-center justify-between p-4 px-6 border-b border-white/10 bg-[#0F0F0F]">
          <div className="min-w-0 pr-4 flex items-center gap-3">
            <div className="p-2 bg-[#FF2D55] text-white">
              <Video className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[9px] font-black text-[#FF2D55] uppercase tracking-widest block">
                {isLocalOrDirectVideo ? 'LOCAL FILE STREAM // BROADCAST' : 'OFFICIAL BROADCAST TRAILER'}
              </span>
              <h3 className="text-sm sm:text-base font-bold text-white uppercase truncate tracking-tight">
                {anime.title}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {anime.trailer?.url && !isLocalOrDirectVideo && (
              <a
                href={anime.trailer.url}
                target="_blank"
                rel="noreferrer"
                className="p-2 bg-[#1A1A1A] hover:bg-white hover:text-black text-white/70 border border-white/15 transition-colors"
                title="Open in YouTube"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
            <button
              onClick={() => {
                playAnimeClickSound();
                onClose();
              }}
              className="p-2 bg-[#1A1A1A] hover:bg-[#FF2D55] text-white border border-white/15 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* 16:9 Video Player Container */}
        <div className="relative aspect-video w-full bg-black flex items-center justify-center">
          {isLocalOrDirectVideo ? (
            <video
              src={anime.trailer?.embed_url || anime.trailer?.url}
              controls
              autoPlay
              className="w-full h-full object-contain"
            >
              Your browser does not support HTML5 video playback.
            </video>
          ) : (
            <iframe
              src={embedUrl}
              title={`${anime.title} Trailer`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              className="w-full h-full border-0"
            />
          )}
        </div>
      </div>
    </div>
  );
};
