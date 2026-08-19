import React, { useState, useRef, useEffect } from 'react';
import {
  Bot,
  Send,
  Sparkles,
  Zap,
  Swords,
  BookOpen,
  RotateCcw,
  User,
  Film
} from 'lucide-react';
import { playAnimeClickSound, playSuccessChime } from '../utils/audioSynth';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export const AIOtakuAssistant: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: `Konnichiwa! 🌸 I am Kitsune-sensei, your Editorial Otaku AI Advisor. 
Ask me for tailored anime recommendations, power scaling breakdowns (e.g. Gojo vs Sukuna), franchise watch orders, or deep plot analyses! What would you like to explore today?`,
      timestamp: 'ONLINE',
    },
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  const quickPrompts = [
    { label: '🧠 PSYCHOLOGICAL / DEATH NOTE', query: 'Recommend me 3 psychological thriller anime with high IQ mind games like Death Note and Monster.' },
    { label: '⚔️ GOJO VS SUKUNA FEATS', query: 'Can you analyze the power feats and abilities between Satoru Gojo and Ryomen Sukuna from Jujutsu Kaisen?' },
    { label: '📜 FATE SERIES WATCH ORDER', query: 'What is the recommended watch order for the Fate anime franchise (Fate/Zero, Unlimited Blade Works, Heavens Feel)?' },
    { label: '👑 OVERPOWERED MC ISEKAI', query: 'Recommend top anime with overwhelming main character progression and hype dungeon raids similar to Solo Leveling.' },
    { label: '🌸 WHOLESOME ROMANCE GEMS', query: 'Give me top wholesome romance & slice of life anime recommendations with satisfying character development.' },
  ];

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputMessage;
    if (!text.trim() || isLoading) return;

    playAnimeClickSound();
    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          history: messages.slice(-6).map((m) => ({ role: m.role, content: m.content })),
        }),
      });

      if (!response.ok) {
        throw new Error('Server error');
      }

      const data = await response.json();
      playSuccessChime();

      const assistantMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.reply || 'Gomen ne! I could not formulate an answer right now.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: '⚠️ Unable to connect to the Gemini AI core. Please ensure your GEMINI_API_KEY is configured in Settings or retry in a moment.',
          timestamp: 'ERROR',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearChat = () => {
    playAnimeClickSound();
    setMessages([
      {
        id: Date.now().toString(),
        role: 'assistant',
        content: 'Archive cleared. Ready for new queries and anime breakdowns.',
        timestamp: 'RESET',
      },
    ]);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in duration-300">
      {/* Header Banner - Editorial */}
      <div className="p-6 sm:p-8 bg-[#0D0D0D] border border-white/10 shadow-2xl flex items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2 py-0.5 bg-[#FF2D55] text-white text-[9px] font-black uppercase tracking-widest">
              AI ENGINE // GEMINI 3.7
            </span>
            <span className="text-[10px] uppercase font-bold tracking-widest text-white/40">
              Sensei Otaku Advisor
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-editorial-serif font-black tracking-tighter italic text-white uppercase">
            Otaku Intelligence Core
          </h2>
          <p className="text-xs text-white/60 uppercase tracking-wider font-medium">
            Curated analysis, franchise watch guides, and power level debates.
          </p>
        </div>

        <button
          onClick={handleClearChat}
          className="px-3.5 py-2 bg-black border border-white/15 hover:border-white/40 text-white/70 hover:text-white transition-colors text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5"
          title="Reset Conversation"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset</span>
        </button>
      </div>

      {/* Quick Prompt Chips */}
      <div className="space-y-2">
        <span className="text-[9px] font-bold uppercase tracking-widest text-white/40 block">
          Editorial Query Templates:
        </span>
        <div className="flex flex-wrap gap-2">
          {quickPrompts.map((chip, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(chip.query)}
              disabled={isLoading}
              className="px-3 py-1.5 bg-[#121212] hover:bg-[#1A1A1A] text-[10px] font-bold uppercase tracking-wider text-white/70 hover:text-white border border-white/10 hover:border-[#FF2D55] transition-all disabled:opacity-50 text-left"
            >
              {chip.label}
            </button>
          ))}
        </div>
      </div>

      {/* Chat Messages Container */}
      <div className="p-4 sm:p-6 bg-[#0A0A0A] border border-white/10 shadow-2xl min-h-[420px] max-h-[520px] overflow-y-auto space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-3.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.role === 'assistant' && (
              <div className="w-8 h-8 bg-black border border-[#FF2D55] flex items-center justify-center flex-shrink-0 text-[#FF2D55] text-xs font-black">
                AI
              </div>
            )}

            <div
              className={`max-w-[85%] sm:max-w-[78%] p-4 text-xs sm:text-sm leading-relaxed border ${
                msg.role === 'user'
                  ? 'bg-white text-black font-semibold border-white shadow-md'
                  : 'bg-[#141414] border-white/10 text-white/90'
              }`}
            >
              <div className="whitespace-pre-wrap">{msg.content}</div>
              <div
                className={`text-[9px] font-mono uppercase tracking-wider text-right mt-2 ${
                  msg.role === 'user' ? 'text-black/50' : 'text-white/40'
                }`}
              >
                {msg.timestamp}
              </div>
            </div>

            {msg.role === 'user' && (
              <div className="w-8 h-8 bg-white text-black flex items-center justify-center flex-shrink-0 text-xs font-black">
                YOU
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex gap-3.5 items-center">
            <div className="w-8 h-8 bg-black border border-[#FF2D55] flex items-center justify-center flex-shrink-0 text-[#FF2D55] text-xs font-black animate-pulse">
              AI
            </div>
            <div className="p-3.5 bg-[#141414] border border-white/10 text-white/50 text-xs uppercase tracking-wider font-mono flex items-center gap-2">
              <span className="w-2 h-2 bg-[#FF2D55] animate-ping" />
              <span>Analyzing anime database archives...</span>
            </div>
          </div>
        )}
        <div ref={chatBottomRef} />
      </div>

      {/* Message Input Box */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage();
        }}
        className="relative flex items-center"
      >
        <input
          id="ai-chat-input"
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          placeholder="ASK SENSEI AI (E.G. 'RECOMMEND A DARK FANTASY ANIME', 'GOJO VS SUKUNA')..."
          disabled={isLoading}
          className="w-full bg-[#141414] text-xs uppercase tracking-wider text-white placeholder-white/30 pl-5 pr-28 py-4 border border-white/15 focus:outline-none focus:border-[#FF2D55] transition-all"
        />
        <button
          type="submit"
          disabled={!inputMessage.trim() || isLoading}
          className="absolute right-2 px-5 py-2.5 bg-white text-black hover:bg-[#FF2D55] hover:text-white disabled:opacity-20 text-[10px] font-black uppercase tracking-widest transition-colors flex items-center gap-1.5"
        >
          <span>Send</span>
          <Send className="w-3 h-3" />
        </button>
      </form>
    </div>
  );
};
