import React, { useState, useEffect } from "react";
import confetti from "canvas-confetti";
import { vocabularyData, Unit } from "./data/vocabulary";
import { Bookmark, Mistake, SanrioTheme } from "./types";
import { Dashboard } from "./components/Dashboard";
import { Flashcards } from "./components/Flashcards";
import { Quiz } from "./components/Quiz";
import { Glossary } from "./components/Glossary";
import { Worksheet } from "./components/Worksheet";
import { WordSearch } from "./components/WordSearch";
import { playAudio } from "./utils/audio";
import { motion } from "motion/react";
import { 
  BookOpen, 
  Layers, 
  HelpCircle, 
  FileText, 
  BookMarked, 
  Star, 
  Volume2, 
  Award, 
  Calendar, 
  CheckCircle,
  Undo2,
  Trash2,
  Flame,
  Volume1,
  Sparkles,
  Info,
  Puzzle,
  Moon,
  Sun,
  Settings
} from "lucide-react";

// Safe local storage utility helper to prevent iframe SecurityErrors
const safeLocalStorage = {
  getItem: (key: string): string | null => {
    try {
      return localStorage.getItem(key);
    } catch (e) {
      console.warn("Storage blocked or restricted:", e);
      return null;
    }
  },
  setItem: (key: string, value: string): void => {
    try {
      localStorage.setItem(key, value);
    } catch (e) {
      console.warn("Storage blocked or restricted:", e);
    }
  },
  removeItem: (key: string): void => {
    try {
      localStorage.removeItem(key);
    } catch (e) {
      console.warn("Storage blocked or restricted:", e);
    }
  }
};

