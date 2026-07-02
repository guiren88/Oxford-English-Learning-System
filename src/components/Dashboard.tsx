import React, { useState, useEffect } from "react";
import { Unit } from "../data/vocabulary";
import { vocabularyData } from "../data/vocabulary";
import { 
  BookOpen, Star, Calendar, Smile, ArrowRight, CheckCircle, 
  GraduationCap, ChevronDown, ChevronUp, RefreshCw, Trophy, 
  Sparkles, Award, Lock, Flame, Heart, BarChart3, Check, X,
  Bell, Clock
} from "lucide-react";
import confetti from "canvas-confetti";
import { playAudio } from "../utils/audio";
import { D3ProgressTrajectory } from "./D3ProgressTrajectory";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell
} from "recharts";

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

interface DashboardProps {
  grade: string;
  setGrade: (g: string) => void;
  completedUnits: string[];
  bookmarkedWords: any[];
  mistakes: any[];
  studyHistory: string[];
  volume: number;
  onSelectUnit: (unit: Unit, view: "flashcards" | "quiz") => void;
  onClearHistory?: () => void;
  theme: string;
  onDailyCheckIn: () => void;
  onMarkUnitCompleted?: (unitKey: string) => void;
}

export function Dashboard({
  grade,
  setGrade,
  completedUnits,
  bookmarkedWords,
  mistakes,
  studyHistory,
  volume,
  onSelectUnit,
  onClearHistory,
  theme,
  onDailyCheckIn,
  onMarkUnitCompleted
}: DashboardProps) {
  // Sub-tab selection inside Dashboard: units vs achievements vs weekly report
  const [activeSubTab, setActiveSubTab] = useState<"units" | "achievements" | "weekly_report">("units");

  // Track unit progress percentages
  const [unitProgress, setUnitProgress] = useState<{ [key: string]: number }>(() => {
    const saved = safeLocalStorage.getItem("oxford_unit_progress_map");
    try {
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const [celebratingUnit, setCelebratingUnit] = useState<Unit | null>(null);

  // Helper to fetch unit progress percentage
  const getUnitProgressPercentage = (completedKey: string) => {
    if (completedUnits.includes(completedKey)) {
      return 100;
    }
    return unitProgress[completedKey] || 0;
  };

  // Helper to handle and save progress upgrades
  const handleUpdateProgress = (completedKey: string, nextProg: number, unitObj: Unit) => {
    const updated = { ...unitProgress, [completedKey]: nextProg };
    setUnitProgress(updated);
    safeLocalStorage.setItem("oxford_unit_progress_map", JSON.stringify(updated));

    if (nextProg === 100 && !completedUnits.includes(completedKey)) {
      setCelebratingUnit(unitObj);
      if (onMarkUnitCompleted) {
        onMarkUnitCompleted(completedKey);
      }
    }
  };

  // State to store which stickers have been placed on the user's custom desk
  const [placedStickers, setPlacedStickers] = useState<string[]>(() => {
    const saved = safeLocalStorage.getItem("sanrio_placed_stickers");
    try {
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const handleTogglePlaceSticker = (id: string, name: string) => {
    let updated;
    const isPlaced = placedStickers.includes(id);
    if (isPlaced) {
      updated = placedStickers.filter(item => item !== id);
      playAudio(`Sticker ${name} removed from your journal desk.`, volume);
    } else {
      updated = [...placedStickers, id];
      playAudio(`Sweet! You pasted the ${name} sticker onto your study desk!`, volume);
      try {
        confetti({
          particleCount: 60,
          spread: 80,
          origin: { y: 0.8 },
          colors: ["#a78bfa", "#f472b6", "#fbbf24", "#60a5fa"]
        });
      } catch (e) {}
    }
    setPlacedStickers(updated);
    safeLocalStorage.setItem("sanrio_placed_stickers", JSON.stringify(updated));
  };

  // Play congratulations audio and blast confetti when celebratingUnit is activated
  useEffect(() => {
    if (!celebratingUnit) return;

    // Determine the enGreeting based on active theme
    let textToSpeak = "Yay! Congratulations, darling! My Melody sends you sweet strawberries and a shiny 100% badge!";
    switch (theme) {
      case "theme-kuromi":
        textToSpeak = "Hehe! I knew you could do it! Kuromi presents you a stellar Pumpkin candy! You are the absolute best!";
        break;
      case "theme-cinnamoroll":
        textToSpeak = "Wow! You are soaring so high like a fluffy cloud! 100% completion achieved! Spectacular!";
        break;
      case "theme-purin":
        textToSpeak = "Munch munch! Delicious progress! Pompompurin shares a golden caramel pudding with you! Bravo!";
        break;
      case "theme-dark":
        textToSpeak = "Cosmic triumph! You have unlocked the golden interstellar badge. A stellar milestone!";
        break;
    }

    playAudio(textToSpeak, volume);

    try {
      // Blast magnificent unit-completion confetti!
      confetti({
        particleCount: 150,
        spread: 90,
        origin: { y: 0.5 },
        colors: ["#ff7b93", "#ffc2cd", "#7bc9ff", "#ffe27b", "#34d399"]
      });
    } catch (e) {
      console.warn("Confetti blocked in iframe environment:", e);
    }
  }, [celebratingUnit, theme, volume]);

  // Collapse/Expand high grades (Grades 3, 4, 4B, 5 etc.)
  const isHighGradeActive = ["3a", "3b", "4a", "4b", "5a", "5b"].includes(grade.toLowerCase());
  const [expandHighGrades, setExpandHighGrades] = useState(isHighGradeActive);

  // Simple local storage-based time check and reminder states
  const [reminderHour, setReminderHour] = useState<number>(() => {
    const saved = safeLocalStorage.getItem("oxford_reminder_hour");
    return saved ? parseInt(saved, 10) : 18; // Default reminder at 18:00 (6 PM)
  });

  const [isReminderDismissed, setIsReminderDismissed] = useState<boolean>(() => {
    return safeLocalStorage.getItem("oxford_reminder_dismissed_date") === "2026-06-23";
  });

  const currentHour = new Date().getHours();
  const isPastReminderHour = currentHour >= reminderHour;
  const isCheckedInToday = studyHistory.includes("2026-06-23");
  const shouldShowReminder = !isCheckedInToday && isPastReminderHour && !isReminderDismissed;

  const handleDismissReminder = () => {
    safeLocalStorage.setItem("oxford_reminder_dismissed_date", "2026-06-23");
    setIsReminderDismissed(true);
    playAudio("今日提醒已关闭，别忘了今天稍后打卡哦！", volume);
  };

  const handleUpdateReminderHour = (hour: number) => {
    safeLocalStorage.setItem("oxford_reminder_hour", hour.toString());
    setReminderHour(hour);
    playAudio(`打卡提醒时间已设置为每天 ${hour} 点！`, volume);
  };

  // --- 🎯 Daily Study Goal State & Actions ---
  const getTodayDateString = () => {
    try {
      return new Date().toISOString().split('T')[0];
    } catch {
      return "2026-06-24";
    }
  };

  const [dailyGoalTarget, setDailyGoalTarget] = useState<number>(() => {
    const saved = safeLocalStorage.getItem("oxford_daily_goal_target");
    return saved ? parseInt(saved, 10) : 10;
  });

  const [dailyGoalCount, setDailyGoalCount] = useState<number>(() => {
    const todayStr = getTodayDateString();
    const savedDate = safeLocalStorage.getItem("oxford_daily_goal_date");
    if (savedDate !== todayStr) {
      safeLocalStorage.setItem("oxford_daily_goal_date", todayStr);
      safeLocalStorage.setItem("oxford_daily_goal_count", "0");
      return 0;
    }
    const savedCount = safeLocalStorage.getItem("oxford_daily_goal_count");
    return savedCount ? parseInt(savedCount, 10) : 0;
  });

  const [celebratedGoalToday, setCelebratedGoalToday] = useState<boolean>(() => {
    const todayStr = getTodayDateString();
    const savedCelebDate = safeLocalStorage.getItem("oxford_daily_goal_celebrated_date");
    return savedCelebDate === todayStr;
  });

  const handleIncrementGoalCount = (amount: number = 1) => {
    setDailyGoalCount((prev) => {
      const nextCount = prev + amount;
      safeLocalStorage.setItem("oxford_daily_goal_count", nextCount.toString());
      safeLocalStorage.setItem("oxford_daily_goal_date", getTodayDateString());

      if (nextCount >= dailyGoalTarget && !celebratedGoalToday) {
        setCelebratedGoalToday(true);
        safeLocalStorage.setItem("oxford_daily_goal_celebrated_date", getTodayDateString());

        let congratsText = "Wow! You achieved your daily word practice goal! My Melody is so proud of you, strawberry sweetheart!";
        switch (theme) {
          case "theme-kuromi":
            congratsText = "Hmph, you actually did it! Kuromi is impressed! Here is a black velvet star for completing your daily goal! Keep rockin'!";
            break;
          case "theme-cinnamoroll":
            congratsText = "Floating on cloud nine! You reached your daily study target! Cinnamoroll is doing a happy spin in the sky!";
            break;
          case "theme-purin":
            congratsText = "Bravo! Daily study goal conquered! Pompompurin presents you a golden cherry-topped caramel pudding! Delicious!";
            break;
          case "theme-dark":
            congratsText = "Mission accomplished! You have successfully aligned today's constellations by reaching your daily study target. Outstanding exploration!";
            break;
        }
        playAudio(congratsText, volume);

        try {
          confetti({
            particleCount: 120,
            spread: 80,
            origin: { y: 0.6 },
            colors: ["#3b82f6", "#10b981", "#fbbf24", "#f472b6", "#8b5cf6"]
          });
        } catch {}
      } else {
        if (nextCount < dailyGoalTarget) {
          playAudio(`Practiced ${nextCount} words! Keep going, sweetheart!`, volume);
        }
      }

      return nextCount;
    });
  };

  const handleUpdateGoalTarget = (newTarget: number) => {
    const targetVal = Math.max(1, Math.min(100, newTarget));
    setDailyGoalTarget(targetVal);
    safeLocalStorage.setItem("oxford_daily_goal_target", targetVal.toString());
    playAudio(`Daily target set to ${targetVal} words. You can do it!`, volume);

    if (dailyGoalCount < targetVal) {
      setCelebratedGoalToday(false);
      safeLocalStorage.removeItem("oxford_daily_goal_celebrated_date");
    }
  };

  // Divide grade token into base number (1, 2, 3...) and term (a, b)
  const currentGradeNum = grade.charAt(0); // '1', '2', etc.
  const currentTerm = grade.charAt(1).toLowerCase(); // 'a', 'b'

  const handleGradeChange = (num: string, term: string) => {
    const nextGrade = `${num}${term}`;
    setGrade(nextGrade);
  };

  // Helper to map active Sanrio theme to matching chart hex colors
  const getThemeChartColors = (t: string) => {
    switch (t) {
      case "theme-kuromi":
        return {
          barColor: "#a855f7", // Purple
          emptyBarColor: "#f3e8ff", // Light purple
          gridColor: "#f5f3ff",
          textFill: "#7e22ce"
        };
      case "theme-cinnamoroll":
        return {
          barColor: "#38bdf8", // Sky blue
          emptyBarColor: "#e0f2fe", // Light sky blue
          gridColor: "#f0f9ff",
          textFill: "#0369a1"
        };
      case "theme-purin":
        return {
          barColor: "#eab308", // Yellow / amber
          emptyBarColor: "#fef9c3", // Light yellow
          gridColor: "#fefdf0",
          textFill: "#854d0e"
        };
      case "theme-dark":
        return {
          barColor: "#64748b", // Slate
          emptyBarColor: "#1e293b", // Dark slate empty bar
          gridColor: "#334155",
          textFill: "#94a3b8"
        };
      case "theme-melody":
      default:
        return {
          barColor: "#ec4899", // Pink
          emptyBarColor: "#fce7f3", // Light pink
          gridColor: "#fff1f2",
          textFill: "#be185d"
        };
    }
  };

  // Helper to map active Sanrio theme to matching reminder card styles & personalized character warnings
  const getReminderThemeStyles = (t: string) => {
    switch (t) {
      case "theme-kuromi":
        return {
          bg: "bg-purple-50 border-purple-200 dark:bg-purple-950 dark:bg-opacity-20 dark:border-purple-900",
          text: "text-purple-950 dark:text-purple-100",
          muted: "text-purple-600 dark:text-purple-300",
          accent: "bg-purple-600 hover:bg-purple-700 text-white shadow-purple-200",
          iconColor: "text-purple-500 dark:text-purple-400",
          characterEmoji: "😈",
          characterName: "酷洛米 (Kuromi)",
          message: "喂！大懒虫！酷洛米傲娇地哼了一声：现在已经到你设置的督促时间了，怎么还没打卡？还不快点过来学英语，一键打卡给我看！⚡😈"
        };
      case "theme-cinnamoroll":
        return {
          bg: "bg-sky-50 border-sky-200 dark:bg-sky-950 dark:bg-opacity-20 dark:border-sky-900",
          text: "text-sky-950 dark:text-sky-100",
          muted: "text-sky-600 dark:text-sky-300",
          accent: "bg-sky-500 hover:bg-sky-600 text-white shadow-sky-200",
          iconColor: "text-sky-500 dark:text-sky-400",
          characterEmoji: "☁️",
          characterName: "大耳狗 (Cinnamoroll)",
          message: "呼~ 大耳狗坐着云朵来敲门啦！已经到学习时间啦，今天还没在云端留下打卡脚印呢。一键打卡，今天也要元气满满！☁️✨"
        };
      case "theme-purin":
        return {
          bg: "bg-amber-50 border-amber-200 dark:bg-amber-950 dark:bg-opacity-20 dark:border-amber-900",
          text: "text-amber-950 dark:text-amber-100",
          muted: "text-amber-700 dark:text-amber-300",
          accent: "bg-amber-500 hover:bg-amber-600 text-white shadow-amber-200",
          iconColor: "text-amber-600 dark:text-amber-400",
          characterEmoji: "🍮",
          characterName: "布丁狗 (Pompompurin)",
          message: "汪汪！布丁狗摇着尾巴提醒你：肚子要吃饱，英语也要学好！现在已经不早啦，快来点击一键打卡，领取今天的甜甜焦糖布丁奖励！🍮🐾"
        };
      case "theme-dark":
        return {
          bg: "bg-slate-900 border-slate-700",
          text: "text-slate-100",
          muted: "text-slate-400",
          accent: "bg-indigo-600 hover:bg-indigo-700 text-white shadow-slate-900",
          iconColor: "text-indigo-400",
          characterEmoji: "🌌",
          characterName: "星空精灵 (Star Spirit)",
          message: "流星划过夜空！深邃黑曜石里的精灵提醒你：设定时间已至，今天的英语探索之旅尚未打卡。让我们点击一键打卡，点亮属于你的璀璨星轨！🌌✨"
        };
      case "theme-melody":
      default:
        return {
          bg: "bg-rose-50 border-rose-200 dark:bg-rose-950 dark:bg-opacity-20 dark:border-rose-900",
          text: "text-rose-950 dark:text-rose-100",
          muted: "text-rose-600 dark:text-rose-300",
          accent: "bg-rose-500 hover:bg-rose-600 text-white shadow-rose-200",
          iconColor: "text-rose-500 dark:text-rose-400",
          characterEmoji: "🐰",
          characterName: "美乐蒂 (My Melody)",
          message: "叮咚！美乐蒂提醒你：已经过了设置的提醒时间啦，今天的英语卡片还没学习打卡哟！快来戳我一键打卡签到，一起变得棒棒哒！🍓🌸"
        };
    }
  };

  // Generate dynamic 7-day trailing week activity data based on studyHistory
  const getWeeklyReportData = () => {
    const data = [];
    const today = new Date();
    const daysOfWeek = ["周日 Sun", "周一 Mon", "周二 Tue", "周三 Wed", "周四 Thu", "周五 Fri", "周六 Sat"];

    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(today.getDate() - i);

      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const dateVal = String(d.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${dateVal}`;

      const dayName = daysOfWeek[d.getDay()];
      const isStudied = studyHistory.includes(dateStr);

      data.push({
        dayName,
        dateStr,
        shortDate: `${month}/${dateVal}`,
        // Scale binary studied status to an aesthetic visual height
        "学习打卡": isStudied ? 100 : 20,
        studied: isStudied,
      });
    }
    return data;
  };

  const activeBooks = vocabularyData[`grade_${grade.toLowerCase()}`] || [];

  // Streak Calculation
  const streakCount = studyHistory.length > 0 ? studyHistory.length : 0;

  // Sanrio-themed Achievements List mapped dynamically to current state
  const achievements = [
    {
      id: "sparkly-start",
      title: "Hello Kitty 璀璨起航",
      englishTitle: "Kitty's Sparkly Start",
      description: "小试牛刀！完成你在英语王国的第一个单元测试！",
      requirementText: "完成 1 个单元的随堂测验",
      character: "Hello Kitty 🐱",
      characterEmoji: "🐱",
      badgeEmoji: "🌸",
      unlocked: completedUnits.length >= 1,
      currentProgress: completedUnits.length,
      targetProgress: 1,
      colorClass: "from-rose-50 to-pink-100 border-pink-200 text-pink-700",
      accentColor: "bg-rose-500",
      voiceMessage: "Congratulations! Hello Kitty is so proud of your first step in English adventure! You are brilliant!"
    },
    {
      id: "cloud-walker",
      title: "大耳狗云端漫步",
      englishTitle: "Cinnamoroll's Cloud Walker",
      description: "在云端快乐翱翔！累计完成 3 天的学习签到打卡吧！",
      requirementText: "打卡学习累计达到 3 天",
      character: "Cinnamoroll ☁️",
      characterEmoji: "☁️",
      badgeEmoji: "☁️",
      unlocked: streakCount >= 3,
      currentProgress: streakCount,
      targetProgress: 3,
      colorClass: "from-sky-50 to-blue-100 border-blue-200 text-blue-700",
      accentColor: "bg-sky-400",
      voiceMessage: "Wow, three days in a row! You are floating high like a happy cloud. Cinnamoroll loves studying with you!"
    },
    {
      id: "pudding-master",
      title: "布丁狗黄金卫士",
      englishTitle: "Pompompurin's Pudding Master",
      description: "黄金布丁般的毅力！坚持打卡学习满 7 天！",
      requirementText: "打卡学习累计达到 7 天",
      character: "Pompompurin 🍮",
      characterEmoji: "🍮",
      badgeEmoji: "🍮",
      unlocked: streakCount >= 7,
      currentProgress: streakCount,
      targetProgress: 7,
      colorClass: "from-yellow-50 to-amber-100 border-amber-200 text-amber-800",
      accentColor: "bg-amber-500",
      voiceMessage: "Amazing study streak! Seven whole days! Pompompurin is doing a happy pudding wiggle for you!"
    },
    {
      id: "strawberry-collector",
      title: "美乐蒂红星收藏家",
      englishTitle: "Melody's Strawberry Collector",
      description: "遇到不会的词先加收藏！收藏至少 5 个难点单词吧！",
      requirementText: "红星收藏至少 5 个单词",
      character: "My Melody 🐰",
      characterEmoji: "🐰",
      badgeEmoji: "🍓",
      unlocked: bookmarkedWords.length >= 5,
      currentProgress: bookmarkedWords.length,
      targetProgress: 5,
      colorClass: "from-rose-50 to-red-100 border-pink-200 text-pink-700",
      accentColor: "bg-pink-500",
      voiceMessage: "You starred five words! Collecting words is like picking sweet strawberries. My Melody is super happy!"
    },
    {
      id: "cheeky-pioneer",
      title: "酷洛米傲娇先锋",
      englishTitle: "Kuromi's Cheeky Pioneer",
      description: "实力拉满！累计通过 3 个单元的测试，超级厉害！",
      requirementText: "完成至少 3 个单元的随堂测验",
      character: "Kuromi 😈",
      characterEmoji: "😈",
      badgeEmoji: "⚡",
      unlocked: completedUnits.length >= 3,
      currentProgress: completedUnits.length,
      targetProgress: 3,
      colorClass: "from-purple-50 to-fuchsia-100 border-fuchsia-200 text-fuchsia-800",
      accentColor: "bg-purple-500",
      voiceMessage: "Hmph! Three units completed? That is pretty cool! Kuromi thinks you are an awesome challenger!"
    },
    {
      id: "galaxy-explorer",
      title: "双子星星际探险家",
      englishTitle: "Little Twin Stars' Galaxy Explorer",
      description: "挑战更上一层楼！切换并开启三年级、四年级或五年级的课本！",
      requirementText: "当前或曾经切换至 3-5 年级段学习",
      character: "Little Twin Stars ⭐",
      characterEmoji: "⭐",
      badgeEmoji: "✨",
      unlocked: ["3a", "3b", "4a", "4b", "5a", "5b"].includes(grade.toLowerCase()) || completedUnits.some(k => k.startsWith("3") || k.startsWith("4") || k.startsWith("5")),
      currentProgress: (["3a", "3b", "4a", "4b", "5a", "5b"].includes(grade.toLowerCase()) || completedUnits.some(k => k.startsWith("3") || k.startsWith("4") || k.startsWith("5"))) ? 1 : 0,
      targetProgress: 1,
      colorClass: "from-teal-50 to-indigo-100 border-indigo-200 text-indigo-700",
      accentColor: "bg-indigo-500",
      voiceMessage: "You are exploring advanced English books! The stars are shining bright for you. Keep up the high grade adventure!"
    },
    {
      id: "clean-runner",
      title: "帕恰狗无瑕小飞侠",
      englishTitle: "Pochacco's Clean Runner",
      description: "极致完美！完成至少一个单元测试，且当前错题本错题清空为 0！",
      requirementText: "通关 1 个以上单元 且 当前错题数为 0",
      character: "Pochacco 🐶",
      characterEmoji: "🐶",
      badgeEmoji: "🏃",
      unlocked: completedUnits.length >= 1 && mistakes.length === 0,
      currentProgress: (completedUnits.length >= 1 && mistakes.length === 0) ? 1 : 0,
      targetProgress: 1,
      colorClass: "from-emerald-50 to-green-100 border-green-200 text-green-800",
      accentColor: "bg-emerald-500",
      voiceMessage: "Awesome! Your mistake book is completely clean! Pochacco is running and jumping with absolute joy!"
    },
    {
      id: "frog-master",
      title: "大眼蛙池塘歌唱家",
      englishTitle: "Keroppi's Pond Master",
      description: "英语大师！通关单元总数达到 6 个，英语说得像池塘协奏曲一样动听！",
      requirementText: "通关累计达到 6 个单元",
      character: "Keroppi 🐸",
      characterEmoji: "🐸",
      badgeEmoji: "🎵",
      unlocked: completedUnits.length >= 6,
      currentProgress: completedUnits.length,
      targetProgress: 6,
      colorClass: "from-lime-50 to-emerald-100 border-emerald-200 text-emerald-800",
      accentColor: "bg-lime-500",
      voiceMessage: "Six units completed! Ribbit, ribbit! Your English sounds as beautiful as a pond concert. Keroppi is singing along!"
    },
    {
      id: "vocabulary-master",
      title: "大耳狗词汇大宗师贴纸",
      englishTitle: "Cinnamoroll's Vocabulary Master",
      description: "词汇小超人！累计学习并通关 2 个或以上的英语单元测试，积累起丰富的单词大本营！",
      requirementText: "累计通关英语随堂测验数 >= 2",
      character: "Cinnamoroll ☁️",
      characterEmoji: "☁️",
      badgeEmoji: "🏆",
      unlocked: completedUnits.length >= 2,
      currentProgress: completedUnits.length,
      targetProgress: 2,
      colorClass: "from-sky-50 to-blue-100 border-blue-200 text-blue-700",
      accentColor: "bg-sky-500",
      voiceMessage: "Splendid! You have unlocked Cinnamoroll's Vocabulary Master sticker! Your vocabulary knowledge is absolutely incredible, darling!",
      isSticker: true,
      stickerName: "Vocabulary Master ✨"
    },
    {
      id: "quiz-whiz",
      title: "酷洛米测验小霸王贴纸",
      englishTitle: "Kuromi's Quiz Whiz",
      description: "测验智多星！累计通关至少 1 个单元测试，且当前错题本错题极少，精准度惊人！",
      requirementText: "通关 1 个以上单元 且 当前错题数 <= 2",
      character: "Kuromi 😈",
      characterEmoji: "😈",
      badgeEmoji: "🎨",
      unlocked: completedUnits.length >= 1 && mistakes.length <= 2,
      currentProgress: completedUnits.length >= 1 ? (mistakes.length <= 2 ? 1 : 0) : 0,
      targetProgress: 1,
      colorClass: "from-purple-50 to-fuchsia-100 border-fuchsia-200 text-fuchsia-800",
      accentColor: "bg-purple-500",
      voiceMessage: "Woohoo! You have unlocked the Kuromi Quiz Whiz sticker! What a flawless brain you have there!",
      isSticker: true,
      stickerName: "Quiz Whiz ⭐"
    }
  ];

  const unlockedCount = achievements.filter(a => a.unlocked).length;

  // Grade labels for translations
  const getGradeNameCN = (g: string) => {
    switch (g.toLowerCase()) {
      case "1a": return "一年级 上册 (1A)";
      case "1b": return "一年级 下册 (1B)";
      case "2a": return "二年级 上册 (2A)";
      case "2b": return "二年级 下册 (2B)";
      case "3a": return "三年级 上册 (3A)";
      case "3b": return "三年级 下册 (3B)";
      case "4a": return "四年级 上册 (4A)";
      case "4b": return "四年级 下册 (4B)";
      case "5a": return "五年级 上册 (5A)";
      case "5b": return "五年级 下册 (5B)";
      default: return g;
    }
  };

  // Sound play greeting
  const playGreeting = () => {
    playAudio("Welcome to your English study class! You are doing amazing!", volume);
  };

  return (
    <div id="dashboard-container" className="space-y-8 max-w-5xl mx-auto px-4 py-2">
      {/* 🚀 Welcome Hero Banner */}
      <div 
        id="hero-banner"
        className="relative overflow-hidden rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 transition-all duration-300 shadow-md border-2 border-sanrio-border bg-sanrio-card hover:shadow-lg"
      >
        <div className="space-y-3 text-center md:text-left z-10">
          <div className="inline-flex items-center gap-2 bg-sanrio-secondary bg-opacity-40 px-3 py-1 rounded-full text-xs font-semibold text-sanrio-accent border border-sanrio-border">
            <Sparkles className="w-3 h-3 animate-pulse" />
            <span>牛津小学英语核心课程 💡</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-sanrio-text">
            你好，可爱的小宝贝！🌸
          </h1>
          <p className="text-sm max-w-md text-sanrio-muted leading-relaxed">
            今天是原气满满的学习日！这里收集了 <strong className="text-sanrio-accent">{getGradeNameCN(grade)}</strong> 的精选单词和好玩句型，让我们和小动物一起大声朗读吧！
          </p>
          <button
            onClick={playGreeting}
            className="inline-flex items-center gap-2 text-xs font-medium px-4 py-2 rounded-full cursor-pointer transition-all bg-sanrio-primary text-white hover:opacity-90 active:scale-95"
          >
            <Smile className="w-4 h-4" />
            <span>听听老师的声音 🗣️</span>
          </button>
        </div>

        {/* Dynamic cute Sanrio Mascot placeholder using stylized CSS to fit any of the 5 visual palettes cleanly */}
        <div className="relative w-28 h-28 flex items-center justify-center rounded-2xl bg-sanrio-secondary bg-opacity-20 border border-sanrio-border animate-bounce duration-1000">
          <span className="text-6xl select-none">
            {theme === "theme-kuromi" && "😈"}
            {theme === "theme-cinnamoroll" && "☁️"}
            {theme === "theme-melody" && "🐰"}
            {theme === "theme-purin" && "🍮"}
            {theme === "theme-dark" && "🌌"}
          </span>
          <div className="absolute -top-1 -right-1 bg-sanrio-accent text-white p-1 rounded-full text-[10px] font-bold">
            Hi!
          </div>
        </div>
      </div>

      {/* ⏰ Daily Study Reminder Notification / Toast banner */}
      {(() => {
        const rStyles = getReminderThemeStyles(theme);
        // Show reminder if user hasn't checked in yet, past the reminder hour, and not dismissed
        if (!shouldShowReminder) return null;

        return (
          <div 
            id="daily-reminder-banner"
            className={`rounded-3xl p-5 sm:p-6 border-2 shadow-sm transition-all duration-300 animate-fadeIn ${rStyles.bg} flex flex-col md:flex-row items-start md:items-center justify-between gap-5 text-left`}
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-white bg-opacity-75 dark:bg-slate-800 flex items-center justify-center text-3xl shrink-0 shadow-xs border border-sanrio-border animate-bounce duration-1000">
                {rStyles.characterEmoji}
              </div>
              <div className="space-y-1.5 text-left">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`text-[10px] sm:text-xs font-black tracking-wide uppercase px-2.5 py-0.5 rounded-full bg-white bg-opacity-65 dark:bg-slate-800 ${rStyles.iconColor} border border-sanrio-border flex items-center gap-1`}>
                    <Bell className="w-3.5 h-3.5" />
                    <span>打卡督导提醒 • Study Reminder</span>
                  </span>
                  <span className="text-[10px] text-sanrio-muted font-mono flex items-center gap-1 bg-black bg-opacity-5 px-2.5 py-0.5 rounded-full dark:bg-white dark:bg-opacity-5">
                    <Clock className="w-3 h-3" />
                    <span>提醒: {reminderHour}:00</span>
                    <span className="opacity-60">|</span>
                    <span>当前: {currentHour}点</span>
                  </span>
                </div>
                <h3 className={`text-sm font-extrabold leading-relaxed ${rStyles.text}`}>
                  {rStyles.message}
                </h3>
                
                {/* Micro hours configurations inline inside the banner */}
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="text-[10px] font-bold text-sanrio-muted">⚙️ 调整提醒时间 (Set Hour):</span>
                  {[12, 15, 18, 20, 21, 22].map((hr) => (
                    <button
                      key={hr}
                      onClick={() => handleUpdateReminderHour(hr)}
                      className={`px-2 py-0.5 rounded-lg text-[10px] font-black transition-all cursor-pointer ${
                        reminderHour === hr
                          ? "bg-sanrio-primary text-white"
                          : "bg-white bg-opacity-65 dark:bg-slate-800 text-sanrio-muted hover:bg-opacity-100"
                      }`}
                    >
                      {hr}:00 {hr === 18 ? "(默认)" : ""}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* CTA action buttons */}
            <div className="flex items-center gap-2.5 w-full md:w-auto shrink-0 justify-end">
              <button
                onClick={handleDismissReminder}
                className="px-4 py-2 rounded-2xl text-xs font-bold bg-white bg-opacity-60 dark:bg-slate-800 text-sanrio-muted hover:bg-opacity-100 transition-all border border-sanrio-border cursor-pointer active:scale-95"
              >
                今日免打扰 (Mute)
              </button>
              <button
                onClick={onDailyCheckIn}
                className={`px-5 py-2.5 rounded-2xl text-xs font-black transition-all cursor-pointer active:scale-95 flex items-center gap-1.5 shadow-sm ${rStyles.accent}`}
              >
                <Check className="w-4 h-4 stroke-[3]" />
                <span>一键打卡签到 (Check In)</span>
              </button>
            </div>
          </div>
        );
      })()}

      {/* 🧒 Cascading Grade Selection Layout (Spacious, multi-row, low-anxiety) */}
      <div 
        id="grade-cascade-card"
        className="rounded-3xl p-6 bg-sanrio-card border-2 border-sanrio-border shadow-sm space-y-5"
      >
        <div className="flex items-center justify-between border-b border-sanrio-border pb-3">
          <div className="flex items-center gap-2">
            <GraduationCap className="text-sanrio-primary w-5 h-5" />
            <h2 className="font-bold text-lg text-sanrio-text">当前学习年级</h2>
          </div>
          <p className="text-xs text-sanrio-muted font-medium">挑选课本，随时开课</p>
        </div>

        <div className="space-y-4">
          {/* Row 1: Grade (1st & 2nd visible, high grades collapsable) */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-sanrio-muted tracking-wider uppercase block">
              学段选择 ({expandHighGrades ? "1-5年级全册" : "低年级段"})
            </span>
            <div className="flex flex-wrap items-center gap-2.5">
              {[
                { label: "1 年级", num: "1" },
                { label: "2 年级", num: "2" },
              ].map((gItem) => (
                <button
                  key={gItem.num}
                  onClick={() => handleGradeChange(gItem.num, currentTerm)}
                  className={`px-5 py-2.5 rounded-2xl text-sm font-bold border transition-all duration-200 cursor-pointer ${
                    currentGradeNum === gItem.num
                      ? "bg-sanrio-primary text-white border-sanrio-primary shadow-sm scale-102"
                      : "bg-sanrio-bg text-sanrio-text border-sanrio-border hover:bg-sanrio-secondary hover:bg-opacity-20"
                  }`}
                >
                  {gItem.label}
                </button>
              ))}

              {/* Reveal More Grades Cascade */}
              <button
                onClick={() => setExpandHighGrades(!expandHighGrades)}
                className={`px-4 py-2.5 rounded-2xl text-xs font-semibold flex items-center gap-1.5 border border-dashed transition-all cursor-pointer ${
                  expandHighGrades
                    ? "border-sanrio-accent text-sanrio-accent hover:bg-sanrio-accent hover:bg-opacity-5"
                    : "border-sanrio-muted border-opacity-60 text-sanrio-muted hover:bg-sanrio-secondary hover:bg-opacity-20"
                }`}
              >
                <span>更多年级 (3-5年级)</span>
                {expandHighGrades ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* Expanded Grades (Grades 3, 4, 5) */}
          {expandHighGrades && (
            <div className="pt-1.5 pb-2 border-t border-dashed border-sanrio-border animate-fadeIn flex flex-wrap gap-2">
              {[
                { label: "3 年级 👑", num: "3" },
                { label: "4 年级 🌟", num: "4" },
                { label: "5 年级 🚀", num: "5" },
              ].map((gItem) => (
                <button
                  key={gItem.num}
                  onClick={() => handleGradeChange(gItem.num, currentTerm)}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold border transition-all duration-150 cursor-pointer ${
                    currentGradeNum === gItem.num
                      ? "bg-sanrio-primary text-white border-sanrio-primary shadow-sm"
                      : "bg-sanrio-bg text-sanrio-text border-sanrio-border hover:bg-sanrio-secondary hover:bg-opacity-30"
                  }`}
                >
                  {gItem.label}
                </button>
              ))}
            </div>
          )}

          {/* Row 2: Term selection (A / B or 上下册) */}
          <div className="space-y-2 pt-1">
            <span className="text-xs font-bold text-sanrio-muted tracking-wider uppercase block">
              册别切换 (教材开本)
            </span>
            <div className="grid grid-cols-2 gap-3 sm:max-w-md">
              <button
                onClick={() => handleGradeChange(currentGradeNum, "a")}
                className={`py-3 px-4 rounded-2xl text-sm font-bold border flex flex-col items-center justify-center transition-all cursor-pointer ${
                  currentTerm === "a"
                    ? "bg-sanrio-primary text-white border-sanrio-primary shadow-sm"
                    : "bg-sanrio-bg text-sanrio-text border-sanrio-border hover:bg-sanrio-secondary hover:bg-opacity-30"
                }`}
              >
                <span className="text-sm font-bold">🍂 上 册</span>
                <span className="text-[10px] opacity-75 font-mono">Book A Term</span>
              </button>
              <button
                onClick={() => handleGradeChange(currentGradeNum, "b")}
                className={`py-3 px-4 rounded-2xl text-sm font-bold border flex flex-col items-center justify-center transition-all cursor-pointer ${
                  currentTerm === "b"
                    ? "bg-sanrio-primary text-white border-sanrio-primary shadow-sm"
                    : "bg-sanrio-bg text-sanrio-text border-sanrio-border hover:bg-sanrio-secondary hover:bg-opacity-30"
                }`}
              >
                <span className="text-sm font-bold">🌱 下 册</span>
                <span className="text-[10px] opacity-75 font-mono">Book B Term</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 🎯 每日单词练习目标 (Daily Study Goal) */}
      {(() => {
        const chartColors = getThemeChartColors(theme);
        const percent = Math.min(100, Math.round((dailyGoalCount / (dailyGoalTarget || 1)) * 100));
        const strokeDasharray = 282.7; // Circumference of radius 45 circle (2 * Math.PI * 45)
        const strokeDashoffset = strokeDasharray - (percent / 100) * strokeDasharray;

        return (
          <div className="bg-sanrio-card border-2 border-sanrio-border rounded-3xl p-6 shadow-sm hover:shadow-md transition-all duration-300 space-y-4">
            <div className="flex flex-col md:flex-row items-center gap-6 justify-between">
              {/* Left block: Description & interactive target setter */}
              <div className="space-y-3 flex-1 w-full">
                <div className="flex items-center gap-2">
                  <span className="text-2xl animate-bounce">🎯</span>
                  <div>
                    <h3 className="text-base font-black text-sanrio-text flex items-center gap-2">
                      <span>每日单词练习目标</span>
                      <span className="text-[10px] bg-sanrio-secondary text-sanrio-primary px-2 py-0.5 rounded-md font-extrabold uppercase tracking-wider">
                        Daily Goal
                      </span>
                    </h3>
                    <p className="text-xs text-sanrio-muted">
                      今日自主练习、复习或点击单词卡片发音。点击单词预览可自动累计哦！
                    </p>
                  </div>
                </div>

                <div className="bg-sanrio-bg bg-opacity-40 p-3.5 rounded-2xl border border-sanrio-border space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-sanrio-muted">今日设定目标 (Target Words):</span>
                    <span className="text-sm font-black text-sanrio-primary">{dailyGoalTarget} 个单词</span>
                  </div>
                  
                  {/* Interactive Goal target Adjuster buttons */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleUpdateGoalTarget(dailyGoalTarget - 2)}
                      className="w-8 h-8 rounded-lg border border-sanrio-border bg-sanrio-card hover:bg-sanrio-secondary hover:bg-opacity-30 text-sanrio-text font-black text-xs cursor-pointer active:scale-95 transition-all"
                      title="减少2个单词"
                    >
                      -2
                    </button>
                    <button
                      onClick={() => handleUpdateGoalTarget(dailyGoalTarget - 1)}
                      className="w-8 h-8 rounded-lg border border-sanrio-border bg-sanrio-card hover:bg-sanrio-secondary hover:bg-opacity-30 text-sanrio-text font-black text-xs cursor-pointer active:scale-95 transition-all"
                      title="减少1个单词"
                    >
                      -1
                    </button>
                    <input
                      type="range"
                      min="5"
                      max="50"
                      step="5"
                      value={dailyGoalTarget}
                      onChange={(e) => handleUpdateGoalTarget(parseInt(e.target.value, 10))}
                      className="flex-1 h-1.5 bg-sanrio-border rounded-lg appearance-none cursor-pointer accent-sanrio-primary"
                      title="滑动调整每日目标"
                    />
                    <button
                      onClick={() => handleUpdateGoalTarget(dailyGoalTarget + 1)}
                      className="w-8 h-8 rounded-lg border border-sanrio-border bg-sanrio-card hover:bg-sanrio-secondary hover:bg-opacity-30 text-sanrio-text font-black text-xs cursor-pointer active:scale-95 transition-all"
                      title="增加1个单词"
                    >
                      +1
                    </button>
                    <button
                      onClick={() => handleUpdateGoalTarget(dailyGoalTarget + 5)}
                      className="w-8 h-8 rounded-lg border border-sanrio-border bg-sanrio-card hover:bg-sanrio-secondary hover:bg-opacity-30 text-sanrio-text font-black text-xs cursor-pointer active:scale-95 transition-all"
                      title="增加5个单词"
                    >
                      +5
                    </button>
                  </div>
                </div>

                {/* Manual Log/Practice Word triggers */}
                <div className="flex flex-col sm:flex-row items-center gap-2">
                  <button
                    onClick={() => handleIncrementGoalCount(1)}
                    className="w-full sm:flex-1 py-2 px-4 rounded-xl bg-sanrio-secondary text-sanrio-primary border border-sanrio-primary border-opacity-30 hover:bg-opacity-40 text-xs font-black transition-all active:scale-98 cursor-pointer flex items-center justify-center gap-1"
                  >
                    <span>📝 自主练习 +1 Word</span>
                  </button>
                  <button
                    onClick={() => {
                      handleIncrementGoalCount(5);
                      playAudio("Awesome job! You studied five vocabulary words just now!", volume);
                    }}
                    className="w-full sm:w-auto py-2 px-3.5 rounded-xl bg-sanrio-primary hover:opacity-90 text-white text-xs font-black transition-all active:scale-98 cursor-pointer flex items-center justify-center gap-1"
                  >
                    <span>📚 一键复习 +5 Words</span>
                  </button>
                </div>
              </div>

              {/* Right block: Visual Progress Ring */}
              <div className="flex flex-col items-center justify-center bg-sanrio-bg bg-opacity-20 p-4 rounded-2xl border border-dashed border-sanrio-border min-w-[170px] w-full md:w-auto">
                <div className="relative w-28 h-28 flex items-center justify-center">
                  {/* SVG progress ring circle */}
                  <svg className="w-full h-full transform -rotate-90">
                    {/* Background track circle */}
                    <circle
                      cx="56"
                      cy="56"
                      r="45"
                      className="stroke-current"
                      style={{ color: chartColors.emptyBarColor }}
                      strokeWidth="8"
                      fill="transparent"
                    />
                    {/* Active progress stroke */}
                    <circle
                      cx="56"
                      cy="56"
                      r="45"
                      className="stroke-current transition-all duration-500 ease-out"
                      style={{ 
                        color: chartColors.barColor,
                        strokeDasharray: strokeDasharray,
                        strokeDashoffset: strokeDashoffset
                      }}
                      strokeWidth="8"
                      strokeLinecap="round"
                      fill="transparent"
                    />
                  </svg>

                  {/* Ring interior stats */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center select-none text-center">
                    <span className="text-xl font-black text-sanrio-text leading-none font-mono">
                      {percent}%
                    </span>
                    <span className="text-[10px] text-sanrio-muted font-bold mt-1">
                      {dailyGoalCount} / {dailyGoalTarget} 个
                    </span>
                  </div>
                </div>

                {/* Mascot status message */}
                <div className="mt-3 text-center">
                  {dailyGoalCount >= dailyGoalTarget ? (
                    <span className="text-xs font-black text-green-600 dark:text-green-400 flex items-center gap-1 justify-center animate-bounce">
                      🎉 今日目标已达成！
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold text-sanrio-muted">
                      还需练习 {Math.max(0, dailyGoalTarget - dailyGoalCount)} 个单词 ✨
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* 📊 High-Polish Dashboard Bento statistics Grid */}
      <div id="stats-grid" className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Card 1: Streak */}
        <div className="bg-sanrio-card border-2 border-sanrio-border rounded-3xl p-5 flex items-center gap-4 shadow-sm hover:shadow-md transition-all duration-300">
          <div className="w-12 h-12 rounded-2xl bg-orange-100 flex items-center justify-center text-orange-500 animate-pulse">
            <Trophy className="w-6 h-6 fill-current" />
          </div>
          <div>
            <div className="text-2xl font-black text-sanrio-text">{streakCount} 天</div>
            <div className="text-xs text-sanrio-muted font-medium">连续打卡天数 🔥</div>
          </div>
        </div>

        {/* Card 2: Bookmarks */}
        <div className="bg-sanrio-card border-2 border-sanrio-border rounded-3xl p-5 flex items-center gap-4 shadow-sm hover:shadow-md transition-all duration-300">
          <div className="w-12 h-12 rounded-2xl bg-rose-100 flex items-center justify-center text-rose-500">
            <Star className="w-6 h-6 fill-current" />
          </div>
          <div>
            <div className="text-2xl font-black text-sanrio-text">{bookmarkedWords.length} 个</div>
            <div className="text-xs text-sanrio-muted font-medium">红星收藏单词 ⭐</div>
          </div>
        </div>

        {/* Card 3: Mistakes */}
        <div className="bg-sanrio-card border-2 border-sanrio-border rounded-3xl p-5 flex items-center gap-4 shadow-sm hover:shadow-md transition-all duration-300">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 flex items-center justify-center text-amber-600">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-sanrio-text">{mistakes.length} 项</div>
            <div className="text-xs text-sanrio-muted font-medium">亟需练习错题本 ✏️</div>
          </div>
        </div>
      </div>

      {/* 🗂️ Interactive Sub-tab System */}
      <div id="dashboard-subtabs-deck" className="space-y-6">
        <div className="flex border-b border-sanrio-border pb-px gap-2">
          <button
            onClick={() => {
              setActiveSubTab("units");
              playAudio("Study units directory", volume);
            }}
            className={`pb-3 px-5 font-black text-sm sm:text-base flex items-center gap-2 border-b-3 transition-all cursor-pointer ${
              activeSubTab === "units"
                ? "border-sanrio-primary text-sanrio-primary"
                : "border-transparent text-sanrio-muted hover:text-sanrio-text hover:border-sanrio-border"
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>📖 课程单元目录</span>
            <span className="text-xs bg-sanrio-secondary px-2 py-0.5 rounded-full font-mono text-sanrio-muted">
              {activeBooks.length} Units
            </span>
          </button>
          <button
            onClick={() => {
              setActiveSubTab("achievements");
              playAudio("Show achievements and badges", volume);
            }}
            className={`pb-3 px-5 font-black text-sm sm:text-base flex items-center gap-2 border-b-3 transition-all cursor-pointer relative ${
              activeSubTab === "achievements"
                ? "border-sanrio-primary text-sanrio-primary"
                : "border-transparent text-sanrio-muted hover:text-sanrio-text hover:border-sanrio-border"
            }`}
          >
            <Award className="w-4 h-4" />
            <span>🏆 宝贝成就勋章</span>
            {unlockedCount > 0 && (
              <span className="bg-sanrio-accent text-white text-[10px] font-black px-2 py-0.5 rounded-full animate-bounce">
                {unlockedCount} / {achievements.length}
              </span>
            )}
          </button>
          <button
            onClick={() => {
              setActiveSubTab("weekly_report");
              playAudio("Show weekly learning consistency report", volume);
            }}
            className={`pb-3 px-5 font-black text-sm sm:text-base flex items-center gap-2 border-b-3 transition-all cursor-pointer relative ${
              activeSubTab === "weekly_report"
                ? "border-sanrio-primary text-sanrio-primary"
                : "border-transparent text-sanrio-muted hover:text-sanrio-text hover:border-sanrio-border"
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>📈 学习打卡周报</span>
            <span className="text-xs bg-sanrio-secondary px-2 py-0.5 rounded-full font-mono text-sanrio-muted">
              Weekly
            </span>
          </button>
        </div>

        {/* Tab content conditional rendering */}
        {activeSubTab === "units" && (
          <div className="space-y-4 animate-fadeIn">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-sm sm:text-base text-sanrio-text">
                双语学习关卡（当前选择课本）
              </h3>
              <p className="text-xs text-sanrio-muted">挑战完测验可标记为“通关”</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {activeBooks.map((unitObj, idx) => {
                const completedKey = `${grade.toLowerCase()}_${unitObj.unit.toLowerCase()}`;
                const isCompleted = completedUnits.includes(completedKey);

                return (
                  <div
                    key={idx}
                    className={`relative overflow-hidden rounded-3xl border-2 p-5 bg-sanrio-card transition-all duration-200 shadow-sm hover:-translate-y-1 hover:shadow-md ${
                      isCompleted ? "border-green-300 ring-2 ring-green-100 dark:ring-0" : "border-sanrio-border"
                    }`}
                  >
                    {/* Completion Stamp corner logo */}
                    {isCompleted && (
                      <div className="absolute top-3 right-3 text-green-500 flex items-center gap-1 bg-green-50 px-2.5 py-0.5 rounded-full text-[10px] font-bold border border-green-200">
                        <CheckCircle className="w-3.5 h-3.5 fill-current text-green-500" />
                        <span>已通关</span>
                      </div>
                    )}

                    <div className="space-y-4">
                      {/* Unit Identification banner */}
                      <div className="space-y-1.5 pr-14">
                        <span className="text-xs font-bold text-sanrio-accent uppercase tracking-wider block">
                          {unitObj.unit}
                        </span>
                        <h4 className="text-lg font-bold text-sanrio-text">
                          {unitObj.title}
                        </h4>
                      </div>

                      {/* Vocabulary preview row */}
                      <div className="bg-sanrio-bg bg-opacity-40 p-3 rounded-2xl">
                        <div className="text-xs text-sanrio-muted font-bold mb-1.5 flex items-center justify-between">
                          <span>核心词汇预览：</span>
                          <span className="text-[10px] text-sanrio-muted font-normal">点击单词可发音并加分 ✨</span>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {unitObj.words.map((w, wIdx) => (
                            <span
                              key={wIdx}
                              className="px-2.5 py-1 bg-sanrio-card rounded-xl text-xs font-semibold text-sanrio-text border border-sanrio-border shadow-xs hover:border-sanrio-primary hover:text-sanrio-primary transition-colors cursor-pointer"
                              onClick={(e) => {
                                e.stopPropagation();
                                playAudio(w.word, volume);
                                handleIncrementGoalCount(1);
                                const currentProg = getUnitProgressPercentage(completedKey);
                                if (currentProg < 100) {
                                  const nextProg = Math.min(100, currentProg + 20);
                                  handleUpdateProgress(completedKey, nextProg, unitObj);
                                }
                              }}
                            >
                              {w.word}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* ⚡ Animated Progress Bar & Interactive Boost Station */}
                      <div className="space-y-1.5 bg-sanrio-bg bg-opacity-20 p-3 rounded-2xl border border-dashed border-sanrio-border">
                        <div className="flex justify-between items-center text-xs">
                          <span className="font-bold text-sanrio-muted flex items-center gap-1">
                            <span>学习进度 (Progress)</span>
                            {!isCompleted && <span className="animate-pulse text-amber-500 text-[10px]">⚡</span>}
                          </span>
                          <div className="flex items-center gap-2">
                            <span className={`font-black font-mono ${isCompleted ? "text-green-600 dark:text-green-400" : "text-sanrio-accent"}`}>
                              {getUnitProgressPercentage(completedKey)}%
                            </span>
                            {!isCompleted && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const cur = getUnitProgressPercentage(completedKey);
                                  handleUpdateProgress(completedKey, Math.min(100, cur + 20), unitObj);
                                }}
                                className="text-[10px] font-black bg-sanrio-accent text-white px-2 py-0.5 rounded-lg hover:opacity-90 active:scale-95 transition-all cursor-pointer shadow-xs shrink-0"
                                title="点击为学习能量条充能 20%"
                              >
                                ⚡ 充能 +20%
                              </button>
                            )}
                          </div>
                        </div>
                        
                        {/* The animated bar container */}
                        <div className="h-3.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden p-0.5 border border-sanrio-border relative">
                          <div
                            className={`h-full rounded-full transition-all duration-1000 ease-out relative ${
                              isCompleted 
                                ? "bg-gradient-to-r from-green-400 to-emerald-500 animate-pulse" 
                                : "bg-gradient-to-r from-pink-400 via-rose-400 to-amber-400"
                            }`}
                            style={{ width: `${getUnitProgressPercentage(completedKey)}%` }}
                          >
                            {isCompleted && (
                              <span className="absolute inset-0 flex items-center justify-center text-[8px] font-black text-white tracking-widest uppercase animate-pulse">
                                PERFECT ⭐ 100%
                              </span>
                            )}
                          </div>
                        </div>
                        
                        {!isCompleted && (
                          <div className="text-[9px] text-sanrio-muted italic text-center">
                            💡 提示：点击预览单词或 “⚡充能” 即可积攒学习能量，达到 100% 有神秘惊喜哦！
                          </div>
                        )}
                      </div>

                      {/* Curricullum interactive button hubs */}
                      <div className="grid grid-cols-2 gap-2.5 pt-1">
                        <button
                          onClick={() => onSelectUnit(unitObj, "flashcards")}
                          className="py-3 px-4 rounded-2xl bg-sanrio-secondary bg-opacity-50 text-sanrio-text border border-sanrio-border hover:bg-sanrio-primary hover:text-white transition-all text-xs font-bold flex items-center justify-center gap-1 px-3 cursor-pointer"
                        >
                          <BookOpen className="w-4 h-4" />
                          <span>查看单词卡</span>
                        </button>
                        <button
                          onClick={() => onSelectUnit(unitObj, "quiz")}
                          className="py-3 px-4 rounded-2xl bg-sanrio-primary text-white hover:opacity-90 transition-all text-xs font-bold flex items-center justify-center gap-1 px-3 cursor-pointer"
                        >
                          <span>随堂测验</span>
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeSubTab === "achievements" && (
          <div className="space-y-6 animate-fadeIn">
            {/* Achievements Summary Banner Header */}
            <div className="rounded-3xl p-6 bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200 dark:from-slate-900 dark:to-slate-800 dark:border-sanrio-border flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="space-y-2 text-center md:text-left">
                <div className="inline-flex items-center gap-1.5 bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-xs font-black">
                  <Trophy className="w-3.5 h-3.5 text-amber-600 fill-amber-600" />
                  <span>Sanrio 魔法勋章馆</span>
                </div>
                <h3 className="text-xl font-extrabold text-sanrio-text">
                  宝贝，你太优秀了！⭐
                </h3>
                <p className="text-xs text-sanrio-muted max-w-lg leading-relaxed">
                  每解锁一个成就，对应的三丽鸥明星（Hello Kitty、大耳狗、美乐蒂等）就会来到你的英语教室。点击勋章听听他们的英音赞美吧！
                </p>
              </div>

              {/* Progress visual indicator circle */}
              <div className="flex items-center gap-4 bg-white dark:bg-opacity-5 p-4 rounded-2xl border border-sanrio-border shadow-xs">
                <div className="relative w-16 h-16 flex items-center justify-center bg-amber-100 dark:bg-amber-950 rounded-full border-2 border-amber-300">
                  <span className="text-xs font-black text-amber-800 dark:text-amber-300">
                    {unlockedCount}/{achievements.length}
                  </span>
                </div>
                <div className="text-left space-y-1">
                  <div className="text-xs font-extrabold text-sanrio-text">解锁进度</div>
                  <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-amber-500 rounded-full transition-all duration-500"
                      style={{ width: `${(unlockedCount / achievements.length) * 100}%` }}
                    />
                  </div>
                  <div className="text-[10px] text-sanrio-muted">
                    {unlockedCount === achievements.length ? "哇！大满贯！🎉" : "加油，解锁更多勋章！"}
                  </div>
                </div>
              </div>
            </div>

            {/* 🎀 我的三丽鸥手帐书桌 (My Sanrio Handcraft Desk) */}
            <div className="rounded-3xl p-6 bg-rose-50/40 border-2 border-dashed border-rose-200 dark:bg-slate-900/60 dark:border-sanrio-border space-y-4 shadow-inner">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-2xl animate-pulse">🌸</span>
                  <div>
                    <h4 className="text-sm font-black text-rose-800 dark:text-rose-300 flex items-center gap-1">
                      <span>三丽鸥魔法手帐本</span>
                      <span className="text-[9px] bg-rose-200 text-rose-800 px-1.5 py-0.5 rounded-md font-extrabold uppercase">STicker Album</span>
                    </h4>
                    <p className="text-[10px] text-rose-600/80 dark:text-rose-400">Pasted Sanrio Collectible Stickers on my Desktop</p>
                  </div>
                </div>
                <div className="text-[10px] bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-200 px-3 py-1 rounded-full font-black shadow-xs shrink-0">
                  已贴手帐贴纸: {placedStickers.length} / {achievements.filter(a => (a as any).isSticker).length} 张
                </div>
              </div>

              {placedStickers.length === 0 ? (
                <div className="bg-white/90 dark:bg-slate-950 p-6 rounded-2xl border border-rose-100 text-center text-xs text-rose-500/80 space-y-2">
                  <p className="font-extrabold flex items-center justify-center gap-1">
                    <span>你的手帐本上空空的哦 ✨</span>
                    <span>🐰</span>
                  </p>
                  <p className="text-[10px] leading-relaxed max-w-xl mx-auto">
                    快去下方解锁专为你设计的 <span className="font-bold text-rose-600">“大耳狗词汇大宗师贴纸”</span> 和 <span className="font-bold text-purple-600">“酷洛米测验小霸王贴纸”</span>！解锁后点击贴纸上的 <span className="font-bold text-rose-600">【📌 贴在手帐本】</span> 就能装点你的魔法书桌啦！
                  </p>
                </div>
              ) : (
                <div className="bg-white/90 dark:bg-slate-950/80 p-4 rounded-2xl border border-rose-100 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3.5 relative overflow-hidden shadow-xs min-h-[110px] items-center">
                  {/* Floating Stars Decorative background */}
                  <div className="absolute top-1 right-2 text-[10px] opacity-25 select-none font-black text-rose-400">✨ COLLECTIBLE DESK ✨</div>
                  
                  {achievements.filter(a => placedStickers.includes(a.id)).map((badge) => (
                    <div 
                      key={`placed-${badge.id}`}
                      className={`relative flex flex-col items-center justify-center p-3.5 rounded-2xl border-2 border-rose-200 bg-gradient-to-br ${badge.colorClass} shadow-md hover:scale-105 transition-transform duration-300 select-none group`}
                    >
                      {/* Rip Off Button */}
                      <button 
                        onClick={() => handleTogglePlaceSticker(badge.id, (badge as any).stickerName || badge.title)}
                        className="absolute -top-1.5 -right-1.5 bg-rose-500 hover:bg-rose-600 text-white p-0.5 rounded-full shadow-xs text-[8px] cursor-pointer w-4 h-4 flex items-center justify-center transition-transform hover:scale-110"
                        title="从手帐撕下贴纸"
                      >
                        ✕
                      </button>
                      <span className="text-3xl filter drop-shadow-md mb-1.5 animate-pulse select-none">{badge.badgeEmoji}</span>
                      <div className="text-[10px] font-black text-slate-800 dark:text-slate-900 text-center leading-tight truncate w-full">
                        {(badge as any).stickerName || badge.title.replace("贴纸", "")}
                      </div>
                      <div className="text-[8px] opacity-75 font-bold text-slate-600 mt-0.5">
                        {badge.characterEmoji} {badge.character.split(" ")[0]}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Achievements Grid List */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {achievements.map((badge) => {
                const isUnlocked = badge.unlocked;
                const isSticker = (badge as any).isSticker;
                const isPlaced = placedStickers.includes(badge.id);
                
                return (
                  <div
                    key={badge.id}
                    className={`relative flex flex-col justify-between overflow-hidden rounded-3xl border-2 p-5 bg-sanrio-card transition-all duration-300 shadow-sm ${
                      isUnlocked
                        ? isSticker 
                          ? "border-pink-300 hover:border-pink-400 hover:shadow-md hover:-translate-y-1 scale-100 bg-gradient-to-b from-white to-pink-50/20 dark:from-slate-900 dark:to-slate-950"
                          : "border-amber-300 hover:shadow-md hover:-translate-y-1 scale-100"
                        : "opacity-65 border-dashed border-gray-300 dark:border-gray-700 select-none"
                    }`}
                  >
                    {/* Special Digital Sticker Stamp tag overlay */}
                    {isSticker && (
                      <div className="absolute top-0 left-0 bg-pink-500 text-white text-[8px] font-black uppercase tracking-wider px-2.5 py-1 rounded-br-2xl shadow-xs flex items-center gap-1 select-none">
                        <span>🎀 SANRIO STICKER</span>
                      </div>
                    )}

                    {/* Top corner character avatar */}
                    <div className="absolute top-4 right-4 text-xs font-bold px-2 py-1 bg-sanrio-bg border border-sanrio-border rounded-full flex items-center gap-1 select-none">
                      <span>{badge.characterEmoji}</span>
                      <span className="text-[10px] text-sanrio-muted">{badge.character.split(" ")[0]}</span>
                    </div>

                    <div className="space-y-4 pt-1.5">
                      {/* Badge Circle Icon */}
                      <div className="flex items-center gap-3">
                        <div className={`w-14 h-14 rounded-full flex items-center justify-center border text-2xl shadow-xs shrink-0 relative ${
                          isUnlocked 
                            ? isSticker
                              ? `bg-gradient-to-br ${badge.colorClass} border-pink-300 animate-pulse`
                              : `bg-gradient-to-br ${badge.colorClass}` 
                            : "bg-gray-100 border-gray-200 text-gray-400 dark:bg-gray-800 dark:border-gray-700"
                        }`}>
                          <span>{isUnlocked ? badge.badgeEmoji : "❓"}</span>
                          {!isUnlocked && (
                            <div className="absolute -bottom-1 -right-1 bg-gray-500 text-white p-0.5 rounded-full border border-white">
                              <Lock className="w-2.5 h-2.5" />
                            </div>
                          )}
                        </div>

                        <div>
                          <h4 className="text-sm font-black text-sanrio-text flex items-center gap-1">
                            <span>{badge.title}</span>
                          </h4>
                          <span className="text-[10px] font-mono text-sanrio-muted block uppercase tracking-wider">
                            {badge.englishTitle}
                          </span>
                        </div>
                      </div>

                      {/* Description and requirement text */}
                      <div className="space-y-2">
                        <p className="text-xs text-sanrio-text leading-relaxed">
                          {badge.description}
                        </p>
                        <div className="bg-sanrio-bg bg-opacity-50 p-2.5 rounded-xl border border-sanrio-border text-[10px] text-sanrio-muted space-y-1.5">
                          <div className="font-bold flex justify-between items-center">
                            <span>解锁条件 (Requirements)</span>
                            {isSticker && <span className="text-[8px] text-pink-500">限定手帐贴纸 🌟</span>}
                          </div>
                          <div className="leading-relaxed">{badge.requirementText}</div>
                          {/* Mini Progress Bar inside */}
                          <div className="flex items-center gap-2 pt-0.5">
                            <div className="flex-1 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                              <div 
                                className={`h-full rounded-full ${isUnlocked ? badge.accentColor : "bg-gray-400"}`}
                                style={{ width: `${Math.min(100, (badge.currentProgress / badge.targetProgress) * 100)}%` }}
                              />
                            </div>
                            <span className="font-mono text-[9px] shrink-0 font-bold">
                              {Math.min(badge.targetProgress, badge.currentProgress)}/{badge.targetProgress}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Congratulatory Sound speech synthesis & Sticker placing buttons */}
                    <div className="pt-4 mt-auto border-t border-dashed border-sanrio-border space-y-2">
                      {isUnlocked ? (
                        <div className="flex flex-col gap-1.5">
                          <button
                            onClick={() => playAudio(badge.voiceMessage, volume)}
                            className={`w-full py-2 px-3 rounded-xl bg-gradient-to-r ${badge.colorClass} hover:opacity-90 transition-all text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-xs active:scale-98`}
                          >
                            <Smile className="w-3.5 h-3.5 animate-bounce" />
                            <span>听听我的声音 (Hear Praise) 🗣️</span>
                          </button>
                          
                          {/* Paste onto desktop button for stickers */}
                          {isSticker && (
                            <button
                              onClick={() => handleTogglePlaceSticker(badge.id, (badge as any).stickerName || badge.title)}
                              className={`w-full py-1.5 px-3 rounded-lg border text-[10px] font-black transition-all flex items-center justify-center gap-1 cursor-pointer ${
                                isPlaced 
                                  ? "bg-rose-100 border-rose-200 text-rose-700 hover:bg-rose-200" 
                                  : "bg-white hover:bg-slate-50 border-gray-200 text-slate-700 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-700"
                              }`}
                            >
                              <span>{isPlaced ? "📌 已贴在我的手帐本上 (Tap to Remove)" : "📌 贴在手帐本上 (Paste Sticker)"}</span>
                            </button>
                          )}
                        </div>
                      ) : (
                        <div className="w-full py-2 px-3 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-400 text-center text-[10px] font-bold border border-transparent">
                          🔒 {isSticker ? "贴纸未解锁" : "勋章封印中"}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeSubTab === "weekly_report" && (() => {
          const reportColors = getThemeChartColors(theme);
          const weeklyData = getWeeklyReportData();
          const studiedDaysCount = weeklyData.filter(d => d.studied).length;

          // Cute Sanrio specific wisdom cards
          const getSanrioWisdom = () => {
            if (studiedDaysCount === 7) {
              return {
                character: "Hello Kitty 🐱",
                wisdom: "完美满分！7天全部打卡成功！你就像璀璨的钻石皇冠，散发着无比耀眼的光芒，Kitty给你疯狂鼓掌！🍮✨",
                accent: "from-pink-500 to-rose-400 text-white"
              };
            } else if (studiedDaysCount >= 5) {
              return {
                character: "Cinnamoroll ☁️",
                wisdom: `超级优秀！这周打卡了 ${studiedDaysCount} 天！大耳狗在天空中用彩云给你折了一朵巨大的奖励小红花！加油哦！`,
                accent: "from-sky-400 to-blue-500 text-white"
              };
            } else if (studiedDaysCount >= 3) {
              return {
                character: "My Melody 🐰",
                wisdom: `真棒！已经打卡了 ${studiedDaysCount} 天呢。美乐蒂准备了甜甜的草莓蛋糕，继续坚持，英语会越来越流利哦！🍓`,
                accent: "from-pink-400 to-rose-300 text-white"
              };
            } else {
              return {
                character: "Pompompurin 🍮",
                wisdom: `收到！我们这周完成了 ${studiedDaysCount} 天的探险。布丁狗相信你下周一定可以向 5 天大关发起挑战，加油！🍮`,
                accent: "from-amber-400 to-yellow-500 text-white"
              };
            }
          };

          const wisdom = getSanrioWisdom();

          // Custom tooltip inside
          const CustomTooltip = ({ active, payload }: any) => {
            if (active && payload && payload.length) {
              const data = payload[0].payload;
              return (
                <div className="bg-sanrio-card border-2 border-sanrio-border p-3.5 rounded-2xl shadow-md text-xs font-black space-y-1 dark:bg-slate-900">
                  <p className="text-sanrio-text font-black">{data.dayName}</p>
                  <p className="text-sanrio-muted font-normal text-[10px]">{data.dateStr}</p>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className={`w-2.5 h-2.5 rounded-full ${data.studied ? "bg-green-500" : "bg-gray-400"}`} />
                    <span className={data.studied ? "text-green-600" : "text-sanrio-muted"}>
                      {data.studied ? "✨ 今日已学 (Studied)" : "💤 休息放松 (Rest)"}
                    </span>
                  </div>
                </div>
              );
            }
            return null;
          };

          return (
            <div className="space-y-6 animate-fadeIn text-left">
              {/* Encouraging Character Banner */}
              <div className={`rounded-3xl p-6 bg-gradient-to-r ${wisdom.accent} shadow-sm border border-transparent flex flex-col sm:flex-row items-center gap-5`}>
                <div className="text-4xl select-none shrink-0 bg-white bg-opacity-25 w-16 h-16 rounded-2xl flex items-center justify-center">
                  {wisdom.character.split(" ")[1]}
                </div>
                <div className="space-y-1.5 text-center sm:text-left">
                  <div className="text-[10px] uppercase font-black tracking-widest bg-white bg-opacity-25 px-2.5 py-0.5 rounded-full inline-block">
                    {wisdom.character} 的能量鼓励栏
                  </div>
                  <h4 className="text-lg font-black leading-snug">
                    {wisdom.wisdom}
                  </h4>
                  <p className="text-[10px] opacity-85 leading-none">
                    * 统计范围：过去 7 日打卡情况 (The past 7 days baseline analysis)
                  </p>
                </div>
              </div>

              {/* 📈 D3-based progress trajectory and vocabulary growth card */}
              <D3ProgressTrajectory 
                grade={grade} 
                completedUnits={completedUnits} 
                volume={volume} 
                theme={theme} 
              />

              {/* Chart Card */}
              <div className="bg-sanrio-card border-2 border-sanrio-border rounded-3xl p-5 sm:p-6 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-dashed border-sanrio-border pb-4">
                  <div className="space-y-1">
                    <h3 className="text-base font-black text-sanrio-text flex items-center gap-2">
                      <BarChart3 className="w-5 h-5 text-sanrio-primary" />
                      <span>英语学习打卡趋势 (Weekly Learning Consistency)</span>
                    </h3>
                    <p className="text-xs text-sanrio-muted">
                      柱子高度代表打卡状态（高柱：已学，低柱：休息），快来用斑斓的颜色填满它们！
                    </p>
                  </div>

                  <div className="flex items-center gap-4 text-xs font-bold shrink-0">
                    <div className="flex items-center gap-1.5">
                      <span className="w-3.5 h-3.5 rounded-md" style={{ backgroundColor: reportColors.barColor }} />
                      <span className="text-sanrio-text">已打卡 ({studiedDaysCount} 天)</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-3.5 h-3.5 rounded-md" style={{ backgroundColor: reportColors.emptyBarColor }} />
                      <span className="text-sanrio-muted">休整中 ({7 - studiedDaysCount} 天)</span>
                    </div>
                  </div>
                </div>

                {/* Recharts Render Container */}
                <div className="w-full h-[280px] pt-4 pr-2 select-none">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={weeklyData}
                      margin={{ top: 10, right: 5, left: -20, bottom: 5 }}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        vertical={false}
                        stroke={reportColors.gridColor}
                      />
                      <XAxis
                        dataKey="shortDate"
                        tickLine={false}
                        axisLine={false}
                        tick={{ fill: reportColors.textFill, fontSize: 11, fontWeight: "bold" }}
                      />
                      <YAxis
                        domain={[0, 100]}
                        tickLine={false}
                        axisLine={false}
                        ticks={[20, 50, 100]}
                        tickFormatter={(v) => (v === 100 ? "Active ✨" : v === 20 ? "Rest 💤" : "")}
                        tick={{ fill: "var(--sanrio-muted)", fontSize: 10, fontWeight: "bold" }}
                      />
                      <Tooltip
                        content={<CustomTooltip />}
                        cursor={{ fill: "var(--sanrio-secondary)", opacity: 0.15 }}
                      />
                      <Bar
                        dataKey="学习打卡"
                        radius={[10, 10, 0, 0]}
                        barSize={32}
                      >
                        {weeklyData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={entry.studied ? reportColors.barColor : reportColors.emptyBarColor}
                            className="transition-all duration-300 hover:opacity-85 cursor-pointer"
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Day Checklist Row */}
              <div className="space-y-3">
                <h4 className="text-sm font-extrabold text-sanrio-text">
                  📅 过去 7 天打卡记录详情 (Footprint Tracker)
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-7 gap-3">
                  {weeklyData.map((day, idx) => (
                    <div
                      key={idx}
                      className={`p-3.5 rounded-2xl border-2 text-center transition-all flex flex-col justify-between h-28 ${
                        day.studied
                          ? "bg-green-50 bg-opacity-45 border-green-200 dark:bg-green-950 dark:bg-opacity-10 dark:border-green-800"
                          : "bg-sanrio-bg bg-opacity-35 border-sanrio-border"
                      }`}
                    >
                      <div className="text-[10px] font-extrabold text-sanrio-muted block">
                        {day.dayName.split(" ")[0]}
                      </div>
                      <div className="text-xs font-mono font-bold text-sanrio-text block">
                        {day.shortDate}
                      </div>
                      <div className="flex items-center justify-center">
                        {day.studied ? (
                          <div className="w-7 h-7 bg-green-500 text-white rounded-full flex items-center justify-center shadow-xs animate-pulse">
                            <Check className="w-4 h-4 stroke-[3]" />
                          </div>
                        ) : (
                          <div className="w-7 h-7 bg-gray-200 dark:bg-gray-800 text-gray-400 rounded-full flex items-center justify-center border border-dashed border-gray-300 dark:border-gray-700">
                            <X className="w-3.5 h-3.5" />
                          </div>
                        )}
                      </div>
                      <div className="text-[10px] font-black tracking-tighter uppercase">
                        {day.studied ? (
                          <span className="text-green-600">Active</span>
                        ) : (
                          <span className="text-sanrio-muted text-opacity-70">Rest</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* ⏰ Daily Study Reminder Control Widget inside Report */}
              <div className="bg-sanrio-card border-2 border-sanrio-border rounded-3xl p-5 space-y-4 text-left">
                <div className="flex items-center gap-2 border-b border-dashed border-sanrio-border pb-3">
                  <Bell className="w-4.5 h-4.5 text-sanrio-primary" />
                  <h4 className="text-sm font-extrabold text-sanrio-text">
                    ⏰ 每日督导打卡提醒设置 (Daily Reminder Dashboard)
                  </h4>
                </div>
                <div className="text-xs text-sanrio-muted leading-relaxed space-y-2">
                  <p>
                    为了帮小宝贝养成优秀的日常英语习惯，当时间超过设定的提醒时刻，且今日尚未打卡时，主页会触发可爱的 Sanrio 角色督促横幅。
                  </p>
                  <p className="flex items-center gap-1 font-semibold text-sanrio-text">
                    <Clock className="w-3.5 h-3.5 text-sanrio-accent animate-pulse" />
                    <span>系统当前时间: <strong className="font-mono text-sanrio-accent">{currentHour}:00左右</strong></span>
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-sanrio-secondary bg-opacity-20 rounded-2xl p-4 border border-sanrio-border">
                  <div className="space-y-1">
                    <span className="text-xs font-black text-sanrio-text">提醒时刻 (Remind Time)</span>
                    <p className="text-[10px] text-sanrio-muted">建议设定在放学后或晚饭前（默认 18:00）</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-1.5">
                    {[12, 15, 18, 20, 21, 22].map((hr) => (
                      <button
                        key={hr}
                        onClick={() => handleUpdateReminderHour(hr)}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                          reminderHour === hr
                            ? "bg-sanrio-primary text-white scale-102 shadow-xs"
                            : "bg-white dark:bg-slate-800 text-sanrio-muted border border-sanrio-border hover:bg-opacity-80"
                        }`}
                      >
                        {hr}:00 {hr === 18 ? "(推荐)" : ""}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs pt-1">
                  <span className="text-sanrio-muted font-bold">
                    今日打卡状态 (Today's Footprint):
                  </span>
                  {isCheckedInToday ? (
                    <span className="text-green-600 font-extrabold flex items-center gap-1">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span>已成功打卡 (Completed)</span>
                    </span>
                  ) : (
                    <span className="text-amber-600 font-extrabold flex items-center gap-1">
                      <Clock className="w-4 h-4 text-amber-500 animate-spin" style={{ animationDuration: '3s' }} />
                      <span>待打卡 (Awaiting Check-in)</span>
                    </span>
                  )}
                </div>

                {isReminderDismissed && (
                  <div className="flex items-center justify-between text-xs bg-red-50 bg-opacity-35 dark:bg-red-950 dark:bg-opacity-10 border border-red-100 dark:border-red-900 rounded-xl p-2.5">
                    <span className="text-red-700 dark:text-red-300 text-[11px] font-bold">
                      🚫 您今天开启了“今日免打扰”。
                    </span>
                    <button
                      onClick={() => {
                        safeLocalStorage.removeItem("oxford_reminder_dismissed_date");
                        setIsReminderDismissed(false);
                        playAudio("已重新启用打卡提醒横幅！", volume);
                      }}
                      className="text-red-600 dark:text-red-400 font-black hover:underline cursor-pointer text-[11px]"
                    >
                      重新启用提醒 (Re-enable)
                    </button>
                  </div>
                )}
              </div>

              {/* Parenting & Study Suggestions */}
              <div className="bg-sanrio-secondary bg-opacity-20 border-2 border-sanrio-border rounded-3xl p-5 space-y-3">
                <h5 className="text-xs font-extrabold text-sanrio-accent uppercase tracking-wider">
                  💡 伴读小贴士 (Parent-Child Study Co-pilot Guide)
                </h5>
                <ul className="text-xs text-sanrio-text space-y-2 list-disc pl-4 leading-relaxed">
                  <li>
                    <strong>每天学习 5 分钟</strong>：语言记忆在于高频接触，每天练习一个单词卡比周末猛学一小时更轻松哦！
                  </li>
                  <li>
                    <strong>红星收藏单词巩固</strong>：目前共有 <span className="font-bold text-sanrio-primary">{bookmarkedWords.length} 个</span> 红星单词，建议和孩子一起进行“词卡对对碰”趣味问答。
                  </li>
                  <li>
                    <strong>错题本轻量挑战</strong>：把当前累积的 <span className="font-bold text-sanrio-primary">{mistakes.length} 项</span> 错题本清空也是一种极致成就，加油通关！
                  </li>
                </ul>
              </div>
            </div>
          );
        })()}
      </div>

      {/* 🌸 Sanrio Character Celebration Overlay Modal */}
      {celebratingUnit && (() => {
        // Dynamic content configurations based on selected theme
        const themeDetails = (() => {
          switch (theme) {
            case "theme-kuromi":
              return {
                mascot: "Kuromi 酷洛米",
                emoji: "😈",
                cardBg: "bg-purple-950 text-purple-100 border-purple-400",
                buttonClass: "bg-fuchsia-500 hover:bg-fuchsia-600 text-white shadow-lg",
                greeting: "哼哼，就知道你最聪明了！酷洛米大人奖励你一颗魔法糖果！🎃",
                enGreeting: "Hehe! I knew you could do it! Kuromi presents you a stellar Pumpkin candy! You are the absolute best!",
                characterVisual: "💜😈🖤"
              };
            case "theme-cinnamoroll":
              return {
                mascot: "Cinnamoroll 大耳狗",
                emoji: "☁️",
                cardBg: "bg-sky-950 text-sky-100 border-sky-400",
                buttonClass: "bg-sky-400 hover:bg-sky-500 text-white shadow-lg",
                greeting: "哇！宝贝太棒了！像云朵一样飞上了 100% 满分的天空！☁️",
                enGreeting: "Wow! You are soaring so high like a fluffy cloud! 100% completion achieved! Spectacular!",
                characterVisual: "🩵☁️🤍"
              };
            case "theme-purin":
              return {
                mascot: "Pompompurin 布丁狗",
                emoji: "🍮",
                cardBg: "bg-amber-950 text-yellow-100 border-yellow-400",
                buttonClass: "bg-amber-500 hover:bg-amber-600 text-white shadow-lg",
                greeting: "咕噜噜～ 宝贝太牛啦！布丁狗分给你一个超大号黄金布丁！🍮",
                enGreeting: "Munch munch! Delicious progress! Pompompurin shares a golden caramel pudding with you! Bravo!",
                characterVisual: "💛🍮🤎"
              };
            case "theme-dark":
              return {
                mascot: "Cosmic Explorer 凯蒂猫",
                emoji: "🐱",
                cardBg: "bg-slate-900 text-slate-100 border-indigo-500",
                buttonClass: "bg-indigo-500 hover:bg-indigo-600 text-white shadow-lg",
                greeting: "星河璀璨！宝贝完成了 100% 英语关卡，解锁了星际金牌勋章！🚀",
                enGreeting: "Cosmic triumph! You have unlocked the golden interstellar badge. A stellar milestone!",
                characterVisual: "🌌🚀✨"
              };
            case "theme-melody":
            default:
              return {
                mascot: "My Melody 美乐蒂",
                emoji: "🐰",
                cardBg: "bg-rose-950 text-rose-100 border-rose-400",
                buttonClass: "bg-rose-500 hover:bg-rose-600 text-white shadow-lg",
                greeting: "呀！恭喜宝贝！美乐蒂为你送上最甜美的小草莓和 100% 满分勋章！🍓",
                enGreeting: "Yay! Congratulations, darling! My Melody sends you sweet strawberries and a shiny 100% badge!",
                characterVisual: "💗🐰🌸"
              };
          }
        })();

        return (
          <div 
            id="celebration-overlay-modal"
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fadeIn"
          >
            <div 
              className={`w-full max-w-lg rounded-[2.5rem] p-8 text-center border-4 relative shadow-2xl overflow-hidden transition-all duration-300 transform scale-100 ${themeDetails.cardBg}`}
            >
              <div className="relative space-y-6">
                
                {/* Mascot Avatar Circular Badge */}
                <div className="relative mx-auto w-24 h-24 flex items-center justify-center rounded-full bg-white/10 border-2 border-white/30 shadow-xl animate-bounce">
                  <span className="text-5xl select-none">{themeDetails.emoji}</span>
                  <div className="absolute -top-1 -right-1 bg-amber-400 text-slate-950 rounded-full w-7 h-7 flex items-center justify-center text-xs font-black border-2 border-white">
                    ⭐
                  </div>
                </div>

                {/* Title display block */}
                <div className="space-y-1">
                  <span className="text-[10px] font-black uppercase tracking-widest text-amber-400">
                    Unit Milestone Completed!
                  </span>
                  <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight drop-shadow-sm">
                    🎉 100% 满分大通关！ 🎉
                  </h2>
                  <div className="text-xs font-bold opacity-90 px-3 py-1 bg-white/10 rounded-full inline-block mt-1">
                    {celebratingUnit.unit} - {celebratingUnit.title}
                  </div>
                </div>

                {/* Custom Character illustration text box */}
                <div className="bg-white/5 border border-white/10 rounded-3xl p-5 space-y-3 relative overflow-hidden text-left">
                  <div className="absolute top-2 right-2 text-xs opacity-30 select-none">
                    {themeDetails.characterVisual}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-extrabold text-amber-300">
                      {themeDetails.mascot}
                    </span>
                    <span className="text-[9px] bg-amber-400 text-slate-900 font-bold px-1.5 py-0.5 rounded-md">
                      伴读导师
                    </span>
                  </div>
                  
                  <p className="text-xs sm:text-sm font-extrabold text-white leading-relaxed">
                    “{themeDetails.greeting}”
                  </p>
                  <p className="text-[11px] italic text-slate-300 leading-relaxed font-medium">
                    "{themeDetails.enGreeting}"
                  </p>
                </div>

                {/* Unlocked rewards HUD */}
                <div className="grid grid-cols-3 gap-2">
                  <div className="bg-white/5 p-2.5 rounded-2xl border border-white/10 text-center">
                    <div className="text-base">🥇</div>
                    <div className="text-[9px] text-slate-300 font-bold">通关勋章</div>
                    <div className="text-[10px] text-white font-black">Level Star</div>
                  </div>
                  <div className="bg-white/5 p-2.5 rounded-2xl border border-white/10 text-center">
                    <div className="text-base">📈</div>
                    <div className="text-[9px] text-slate-300 font-bold">学习进度</div>
                    <div className="text-[10px] text-white font-black">100% Done</div>
                  </div>
                  <div className="bg-white/5 p-2.5 rounded-2xl border border-white/10 text-center">
                    <div className="text-base">🎁</div>
                    <div className="text-[9px] text-slate-300 font-bold">获得能量</div>
                    <div className="text-[10px] text-white font-black">+100 EXP</div>
                  </div>
                </div>

                {/* Interactive play sound & dismiss controls */}
                <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
                  <button
                    onClick={() => playAudio(themeDetails.enGreeting, volume)}
                    className="w-full sm:w-auto px-4 py-3 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/20 text-white text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
                  >
                    <span>🔊 重听美音发音</span>
                  </button>
                  
                  <button
                    onClick={() => setCelebratingUnit(null)}
                    className={`w-full py-3.5 rounded-2xl text-xs font-black transition-all transform active:scale-95 shadow-md flex items-center justify-center gap-1 cursor-pointer ${themeDetails.buttonClass}`}
                  >
                    <span>收下徽章，继续冲刺！</span>
                    <Sparkles className="w-4 h-4" />
                  </button>
                </div>

              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
