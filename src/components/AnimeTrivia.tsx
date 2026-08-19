import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { Trophy, Zap, HelpCircle, CheckCircle2, XCircle, RotateCcw, Award, Flame } from 'lucide-react';
import { TRIVIA_QUESTIONS } from '../data/triviaQuestions';
import { playAnimeClickSound, playSuccessChime, playWrongChime } from '../utils/audioSynth';

export const AnimeTrivia: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [highestStreak, setHighestStreak] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);

  const currentQ = TRIVIA_QUESTIONS[currentIndex];

  const handleSelectOption = (idx: number) => {
    if (isAnswered) return;
    setSelectedOption(idx);
    setIsAnswered(true);

    if (idx === currentQ.correctIndex) {
      playSuccessChime();
      const newScore = score + 100 + streak * 20;
      const newStreak = streak + 1;
      setScore(newScore);
      setStreak(newStreak);
      if (newStreak > highestStreak) setHighestStreak(newStreak);

      if (newStreak % 3 === 0) {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.7 },
        });
      }
    } else {
      playWrongChime();
      setStreak(0);
    }
  };

  const handleNextQuestion = () => {
    playAnimeClickSound();
    if (currentIndex + 1 < TRIVIA_QUESTIONS.length) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOption(null);
      setIsAnswered(false);
      setShowHint(false);
    } else {
      setIsGameOver(true);
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
    }
  };

  const handleRestart = () => {
    playAnimeClickSound();
    setCurrentIndex(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setShowHint(false);
    setScore(0);
    setStreak(0);
    setIsGameOver(false);
  };

  const getRankBadge = (points: number) => {
    if (points >= 800) return { title: 'SSS RANK // GRANDMASTER HOKAGE', color: 'text-[#FF2D55]' };
    if (points >= 500) return { title: 'S RANK // JONIN ELITE MASTER', color: 'text-white' };
    if (points >= 300) return { title: 'A RANK // CHUNIN VETERAN', color: 'text-white/80' };
    return { title: 'B RANK // GENIN ROOKIE', color: 'text-white/60' };
  };

  const rank = getRankBadge(score);

  return (
    <div className="space-y-8 max-w-3xl mx-auto animate-in fade-in duration-300">
      {/* Header Banner - Editorial */}
      <div className="p-6 sm:p-10 bg-[#0D0D0D] border border-white/10 shadow-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="px-2 py-0.5 bg-[#FF2D55] text-white text-[9px] font-black uppercase tracking-widest">
              ASSESSMENT // PROTOCOL
            </span>
            <span className="text-[10px] uppercase font-bold tracking-widest text-white/40">
              Knowledge Verification
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-editorial-serif font-black tracking-tighter italic text-white uppercase">
            Otaku Trivia Challenge
          </h2>
          <p className="text-xs text-white/60 uppercase tracking-wider font-medium">
            Test your knowledge across legendary anime archives and earn rank status.
          </p>
        </div>

        {/* Score & Streak Stats */}
        <div className="flex items-center gap-3">
          <div className="p-3.5 bg-[#141414] border border-white/10 text-center min-w-[90px]">
            <span className="text-[9px] text-white/40 uppercase font-bold tracking-widest block">Score</span>
            <span className="text-xl font-black text-white font-mono">{score}</span>
          </div>
          <div className="p-3.5 bg-[#141414] border border-white/10 text-center min-w-[90px]">
            <span className="text-[9px] text-white/40 uppercase font-bold tracking-widest block">Streak</span>
            <span className="text-xl font-black text-[#FF2D55] font-mono">{streak}x</span>
          </div>
        </div>
      </div>

      {!isGameOver ? (
        <div className="p-6 sm:p-8 bg-[#0A0A0A] border border-white/10 shadow-2xl space-y-6">
          {/* Question Header: Progress & Difficulty */}
          <div className="flex items-center justify-between text-xs">
            <span className="font-mono text-white/40 text-[10px] uppercase tracking-widest">
              Question 0{currentIndex + 1} / 0{TRIVIA_QUESTIONS.length}
            </span>
            <span className="px-2 py-0.5 bg-[#141414] border border-white/10 text-[9px] font-bold text-[#FF2D55] uppercase tracking-wider">
              {currentQ.anime} • {currentQ.difficulty}
            </span>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-black h-1 overflow-hidden border border-white/10">
            <div
              className="bg-[#FF2D55] h-full transition-all duration-300"
              style={{ width: `${((currentIndex + 1) / TRIVIA_QUESTIONS.length) * 100}%` }}
            />
          </div>

          {/* Question text */}
          <h3 className="text-base sm:text-xl font-bold text-white leading-relaxed uppercase tracking-tight">
            {currentQ.question}
          </h3>

          {/* Options Grid */}
          <div className="grid grid-cols-1 gap-2.5 pt-2">
            {currentQ.options.map((option, idx) => {
              const isSelected = selectedOption === idx;
              const isCorrect = idx === currentQ.correctIndex;

              let btnStyle = 'bg-[#121212] border-white/10 text-white/90 hover:border-white/30 hover:bg-[#1A1A1A]';
              if (isAnswered) {
                if (isCorrect) {
                  btnStyle = 'bg-[#FF2D55] border-[#FF2D55] text-white font-bold';
                } else if (isSelected) {
                  btnStyle = 'bg-black border-red-500 text-red-400 font-bold';
                } else {
                  btnStyle = 'bg-[#0A0A0A] border-white/5 text-white/30 opacity-40';
                }
              }

              return (
                <button
                  key={idx}
                  onClick={() => handleSelectOption(idx)}
                  disabled={isAnswered}
                  className={`flex items-center justify-between p-4 border text-xs sm:text-sm text-left transition-all ${btnStyle}`}
                >
                  <span className="flex-1 pr-3 uppercase tracking-wide font-medium">{option}</span>
                  {isAnswered && isCorrect && <CheckCircle2 className="w-4 h-4 text-white flex-shrink-0" />}
                  {isAnswered && isSelected && !isCorrect && <XCircle className="w-4 h-4 text-red-400 flex-shrink-0" />}
                </button>
              );
            })}
          </div>

          {/* Hint and Explanation */}
          {showHint && !isAnswered && (
            <div className="p-4 bg-[#141414] border border-white/15 text-white/70 text-xs font-mono">
              <strong className="text-[#FF2D55]">HINT:</strong> {currentQ.hint}
            </div>
          )}

          {isAnswered && (
            <div className="p-4 bg-[#121212] border border-white/10 text-xs text-white/70 space-y-1 animate-in fade-in">
              <strong className="text-white uppercase tracking-wider block font-bold">Explanation:</strong>
              <p className="leading-relaxed">{currentQ.explanation}</p>
            </div>
          )}

          {/* Action Row */}
          <div className="flex items-center justify-between pt-2">
            {!isAnswered ? (
              <button
                onClick={() => {
                  playAnimeClickSound();
                  setShowHint(!showHint);
                }}
                className="text-[10px] font-bold uppercase tracking-widest text-white/40 hover:text-white flex items-center gap-1.5 transition-colors"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span>{showHint ? 'Hide Hint' : 'Reveal Hint'}</span>
              </button>
            ) : <div />}

            {isAnswered && (
              <button
                onClick={handleNextQuestion}
                className="px-8 py-3 bg-white text-black hover:bg-[#FF2D55] hover:text-white font-black text-xs uppercase tracking-widest transition-colors"
              >
                {currentIndex + 1 < TRIVIA_QUESTIONS.length ? 'Next Question →' : 'View Final Rank →'}
              </button>
            )}
          </div>
        </div>
      ) : (
        /* Game Over Scorecard */
        <div className="p-10 bg-[#0A0A0A] border border-white/10 shadow-2xl text-center space-y-6 animate-in zoom-in-95">
          <div className="w-16 h-16 bg-[#FF2D55] text-white flex items-center justify-center mx-auto">
            <Award className="w-8 h-8" />
          </div>

          <div>
            <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/40 block mb-1">
              ASSESSMENT COMPLETED
            </span>
            <h3 className="text-3xl font-editorial-serif font-black tracking-tighter italic text-white uppercase">
              Evaluation Result
            </h3>
          </div>

          {/* Rank Card */}
          <div className="p-6 bg-[#121212] border border-white/15 max-w-md mx-auto">
            <span className="text-[10px] text-white/40 uppercase tracking-widest block">Assigned Title</span>
            <strong className={`text-base sm:text-lg font-black ${rank.color} block mt-1 tracking-wider uppercase`}>
              {rank.title}
            </strong>
            <p className="text-xs text-white/60 font-mono mt-2 uppercase">
              Score: {score} PTS // Max Streak: {highestStreak}x
            </p>
          </div>

          <button
            onClick={handleRestart}
            className="px-8 py-3.5 bg-white text-black hover:bg-[#FF2D55] hover:text-white font-black text-xs uppercase tracking-widest transition-colors inline-flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            Restart Challenge
          </button>
        </div>
      )}
    </div>
  );
};