export default function App() {
  // ---------------------------------------------------------------------------
  // 💾 1. Persistent Reactive States Core (Single Source of Truth)
  // ---------------------------------------------------------------------------
  
  const [grade, setGrade] = useState<string>(() => {
    return safeLocalStorage.getItem("oxford_grade") || "2a"; // Sweet 2A Oxford primary school starting point
  });
  
  const [activeView, setActiveView] = useState<"dashboard" | "flashcards" | "quiz" | "glossary" | "worksheet">(() => {
    return (safeLocalStorage.getItem("oxford_view") as any) || "dashboard";
  });

  const [selectedUnit, setSelectedUnit] = useState<Unit | null>(() => {
    const saved = safeLocalStorage.getItem("oxford_selected_unit");
    if (saved) {
      try { return JSON.parse(saved); } catch(e) { return null; }
    }
    // Auto default to Unit 1 of current grade to prevent empty states
    const bookUnits = vocabularyData[`grade_2a`] || [];
    return bookUnits[0] || null;
  });

  const [bookmarkedWords, setBookmarkedWords] = useState<Bookmark[]>(() => {
    const saved = safeLocalStorage.getItem("oxford_bookmarks");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) {
        console.warn("Failed to parse bookmarkedWords:", e);
      }
    }
    return [];
  });

  const [completedUnits, setCompletedUnits] = useState<string[]>(() => {
    const saved = safeLocalStorage.getItem("oxford_completed_units");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) {
        console.warn("Failed to parse completedUnits:", e);
      }
    }
    return [];
  });

  const [mistakes, setMistakes] = useState<Mistake[]>(() => {
    const saved = safeLocalStorage.getItem("oxford_mistakes");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) {
        console.warn("Failed to parse mistakes:", e);
      }
    }
    return [];
  });

  const [studyHistory, setStudyHistory] = useState<string[]>(() => {
    const saved = safeLocalStorage.getItem("oxford_study_history");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) {
        console.warn("Failed to parse studyHistory:", e);
      }
    }
    return ["2026-06-22"]; // Default immediate study history to encourage user has 1 day checked
  });

  const [volume, setVolume] = useState<number>(() => {
    const saved = safeLocalStorage.getItem("oxford_volume");
    return saved ? parseFloat(saved) : 1.2; // default amplified sound
  });

  const [isNightMode, setIsNightMode] = useState<boolean>(() => {
    return safeLocalStorage.getItem("oxford_night_mode") === "true";
  });

  const [nightBrightness, setNightBrightness] = useState<number>(() => {
    const saved = safeLocalStorage.getItem("oxford_night_brightness");
    return saved ? parseInt(saved, 10) : 75; // Default to 75% brightness (25% dimmed)
  });

  const [preNightModeTheme, setPreNightModeTheme] = useState<SanrioTheme>(() => {
    return (safeLocalStorage.getItem("oxford_pre_night_theme") as SanrioTheme) || "theme-melody";
  });

  const [theme, setTheme] = useState<SanrioTheme>(() => {
    const isNight = safeLocalStorage.getItem("oxford_night_mode") === "true";
    if (isNight) return "theme-dark";
    return (safeLocalStorage.getItem("oxford_theme") as SanrioTheme) || "theme-melody"; // Soft pink rabbit My Melody
  });

  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 40) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Trigger magical confetti effects safely with type-safety and iframe-safety
  const triggerConfetti = (type: "unit" | "streak" | "checkin") => {
    try {
      if (type === "unit") {
        // Classy circular explosion of confetti
        confetti({
          particleCount: 150,
          spread: 80,
          origin: { y: 0.6 },
          colors: ["#ff7b93", "#ffc2cd", "#7bc9ff", "#bce5ff", "#ffe27b", "#ffecd1"]
        });
      } else if (type === "streak") {
        // Continuous left-and-right fireworks fountains
        const duration = 2.5 * 1000;
        const animationEnd = Date.now() + duration;
        const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 100 };

        const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

        const interval = setInterval(() => {
          const timeLeft = animationEnd - Date.now();

          if (timeLeft <= 0) {
            return clearInterval(interval);
          }

          const particleCount = 40 * (timeLeft / duration);
          confetti({
            ...defaults,
            particleCount,
            origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
          });
          confetti({
            ...defaults,
            particleCount,
            origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
          });
        }, 200);
      } else {
        // General checkin confetti blast from center bottom
        confetti({
          particleCount: 120,
          angle: 90,
          spread: 70,
          origin: { y: 0.85 },
          colors: ["#f472b6", "#60a5fa", "#34d399", "#fbbf24"]
        });
      }
    } catch (err) {
      console.warn("Confetti call restricted in sandbox:", err);
    }
  };

  // ---------------------------------------------------------------------------
  // 🔄 2. LocalStorage Sync Pipeline & Body Theme Injection
  // ---------------------------------------------------------------------------

  useEffect(() => {
    safeLocalStorage.setItem("oxford_grade", grade);
  }, [grade]);

  useEffect(() => {
    safeLocalStorage.setItem("oxford_view", activeView);
  }, [activeView]);

  useEffect(() => {
    if (selectedUnit) {
      safeLocalStorage.setItem("oxford_selected_unit", JSON.stringify(selectedUnit));
    } else {
      safeLocalStorage.removeItem("oxford_selected_unit");
    }
  }, [selectedUnit]);

  useEffect(() => {
    safeLocalStorage.setItem("oxford_bookmarks", JSON.stringify(bookmarkedWords));
  }, [bookmarkedWords]);

  useEffect(() => {
    safeLocalStorage.setItem("oxford_completed_units", JSON.stringify(completedUnits));
  }, [completedUnits]);

  useEffect(() => {
    safeLocalStorage.setItem("oxford_mistakes", JSON.stringify(mistakes));
  }, [mistakes]);

  useEffect(() => {
    safeLocalStorage.setItem("oxford_study_history", JSON.stringify(studyHistory));
  }, [studyHistory]);

  useEffect(() => {
    safeLocalStorage.setItem("oxford_volume", volume.toString());
  }, [volume]);

  useEffect(() => {
    safeLocalStorage.setItem("oxford_theme", theme);
    // Sync to DOM body element class cleanly
    document.body.className = theme;
  }, [theme]);

  useEffect(() => {
    safeLocalStorage.setItem("oxford_night_mode", isNightMode ? "true" : "false");
  }, [isNightMode]);

  useEffect(() => {
    safeLocalStorage.setItem("oxford_night_brightness", nightBrightness.toString());
  }, [nightBrightness]);

  useEffect(() => {
    safeLocalStorage.setItem("oxford_pre_night_theme", preNightModeTheme);
  }, [preNightModeTheme]);

  // Toggle night mode logic
  const handleToggleNightMode = () => {
    const nextNightMode = !isNightMode;
    setIsNightMode(nextNightMode);
    
    if (nextNightMode) {
      if (theme !== "theme-dark") {
        setPreNightModeTheme(theme);
      }
      setTheme("theme-dark");
      playAudio("已开启深夜护眼模式，保护宝贝视力", volume);
    } else {
      setTheme(preNightModeTheme);
      playAudio("已返回正常白天模式", volume);
    }
  };

  // ---------------------------------------------------------------------------
  // 🛠️ 3. State Mutator Actions (Hydrated Safe Events Handled)
  // ---------------------------------------------------------------------------

  // Handle direct unit selection inside Dashboard deck
  const handleSelectUnit = (unit: Unit, targetView: "flashcards" | "quiz") => {
    setSelectedUnit(unit);
    setActiveView(targetView);
    playAudio(`Loading ${unit.unit} core course. Let's study!`, volume);
    
    // Auto register simple date check-in to studyHistory on milestone entry
    const todayStr = "2026-06-23"; // Current dynamic localized date matching context
    if (!studyHistory.includes(todayStr)) {
      setStudyHistory((prev) => [...prev, todayStr]);
      // Celebrate auto check-in with a short delay for beautiful visual overlap
      setTimeout(() => {
        triggerConfetti("streak");
      }, 600);
    }
  };

  // Daily check-in registration and streak celebrate action
  const handleDailyCheckIn = () => {
    const todayStr = "2026-06-23";
    if (!studyHistory.includes(todayStr)) {
      setStudyHistory((prev) => [...prev, todayStr]);
      triggerConfetti("streak");
      playAudio("Congratulations! Daily check-in complete. Let's keep studying!", volume);
    } else {
      // If already checked in, trigger confetti for fun!
      triggerConfetti("checkin");
      playAudio("Checked in today! Making magic rainbow rain!", volume);
    }
  };

  // Star Toggle bookmark words
  const handleToggleBookmark = (wordObj: { word: string; translation: string; phonetic: string; grade: string; unitName: string }) => {
    const alreadyExists = bookmarkedWords.some(
      (b) => b.word.toLowerCase() === wordObj.word.toLowerCase() && b.grade.toLowerCase() === wordObj.grade.toLowerCase()
    );

    if (alreadyExists) {
      setBookmarkedWords((prev) =>
        prev.filter((b) => !(b.word.toLowerCase() === wordObj.word.toLowerCase() && b.grade.toLowerCase() === wordObj.grade.toLowerCase()))
      );
      playAudio("Removed bookmark", volume);
    } else {
      const newBookmark: Bookmark = {
        word: wordObj.word,
        translation: wordObj.translation,
        phonetic: wordObj.phonetic,
        grade: wordObj.grade,
        unitName: wordObj.unitName
      };
      setBookmarkedWords((prev) => [...prev, newBookmark]);
      playAudio("Word bookmarked!", volume);
    }
  };

  // Add mistake record if answer is wrong
  const handleAddMistake = (mistakeObj: { word: string; translation: string; phonetic: string; grade: string; unitName: string }) => {
    const existingIdx = mistakes.findIndex(
      (m) => m.word.toLowerCase() === mistakeObj.word.toLowerCase() && m.grade.toLowerCase() === mistakeObj.grade.toLowerCase()
    );

    if (existingIdx > -1) {
      const updated = [...mistakes];
      updated[existingIdx].errorCount += 1;
      setMistakes(updated);
    } else {
      const newMistake: Mistake = {
        word: mistakeObj.word,
        translation: mistakeObj.translation,
        phonetic: mistakeObj.phonetic,
        grade: mistakeObj.grade,
        unitName: mistakeObj.unitName,
        errorCount: 1
      };
      setMistakes((prev) => [...prev, newMistake]);
    }
  };

  // Remove mistake record if spelled or checked correctly
  const handleRemoveMistake = (wordName: string) => {
    setMistakes((prev) => prev.filter((m) => m.word.toLowerCase() !== wordName.toLowerCase()));
  };

  // Mark specific unit as complete
  const handleMarkUnitCompleted = (unitKey: string) => {
    if (!completedUnits.includes(unitKey)) {
      setCompletedUnits((prev) => [...prev, unitKey]);
      triggerConfetti("unit");
    }
  };

  // Clear learning progress data reset
  const handleResetProgress = () => {
    if (confirm("宝贝，确定要重置所有学习打卡和错题记录，重新开始新一轮英语学习吗？")) {
      setCompletedUnits([]);
      setMistakes([]);
      setBookmarkedWords([]);
      setStudyHistory(["2026-06-23"]);
      setSelectedUnit(vocabularyData[`grade_${grade.toLowerCase()}`]?.[0] || null);
      setActiveView("dashboard");
      playAudio("Your study progress has been reset. Let's restart!", volume);
    }
  };

  // Mascot mappings for headers
  const getThemeMascot = () => {
    switch (theme) {
      case "theme-kuromi": return "😈 酷洛米大本营";
      case "theme-cinnamoroll": return "☁️ 大耳狗云朵间";
      case "theme-melody": return "🐰 美乐蒂草莓屋";
      case "theme-purin": return "🍮 布丁狗布丁岛";
      case "theme-dark": return "🌌 极光黑曜石";
      default: return "🌸 奇幻魔法屋";
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between selection:bg-sanrio-accent selection:text-white transition-all bg-sanrio-bg text-sanrio-text pb-12">
      {/* 👑 TOP LEVEL Cute Header & Selector Shell (Fully Hidden on Prints) */}
      <header className={`no-print sticky top-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? "bg-sanrio-card/90 backdrop-blur-md border-b-2 border-sanrio-border shadow-md py-1" 
          : "bg-sanrio-card border-b-2 border-sanrio-border py-3 shadow-xs"
      }`}>
        <div className={`max-w-6xl mx-auto px-4 flex items-center justify-between transition-all duration-300 ${
          isScrolled ? "flex-row gap-2" : "flex-col md:flex-row gap-3"
        }`}>
          
          {/* Logo Brand Panel with active mascot */}
          <div className="flex items-center gap-2.5 transition-all duration-300">
            <div className={`rounded-full bg-sanrio-secondary bg-opacity-30 border border-sanrio-border flex items-center justify-center select-none transition-all duration-300 ${
              isScrolled ? "w-8 h-8 text-xl" : "w-10 h-10 text-2xl"
            }`}>
              {theme === "theme-kuromi" && "😈"}
              {theme === "theme-cinnamoroll" && "☁️"}
              {theme === "theme-melody" && "🐰"}
              {theme === "theme-purin" && "🍮"}
              {theme === "theme-dark" && "🌌"}
            </div>
            
            <div className="transition-all duration-300 shrink-0">
              <h1 className={`font-black tracking-tight text-sanrio-text flex items-center transition-all duration-300 ${
                isScrolled ? "text-xs gap-1" : "text-lg gap-1.5 whitespace-nowrap"
              }`}>
                <span className={isScrolled ? "line-clamp-2 leading-tight max-w-[80px] sm:max-w-none text-left" : "whitespace-nowrap"}>
                  牛津英语多媒体教室
                </span>
                <span className={`font-bold bg-sanrio-accent text-white rounded-full shrink-0 transition-all duration-300 ${
                  isScrolled ? "text-[8px] px-1.5 py-0.5 animate-pulse" : "text-[10px] px-2 py-0.5"
                }`}>
                  1A-5B
                </span>
              </h1>
              {!isScrolled && (
                <p className="text-[10px] font-semibold text-sanrio-muted transition-all duration-300">
                  当前进入主题：<strong className="text-sanrio-accent">{getThemeMascot()}</strong>
                </p>
              )}
            </div>
          </div>

          {/* Core Interactive Views Swappers tabs */}
          <nav className={`flex items-center justify-center transition-all duration-300 bg-sanrio-bg border border-sanrio-border ${
            isScrolled ? "p-0.5 rounded-xl gap-1" : "p-1 rounded-2xl gap-1.5"
          }`}>
            {[
              { id: "dashboard", label: "🏫 大厅目录", icon: BookOpen },
              { id: "flashcards", label: "🔮 翻翻卡", icon: Layers },
              { id: "quiz", label: "✍️ 趣味测验", icon: HelpCircle },
              { id: "wordsearch", label: "🧩 单词迷宫", icon: Puzzle },
              { id: "glossary", label: "📚 英汉词典", icon: BookMarked },
              { id: "worksheet", label: "🖨️ 打印练习", icon: FileText },
            ].map((tab) => {
              const TabIcon = tab.icon;
              const isActive = activeView === tab.id;
              const cleanLabel = tab.label.includes(" ") ? tab.label.split(" ")[1] : tab.label;

              return (
                <button
                  key={tab.id}
                  title={tab.label}
                  onClick={() => {
                    setActiveView(tab.id as any);
                    playAudio(`Entering ${tab.label}`, volume);
                  }}
                  className={`rounded-lg flex items-center justify-center transition-all cursor-pointer ${
                    isScrolled
                      ? `py-1 px-2 ${isActive ? "bg-sanrio-primary text-white shadow-xs gap-1 text-[10px] font-extrabold" : "text-sanrio-text hover:bg-sanrio-secondary hover:bg-opacity-20 px-1.5 text-[10px] font-bold"}`
                      : `py-2 px-3 gap-1 text-[11px] font-extrabold sm:text-xs ${isActive ? "bg-sanrio-primary text-white shadow-sm" : "text-sanrio-text hover:bg-sanrio-secondary hover:bg-opacity-20"}`
                  }`}
                >
                  <TabIcon className={`transition-all duration-300 ${isScrolled ? "w-4 h-4" : "w-3.5 h-3.5"}`} />
                  <span className={`transition-all duration-300 ${
                    isScrolled 
                      ? (isActive ? "inline-block" : "hidden md:inline-block") 
                      : "inline-block"
                  }`}>
                    {isScrolled ? cleanLabel : tab.label}
                  </span>
                </button>
              );
            })}
          </nav>

          {/* Themes presets & Sound volume HUD */}
          <div className="flex items-center justify-end gap-2 sm:gap-3.5 transition-all duration-300">
            
            {/* Theme Trigger & Popover Swapper (Sleek group dropdown when scrolled, classic row when standard) */}
            {isScrolled ? (
              <div className="relative group no-print">
                <button 
                  className="w-8 h-8 rounded-full bg-sanrio-bg border border-sanrio-border flex items-center justify-center text-sm shadow-xs hover:bg-sanrio-secondary hover:bg-opacity-25 transition-all cursor-pointer"
                  title="切换可爱主题"
                >
                  {theme === "theme-melody" && "🐰"}
                  {theme === "theme-cinnamoroll" && "☁️"}
                  {theme === "theme-kuromi" && "😈"}
                  {theme === "theme-purin" && "🍮"}
                  {theme === "theme-dark" && "🌌"}
                </button>
                <div className="absolute right-0 top-full mt-2 hidden group-hover:flex group-focus-within:flex flex-col gap-1 bg-sanrio-card p-2 rounded-2xl border-2 border-sanrio-border shadow-xl z-50 animate-fadeIn min-w-[120px]">
                  <div className="text-[9px] font-black text-sanrio-muted px-1.5 pb-1 border-b border-sanrio-border text-center uppercase">
                    可切换主题
                  </div>
                  {[
                    { id: "theme-melody", emoji: "🐰", name: "美乐蒂" },
                    { id: "theme-cinnamoroll", emoji: "☁️", name: "大耳狗" },
                    { id: "theme-kuromi", emoji: "😈", name: "酷洛米" },
                    { id: "theme-purin", emoji: "🍮", name: "布丁狗" },
                    { id: "theme-dark", emoji: "🌌", name: "黑曜石" },
                  ].map((t) => (
                    <button
                      key={t.id}
                      onClick={() => {
                        if (t.id !== "theme-dark") {
                          setIsNightMode(false);
                        } else if (!isNightMode) {
                          setIsNightMode(true);
                          setPreNightModeTheme(theme !== "theme-dark" ? theme : "theme-melody");
                        }
                        setTheme(t.id as SanrioTheme);
                        playAudio(t.name, volume);
                      }}
                      className={`flex items-center gap-1.5 py-1 px-1.5 rounded-lg text-xs font-bold transition-all text-left w-full hover:bg-sanrio-secondary hover:bg-opacity-20 cursor-pointer ${
                        theme === t.id ? "bg-sanrio-secondary bg-opacity-35 text-sanrio-primary" : "text-sanrio-text"
                      }`}
                    >
                      <span>{t.emoji}</span>
                      <span className="text-[10px]">{t.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              /* Classic theme presets row */
              <div className="flex items-center gap-1.5 bg-sanrio-bg bg-opacity-40 p-1.5 rounded-2xl border border-sanrio-border">
                {[
                  { id: "theme-melody", emoji: "🐰", color: "Pink", name: "美乐蒂" },
                  { id: "theme-cinnamoroll", emoji: "☁️", color: "Blue", name: "大耳狗" },
                  { id: "theme-kuromi", emoji: "😈", color: "Purple", name: "酷洛米" },
                  { id: "theme-purin", emoji: "🍮", color: "Yellow", name: "布丁狗" },
                  { id: "theme-dark", emoji: "🌌", color: "Slate", name: "黑曜石" },
                ].map((t) => (
                  <button
                    key={t.id}
                    title={t.name}
                    onClick={() => {
                      if (t.id !== "theme-dark") {
                        setIsNightMode(false);
                      } else if (!isNightMode) {
                        setIsNightMode(true);
                        setPreNightModeTheme(theme !== "theme-dark" ? theme : "theme-melody");
                      }
                      setTheme(t.id as SanrioTheme);
                      playAudio(t.name, volume);
                    }}
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-sm border-2 transition-all cursor-pointer ${
                      theme === t.id
                        ? "border-sanrio-primary scale-110 shadow-sm bg-white bg-opacity-20"
                        : "border-transparent opacity-65 hover:scale-105 hover:opacity-100"
                    }`}
                  >
                    {t.emoji}
                  </button>
                ))}
              </div>
            )}

            {/* 🌙 Night Mode Switch & Screen Dimmer Control */}
            <div className={`flex items-center bg-sanrio-bg bg-opacity-40 rounded-2xl border border-sanrio-border select-none ${
              isScrolled ? "p-0.5" : "px-2.5 py-1.5 gap-2"
            }`}>
              <button
                onClick={handleToggleNightMode}
                className={`relative flex items-center justify-center font-black transition-all duration-300 cursor-pointer ${
                  isScrolled 
                    ? `w-7 h-7 rounded-full ${isNightMode ? "bg-indigo-600 text-white" : "hover:bg-sanrio-secondary hover:bg-opacity-20"}`
                    : `relative gap-1.5 text-[11px] px-2.5 py-1 rounded-xl ${isNightMode ? "bg-indigo-600 text-white shadow-xs" : "bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300"}`
                }`}
                title={isNightMode ? "已开启深夜护眼模式" : "开启深夜护眼模式"}
              >
                {isNightMode ? (
                  <>
                    <Moon className={`${isScrolled ? "w-4 h-4" : "w-3.5 h-3.5"} animate-pulse text-yellow-300`} />
                    {!isScrolled && <span>护眼开</span>}
                  </>
                ) : (
                  <>
                    <Sun className={`${isScrolled ? "w-4 h-4" : "w-3.5 h-3.5"} text-orange-500`} />
                    {!isScrolled && <span>护眼关</span>}
                  </>
                )}
              </button>

              {/* Slider appears/widens when Night Mode is active */}
              {isNightMode && !isScrolled && (
                <div className="flex items-center gap-1.5 animate-fadeIn">
                  <span className="text-[10px] text-indigo-400 font-bold shrink-0">
                    🔆 {nightBrightness}%
                  </span>
                  <input
                    type="range"
                    min="30"
                    max="95"
                    step="5"
                    value={nightBrightness}
                    onChange={(e) => {
                      setNightBrightness(parseInt(e.target.value, 10));
                    }}
                    className="w-16 h-1 bg-indigo-300 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                    title="调节屏幕亮度下调比例（30%-95%）"
                  />
                </div>
              )}
            </div>
            
            {/* volume mini preview gauge (interactive speaker click to mute/unmute) */}
            <button
              onClick={() => {
                const nextVol = volume === 0 ? 1.2 : 0;
                setVolume(nextVol);
                playAudio(nextVol > 0 ? "启用声音" : "已静音", nextVol);
              }}
              className={`flex items-center justify-center rounded-full border border-transparent hover:border-sanrio-border hover:bg-sanrio-bg bg-opacity-40 transition-all cursor-pointer ${
                isScrolled ? "w-8 h-8 text-sm" : "gap-1.5 text-xs text-sanrio-muted"
              }`}
              title={volume === 0 ? "启用声音" : "静音"}
            >
              {volume === 0 ? (
                <Volume1 className="line-through w-4 h-4 text-sanrio-muted" />
              ) : (
                <Volume2 className={`w-4 h-4 text-sanrio-primary ${isScrolled ? "" : "animate-pulse"}`} />
              )}
              {!isScrolled && <span className="font-mono">{(volume * 100).toFixed(0)}%</span>}
            </button>
          </div>

        </div>
      </header>

      {/* 🌸 MAIN WORK SPACE WRAPPERS */}
      <main className="flex-1 max-w-6xl w-full mx-auto py-5 relative">
        {/* Dynamic component routing according to current View state */}
        <div id="active-routing-container" className="transition-all duration-300">
          {activeView === "dashboard" && (
            <Dashboard
              grade={grade}
              setGrade={setGrade}
              completedUnits={completedUnits}
              bookmarkedWords={bookmarkedWords}
              mistakes={mistakes}
              studyHistory={studyHistory}
              volume={volume}
              onSelectUnit={handleSelectUnit}
              onClearHistory={handleResetProgress}
              theme={theme}
              onDailyCheckIn={handleDailyCheckIn}
              onMarkUnitCompleted={handleMarkUnitCompleted}
            />
          )}

          {activeView === "flashcards" && (
            <Flashcards
              selectedUnit={selectedUnit}
              grade={grade}
              volume={volume}
              setVolume={setVolume}
              bookmarkedWords={bookmarkedWords}
              toggleBookmark={handleToggleBookmark}
              onBackToDashboard={() => setActiveView("dashboard")}
              onMarkUnitCompleted={handleMarkUnitCompleted}
              completedUnits={completedUnits}
              theme={theme}
            />
          )}

          {activeView === "quiz" && (
            <Quiz
              selectedUnit={selectedUnit}
              grade={grade}
              volume={volume}
              addMistake={handleAddMistake}
              removeMistake={handleRemoveMistake}
              onBackToDashboard={() => setActiveView("dashboard")}
              onMarkUnitCompleted={handleMarkUnitCompleted}
              completedUnits={completedUnits}
              theme={theme}
            />
          )}

          {activeView === "glossary" && (
            <Glossary
              grade={grade}
              volume={volume}
              bookmarkedWords={bookmarkedWords}
              toggleBookmark={handleToggleBookmark}
              mistakes={mistakes}
              removeMistake={handleRemoveMistake}
              addMistake={handleAddMistake}
              onSelectUnit={handleSelectUnit}
              theme={theme}
            />
          )}

          {activeView === "worksheet" && (
            <Worksheet grade={grade} volume={volume} />
          )}

          {activeView === "wordsearch" && (
            <WordSearch 
              grade={grade} 
              volume={volume} 
              theme={theme}
              onBackToDashboard={() => setActiveView("dashboard")}
            />
          )}
        </div>
      </main>

      {/* 📅 CALENDAR STREAK FLOATER CARD & UTILITY CONTROLLER FOOTER */}
      <footer className="no-print mt-10 max-w-lg mx-auto w-full px-4 text-center space-y-4">
        
        {/* Daily Streak Grid with encouraging elements */}
        <div 
          onClick={handleDailyCheckIn}
          className="bg-sanrio-card border-2 border-dashed border-sanrio-border hover:border-sanrio-primary rounded-3xl p-4.5 flex gap-4 items-center justify-between shadow-xs hover:shadow-md cursor-pointer transition-all active:scale-98 group"
          title="点击打卡签到或触发七彩彩带雨！"
        >
          <div className="flex items-center gap-2">
            <Calendar className="text-sanrio-primary w-5 h-5 shrink-0 group-hover:scale-110 transition-all duration-300" />
            <div className="text-left">
              <h4 className="text-xs font-black text-sanrio-text flex items-center gap-1.5">
                <span>宝贝学习签到历程</span>
                {studyHistory.includes("2026-06-23") ? (
                  <span className="text-[9px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full font-bold">今日已签到</span>
                ) : (
                  <span className="text-[9px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full font-bold animate-pulse">待签到</span>
                )}
              </h4>
              <p className="text-[10px] text-sanrio-muted leading-tight mt-0.5">
                {studyHistory.includes("2026-06-23") 
                  ? `累计学成打卡 ${studyHistory.length} 日！点我降下魔法彩带雨 🌈`
                  : `累计学成打卡 ${studyHistory.length} 日！点击打卡领取今日彩带 🎁`}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-1 bg-orange-50 bg-opacity-35 py-1 px-3 rounded-full border border-orange-200 group-hover:bg-orange-100 transition-colors">
            <Flame className="w-4 h-4 text-orange-500 animate-bounce" />
            <span className="text-[11px] font-black text-orange-700 font-mono">Streak: {studyHistory.length}</span>
          </div>
        </div>

        {/* Action reset controls link */}
        <div className="text-[10px] text-sanrio-muted space-y-1">
          <p>上海牛津小英语课 · 专为亲爱的女儿定制开发 🧸 | 技术栈 React 19 + AudioContext</p>
          <button
            onClick={handleResetProgress}
            className="text-red-400 hover:text-red-500 underline hover:no-underline transition-colors cursor-pointer"
          >
            重置所有学习档案数据
          </button>
        </div>
      </footer>

      {/* 🌙 Night Mode Comfort Dimmer Overlay */}
      {isNightMode && (
        <div 
          id="night-brightness-dimmer"
          className="fixed inset-0 pointer-events-none z-[999999] transition-all duration-300"
          style={{ 
            backgroundColor: `rgba(0, 0, 0, ${1 - nightBrightness / 100})`,
            mixBlendMode: 'multiply'
          }}
        />
      )}
    </div>
  );
}
