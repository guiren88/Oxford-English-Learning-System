import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles, Award, Star, Volume2, Heart, Gift, Trophy } from "lucide-react";
import { playAudio } from "../utils/audio";
import confetti from "canvas-confetti";

interface PerfectScoreCelebrationProps {
  isOpen: boolean;
  onClose: () => void;
  theme: string;
  volume: number;
  unitTitle: string;
  score: number;
}

export function PerfectScoreCelebration({
  isOpen,
  onClose,
  theme,
  volume,
  unitTitle,
  score
}: PerfectScoreCelebrationProps) {
  const [showGift, setShowGift] = useState(false);

  // Character custom specifications based on the theme
  const getThemeData = () => {
    switch (theme) {
      case "theme-melody":
        return {
          emoji: "🌸🐰🍓",
          name: "My Melody",
          characterName: "美乐蒂",
          title: "💖 草莓梦幻满分大满贯！ 💖",
          cardBg: "from-pink-50 via-rose-100 to-pink-100 dark:from-pink-950 dark:via-rose-950 dark:to-pink-900",
          border: "border-pink-300 dark:border-pink-800 shadow-pink-200 dark:shadow-none",
          accentText: "text-pink-600 dark:text-pink-400",
          badgeColor: "bg-pink-500",
          buttonColor: "bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white shadow-pink-200 dark:shadow-none",
          sparklesColor: "#ec4899",
          confettiColors: ["#ec4899", "#f43f5e", "#fda4af", "#ffffff"],
          congratsMessage: "哇！宝贝你真的太棒了！获得了 100% 的满分完美成绩！美乐蒂开心得在粉色草莓田里转圈圈！这枚『闪亮草莓满分勋章』属于最聪明的你，抱抱！🍓🌸✨",
          stickerDesc: "获得『My Melody 满分草莓城堡』贴纸奖励"
        };
      case "theme-kuromi":
        return {
          emoji: "😈💀🖤",
          name: "Kuromi",
          characterName: "库洛米",
          title: "⚡ 酷炫暗黑满分恶作剧！ ⚡",
          cardBg: "from-purple-100 via-indigo-100 to-slate-200 dark:from-purple-950 dark:via-indigo-950 dark:to-slate-900",
          border: "border-purple-300 dark:border-purple-800 shadow-purple-200 dark:shadow-none",
          accentText: "text-purple-600 dark:text-purple-400",
          badgeColor: "bg-purple-600",
          buttonColor: "bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-purple-200 dark:shadow-none",
          sparklesColor: "#8b5cf6",
          confettiColors: ["#8b5cf6", "#6366f1", "#a78bfa", "#3b82f6"],
          congratsMessage: "哼哼~不赖嘛！居然全对拿了满分！库洛米本来还想看你苦恼的样子呢~ 哼，既然你这么厉害，那这枚『暗黑闪电酷炫徽章』就赏给你啦！快拿去炫耀吧！💀⚡💜",
          stickerDesc: "获得『Kuromi 摇滚恶魔键盘』贴纸奖励"
        };
      case "theme-cinnamoroll":
        return {
          emoji: "☁️🐶💙",
          name: "Cinnamoroll",
          characterName: "大耳狗",
          title: "☁️ 蓬松白云完美全对！ ☁️",
          cardBg: "from-sky-50 via-blue-100 to-sky-100 dark:from-sky-950 dark:via-blue-950 dark:to-sky-900",
          border: "border-sky-300 dark:border-sky-800 shadow-sky-100 dark:shadow-none",
          accentText: "text-sky-500 dark:text-sky-400",
          badgeColor: "bg-sky-500",
          buttonColor: "bg-gradient-to-r from-sky-400 to-blue-500 hover:from-sky-50 hover:to-blue-600 text-white shadow-sky-100 dark:shadow-none",
          sparklesColor: "#38bdf8",
          confettiColors: ["#38bdf8", "#60a5fa", "#bae6fd", "#ffffff"],
          congratsMessage: "呼哇~太厉害了！全对满分！大耳狗开心得耳朵都飞起来啦，在天空中像直升机一样转圈圈呢！送你一颗甜烘烘的肉桂卷，宝贝要继续保持哦！☁️✨🥞",
          stickerDesc: "获得『Cinnamoroll 云端棉花糖』贴纸奖励"
        };
      case "theme-purin":
        return {
          emoji: "🍮🐶💛",
          name: "Pompompurin",
          characterName: "布丁狗",
          title: "🍮 甜蜜布丁焦糖大满分！ 🍮",
          cardBg: "from-amber-50 via-yellow-100 to-amber-100 dark:from-amber-950 dark:via-yellow-950 dark:to-amber-900",
          border: "border-amber-300 dark:border-amber-800 shadow-amber-100 dark:shadow-none",
          accentText: "text-amber-600 dark:text-amber-400",
          badgeColor: "bg-amber-500",
          buttonColor: "bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white shadow-amber-100 dark:shadow-none",
          sparklesColor: "#f59e0b",
          confettiColors: ["#f59e0b", "#eab308", "#fef08a", "#f97316"],
          congratsMessage: "汪汪！太棒啦！100分大满贯！布丁狗要把最大的焦糖布丁奖励给你！上面还加了好多甜甜的红樱桃呢，跟着布丁狗一起摇摆屁屁庆祝吧！🍮🍒✨",
          stickerDesc: "获得『Pompompurin 焦糖奶油派』贴纸奖励"
        };
      case "theme-dark":
      default:
        return {
          emoji: "🚀🌌🌟",
          name: "Cosmic Voyager",
          characterName: "星际探索家",
          title: "☄️ 宇宙耀眼完美满分！ ☄️",
          cardBg: "from-indigo-950 via-slate-900 to-zinc-950",
          border: "border-indigo-500 shadow-indigo-950",
          accentText: "text-indigo-400",
          badgeColor: "bg-indigo-600",
          buttonColor: "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white",
          sparklesColor: "#6366f1",
          confettiColors: ["#6366f1", "#8b5cf6", "#ec4899", "#3b82f6"],
          congratsMessage: "检测到智力能量波动爆发！宝贝你拿下了 100% 完美满分！宇宙探索仪正在为你播报满分返航信号，你就像夜空里最闪亮那颗超新星！🚀✨🌌",
          stickerDesc: "获得『星际荣耀量子能量』贴纸奖励"
        };
    }
  };

  const cData = getThemeData();

  useEffect(() => {
    if (isOpen) {
      // Audio cue with a slight delay
      const audioTimer = setTimeout(() => {
        playAudio(cData.congratsMessage, volume);
      }, 500);

      // Multiphase confetti bursts
      const duration = 4 * 1000;
      const animationEnd = Date.now() + duration;

      const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

      const interval = window.setInterval(() => {
        const timeLeft = animationEnd - Date.now();
        if (timeLeft <= 0) return clearInterval(interval);

        const particleCount = 60 * (timeLeft / duration);
        try {
          confetti({
            particleCount,
            spread: 90,
            origin: { x: randomInRange(0.15, 0.35), y: Math.random() - 0.2 },
            colors: cData.confettiColors
          });
          confetti({
            particleCount,
            spread: 90,
            origin: { x: randomInRange(0.65, 0.85), y: Math.random() - 0.2 },
            colors: cData.confettiColors
          });
        } catch (err) {
          console.warn("Celebration confetti failed:", err);
        }
      }, 350);

      const giftTimer = setTimeout(() => {
        setShowGift(true);
      }, 2000);

      return () => {
        clearTimeout(audioTimer);
        clearTimeout(giftTimer);
        clearInterval(interval);
      };
    } else {
      setShowGift(false);
    }
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto no-print"
        >
          {/* Main card */}
          <motion.div
            initial={{ scale: 0.75, y: 100, rotate: -3 }}
            animate={{ scale: 1, y: 0, rotate: 0 }}
            exit={{ scale: 0.75, y: 100, rotate: 3 }}
            transition={{ type: "spring", damping: 15, stiffness: 180 }}
            className={`w-full max-w-lg rounded-[3rem] bg-gradient-to-b ${cData.cardBg} p-8 text-center border-4 ${cData.border} relative shadow-2xl overflow-hidden transition-all duration-300 my-8`}
          >
            {/* Sparkly Background Emojis / Stars */}
            <div className="absolute top-4 left-6 text-3xl animate-bounce duration-1000">🎉</div>
            <div className="absolute top-4 right-6 text-3xl animate-bounce duration-700">⭐</div>
            <div className="absolute bottom-6 left-6 text-2xl opacity-40">🎀</div>
            <div className="absolute bottom-6 right-6 text-2xl opacity-40">🍭</div>

            {/* Glowing Ring Badge with Icon */}
            <div className="flex justify-center mb-6">
              <motion.div
                animate={{
                  scale: [1, 1.1, 1],
                  rotate: [0, 5, -5, 0]
                }}
                transition={{
                  repeat: Infinity,
                  duration: 4,
                  ease: "easeInOut"
                }}
                className="w-28 h-28 rounded-full bg-white dark:bg-black/50 border-4 border-dashed border-yellow-400 dark:border-yellow-600 flex items-center justify-center text-6xl relative shadow-xl"
              >
                <span className="select-none">{cData.emoji}</span>
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                  className="absolute -bottom-1 -right-1 bg-pink-500 text-white rounded-full p-2 shadow-md border-2 border-white"
                >
                  <Trophy className="w-5 h-5 text-yellow-300 fill-current animate-pulse" />
                </motion.div>
              </motion.div>
            </div>

            {/* Celebration Title Header */}
            <div className="space-y-2 mb-4">
              <span className={`text-[11px] tracking-widest font-black uppercase bg-white/70 dark:bg-black/30 px-3 py-1 rounded-full border border-sanrio-border ${cData.accentText}`}>
                🏆 100% PERFECT SCORE 🏆
              </span>
              <h2 className={`text-2xl sm:text-3xl font-black ${cData.accentText} leading-snug drop-shadow-sm`}>
                {cData.title}
              </h2>
              <div className="text-xs font-bold text-sanrio-muted">
                在测验单项中成功答对全部 <span className="font-mono text-sm underline">{score}</span> 道难题！
              </div>
            </div>

            {/* Speaking voice bubble */}
            <div className="relative bg-white/95 dark:bg-slate-900/95 rounded-[2rem] p-5 border-2 border-sanrio-border shadow-md text-left mb-6">
              <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-white dark:bg-slate-900 border-t-2 border-l-2 border-sanrio-border rotate-45"></div>
              
              <div className="flex items-start gap-3">
                <div className="bg-sanrio-secondary bg-opacity-25 p-2 rounded-full mt-1">
                  <Volume2 className="w-5 h-5 text-sanrio-accent animate-pulse" />
                </div>
                <div className="space-y-1.5">
                  <div className="text-[10px] font-black text-sanrio-muted uppercase tracking-wider flex items-center gap-1">
                    <span>{cData.characterName} 声优温馨贺电:</span>
                    <span className="h-1.5 w-1.5 bg-green-500 rounded-full animate-ping"></span>
                  </div>
                  <p className="text-xs font-black text-sanrio-text leading-relaxed">
                    “{cData.congratsMessage}”
                  </p>
                </div>
              </div>

              {/* Click to play voice again */}
              <button
                onClick={() => playAudio(cData.congratsMessage, volume)}
                className="mt-3 text-[10px] font-extrabold text-sanrio-accent hover:underline flex items-center gap-1 cursor-pointer mx-auto bg-sanrio-bg bg-opacity-40 px-3 py-1.5 rounded-lg border border-sanrio-border"
              >
                <span>🔊 点击再次收听萌宠原声</span>
              </button>
            </div>

            {/* 🎁 Gentle popping Gift Box showing sticker rewards */}
            <AnimatePresence>
              {showGift && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="bg-yellow-50 dark:bg-yellow-950/40 p-3.5 rounded-2xl border border-yellow-200 dark:border-yellow-900 mb-6 flex items-center justify-center gap-3 animate-pulse"
                >
                  <Gift className="w-8 h-8 text-yellow-500 shrink-0 fill-current" />
                  <div className="text-left">
                    <div className="text-[11px] font-black text-yellow-600 dark:text-yellow-400">
                      🎁 满分通关惊喜盲盒奖励:
                    </div>
                    <div className="text-xs font-black text-sanrio-text">
                      {cData.stickerDesc}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Exit Close Button with elegant gradient styling */}
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={onClose}
              className={`w-full py-4 rounded-2xl text-sm font-black transition-all transform shadow-lg flex items-center justify-center gap-2 cursor-pointer ${cData.buttonColor}`}
            >
              <span>🎉 太棒了，开心收下奖励！ 🎉</span>
            </motion.button>

          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
