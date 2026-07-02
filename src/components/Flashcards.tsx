import React, { useState, useEffect } from "react";
import { Unit, Word } from "../data/vocabulary";
import { ChevronLeft, ChevronRight, Volume2, Star, RefreshCw, Sparkles, BookOpen, Volume1, VolumeX, Lightbulb, CheckCircle2 } from "lucide-react";
import { playAudio } from "../utils/audio";
import confetti from "canvas-confetti";
import { StudyTimer } from "./StudyTimer";

interface FlashcardsProps {
  selectedUnit: Unit | null;
  grade: string;
  volume: number;
  setVolume: (v: number) => void;
  bookmarkedWords: any[];
  toggleBookmark: (wordObj: { word: string; translation: string; phonetic: string; grade: string; unitName: string }) => void;
  onBackToDashboard: () => void;
  onMarkUnitCompleted?: (unitKey: string) => void;
  completedUnits: string[];
  theme: string;
}

export function Flashcards({
  selectedUnit,
  grade,
  volume,
  setVolume,
  bookmarkedWords,
  toggleBookmark,
  onBackToDashboard,
  onMarkUnitCompleted,
  completedUnits,
  theme
}: FlashcardsProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  // Set safe word data array
  const words = selectedUnit?.words || [];
  const currentWord = words[currentIndex] as Word | undefined;
  const unitName = selectedUnit?.unit || "Unit";

  // Trigger sound autoplay on card load
  useEffect(() => {
    if (currentWord) {
      playAudio(currentWord.word, volume);
    }
    setIsFlipped(false); // Reset flip on word index change
  }, [currentIndex, selectedUnit]);

  if (!selectedUnit || words.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 space-y-4 text-center max-w-sm mx-auto px-4">
        <div className="w-16 h-16 rounded-full bg-sanrio-secondary bg-opacity-30 flex items-center justify-center text-4xl">
          🔮
        </div>
        <h3 className="text-xl font-bold text-sanrio-text">请先选择一个课程单元喔</h3>
        <p className="text-xs text-sanrio-muted">
          在下方的仪表盘大厅选择一个你喜欢的英语单元，就可以开启魔法翻翻卡练习啦！
        </p>
        <button
          onClick={onBackToDashboard}
          className="px-5 py-2.5 rounded-full bg-sanrio-primary text-white font-bold text-xs transition-transform hover:scale-105"
        >
          返回大厅 🌸
        </button>
      </div>
    );
  }

  const isBookmarked = currentWord
    ? bookmarkedWords.some((b) => b.word.toLowerCase() === currentWord.word.toLowerCase() && b.grade.toLowerCase() === grade.toLowerCase())
    : false;

  const handleToggleBookmark = (e: React.MouseEvent) => {
    e.stopPropagation(); // Avoid flipping card
    if (currentWord) {
      toggleBookmark({
        word: currentWord.word,
        translation: currentWord.translation,
        phonetic: currentWord.phonetic,
        grade,
        unitName
      });
    }
  };

  const handlePrev = () => {
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev > 0 ? prev - 1 : words.length - 1));
    }, 150);
  };

  const handleNext = () => {
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev < words.length - 1 ? prev + 1 : 0));
    }, 150);
  };

  const speakCurrent = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (currentWord) {
      playAudio(currentWord.word, volume);
    }
  };

  const handleUnitFinish = () => {
    const key = `${grade.toLowerCase()}_${selectedUnit.unit.toLowerCase()}`;
    if (onMarkUnitCompleted) {
      onMarkUnitCompleted(key);
    }
    // Launch cute confetti
    try {
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch (err) {
      console.warn("Confetti animation blocked or failed:", err);
    }
    playAudio("Perfect job! You finished this unit card study!", volume);
  };

  const unitKey = `${grade.toLowerCase()}_${selectedUnit.unit.toLowerCase()}`;
  const isUnitAlreadyCompleted = completedUnits.includes(unitKey);

  // Sound illustration for sentences
  const speakSentence = (e: React.MouseEvent, text: string) => {
    e.stopPropagation();
    playAudio(text, volume);
  };

  return (
    <div id="flashcards-layout" className="max-w-2xl mx-auto space-y-6 px-4 py-2">
      {/* Head navigation and controls */}
      <div className="flex items-center justify-between no-print">
        <button
          onClick={onBackToDashboard}
          className="text-xs font-bold text-sanrio-primary hover:underline flex items-center gap-1 cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>返回单元大厅</span>
        </button>
        <div className="text-sm font-black text-sanrio-text bg-sanrio-secondary bg-opacity-40 px-3.5 py-1.5 rounded-full border border-sanrio-border">
          {selectedUnit.unit} · {selectedUnit.title} 🌸
        </div>
      </div>

      {/* 🍅 番茄专注计时器 (Pomodoro Study Timer) */}
      <StudyTimer theme={theme} volume={volume} />

      {/* 🚀 Active 3D Flipping Card Stage */}
      <div className="flex flex-col items-center justify-center space-y-6">
        <div className="text-xs font-bold text-sanrio-muted">
          第 <strong className="text-sanrio-accent">{currentIndex + 1}</strong> 个 / 共 {words.length} 个核心词
        </div>

        {/* 3D Container */}
        <div
          id="flip-card-perspective"
          className="relative w-full max-w-sm h-80 cursor-pointer perspective-1000 group"
          onClick={() => setIsFlipped(!isFlipped)}
        >
          {/* Card Inner Rotator */}
          <div
            className={`w-full h-full rounded-3xl transition-transform duration-500 ease-in-out transform shadow-md hover:shadow-lg border-2 border-sanrio-border ${
              isFlipped ? "rotate-y-180" : ""
            }`}
            style={{ transformStyle: "preserve-3d" }}
          >
            {/* 🔴 CARD FRONT: English & Phonetics */}
            <div
              className="absolute inset-0 w-full h-full rounded-[22px] bg-sanrio-card flex flex-col justify-between p-6 backface-hidden"
              style={{ transformStyle: "preserve-3d" }}
            >
              {/* Header: Bookmarking & Help stamp */}
              <div className="flex items-center justify-between text-xs text-sanrio-muted">
                <span className="flex items-center gap-1 bg-sanrio-bg px-2.5 py-1 rounded-lg">
                  <Lightbulb className="w-3.5 h-3.5 text-sanrio-accent" />
                  <span>点击卡片翻面对照</span>
                </span>
                <button
                  onClick={handleToggleBookmark}
                  className="p-1 rounded-full text-sanrio-muted hover:text-orange-400 transition-colors"
                >
                  <Star className={`w-6 h-6 ${isBookmarked ? "fill-orange-400 text-orange-400" : "text-opacity-50"}`} />
                </button>
              </div>

              {/* Main Content Layout */}
              <div className="text-center space-y-3 pb-8">
                <h1 className="text-5xl font-black text-sanrio-text tracking-wide select-all">
                  {currentWord?.word}
                </h1>
                <div className="inline-block px-3 py-1 bg-sanrio-secondary bg-opacity-30 rounded-lg text-xs font-mono text-sanrio-muted border border-sanrio-border">
                  {currentWord?.phonetic}
                </div>
              </div>

              {/* Footer sound trigger */}
              <div className="flex justify-center">
                <button
                  onClick={speakCurrent}
                  className="w-12 h-12 rounded-full bg-sanrio-primary text-white flex items-center justify-center shadow-sm cursor-pointer hover:scale-105 active:scale-95 transition-transform"
                >
                  <Volume2 className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* 🔵 CARD BACK: Translation & Illustrative Sentences */}
            <div
              className="absolute inset-0 w-full h-full rounded-[22px] bg-sanrio-secondary bg-opacity-20 flex flex-col justify-between p-6 backface-hidden rotate-y-180 border-t-2 border-sanrio-primary"
              style={{ transformStyle: "preserve-3d" }}
            >
              <div className="flex items-center justify-between text-xs text-sanrio-muted">
                <span className="bg-sanrio-card px-2.5 py-1 rounded-lg text-sanrio-text border border-sanrio-border">
                  中文翻译与好玩整句 ✏️
                </span>
                <button
                  onClick={handleToggleBookmark}
                  className="p-1 rounded-full text-sanrio-muted hover:text-orange-400"
                >
                  <Star className={`w-6 h-6 ${isBookmarked ? "fill-orange-400 text-orange-400" : ""}`} />
                </button>
              </div>

              {/* Chinese meaning display */}
              <div className="text-center space-y-3 pb-2">
                <div className="text-3xl font-black text-sanrio-text">
                  {currentWord?.translation}
                </div>
              </div>

              {/* Sample Sentences helper (Dynamic generation matches database Schema) */}
              <div className="bg-sanrio-card p-3 rounded-2xl border border-sanrio-border space-y-2">
                <div className="text-[10px] font-bold text-sanrio-accent uppercase">
                  ⭐ 听听句型发音：
                </div>
                {selectedUnit.sentences && selectedUnit.sentences.slice(0, 2).map((s, sIdx) => (
                  <div
                    key={sIdx}
                    onClick={(e) => speakSentence(e, s.english)}
                    className="text-left text-xs bg-sanrio-bg bg-opacity-30 p-1.5 rounded-lg border border-sanrio-border hover:border-sanrio-primary hover:bg-opacity-50 transition-colors"
                  >
                    <div className="font-semibold text-sanrio-text flex items-center gap-1">
                      <Volume1 className="w-3.5 h-3.5 text-sanrio-muted" />
                      <span>{s.english}</span>
                    </div>
                    <div className="text-sanrio-muted text-[10px] mt-0.5">{s.chinese}</div>
                  </div>
                ))}
              </div>

              {/* Audio and guidance control footer */}
              <div className="flex justify-center">
                <button
                  onClick={speakCurrent}
                  className="w-10 h-10 rounded-full bg-sanrio-primary text-white flex items-center justify-center hover:scale-105 active:scale-95 transition-transform"
                >
                  <Volume2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 🔊 Audio Gain (Amplifier) Deck slider (0.0x to 3.0x scaling) */}
        <div className="w-full max-w-sm bg-sanrio-card p-4 rounded-2xl border border-sanrio-border space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-1 font-semibold text-sanrio-text">
              {volume === 0 ? <VolumeX className="w-4 h-4 text-red-400" /> : volume > 1.5 ? <Volume2 className="w-4 h-4 text-sanrio-accent" /> : <Volume1 className="w-4 h-4 text-sanrio-primary" />}
              <span>300% 极具放大音量发音：</span>
            </span>
            <span className="font-mono bg-sanrio-secondary px-2 py-0.5 rounded-md font-bold text-sanrio-text">
              {(volume * 100).toFixed(0)}%
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="3"
            step="0.2"
            value={volume}
            onChange={(e) => setVolume(parseFloat(e.target.value))}
            className="w-full accent-sanrio-primary h-2 bg-sanrio-bg rounded-lg cursor-pointer transition-all"
          />
          <div className="text-[10px] text-sanrio-muted text-center italic">
            使用同源代理接口，突破限制放大音量。听得清，学得快！🦁
          </div>
        </div>

        {/* Previous/Next controllers */}
        <div className="flex items-center gap-4">
          <button
            onClick={handlePrev}
            className="w-12 h-12 rounded-2xl border-2 border-sanrio-border bg-sanrio-card text-sanrio-text flex items-center justify-center hover:bg-sanrio-secondary hover:bg-opacity-25 active:scale-95 transition-all text-sm font-bold cursor-pointer"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          <button
            onClick={() => setIsFlipped(!isFlipped)}
            className="px-6 h-12 rounded-2xl border-2 border-sanrio-primary bg-sanrio-primary bg-opacity-10 text-sanrio-primary flex items-center justify-center gap-2 hover:bg-sanrio-primary hover:text-white transition-all text-xs font-bold cursor-pointer"
          >
            <RefreshCw className="w-4 h-4 animate-spin-slow" />
            <span>卡片翻面</span>
          </button>

          <button
            onClick={handleNext}
            className="w-12 h-12 rounded-2xl border-2 border-sanrio-border bg-sanrio-card text-sanrio-text flex items-center justify-center hover:bg-sanrio-secondary hover:bg-opacity-25 active:scale-95 transition-all text-sm font-bold cursor-pointer"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Flag completed unit or show congratulations modal block */}
      <div className="pt-6 border-t border-dashed border-sanrio-border text-center">
        {isUnitAlreadyCompleted ? (
          <div className="inline-flex items-center gap-1.5 bg-green-50 text-green-600 px-4 py-2 rounded-full border border-green-200 text-xs font-bold shadow-sm">
            <CheckCircle2 className="w-4 h-4" />
            <span>这个单元已经通关啦！你可以去字典或错题本继续巩固！👑</span>
          </div>
        ) : (
          <button
            onClick={handleUnitFinish}
            className="px-6 py-3 rounded-full bg-sanrio-accent text-white font-extrabold text-xs shadow-md shadow-rose-200 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-1.5 mx-auto cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>我背完本单元啦！申请通关 🏆</span>
          </button>
        )}
      </div>
    </div>
  );
}
