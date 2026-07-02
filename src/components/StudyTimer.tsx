import React, { useState, useEffect, useRef } from "react";
import { Play, Pause, RotateCcw, Timer, Sparkles, Coffee, Volume2 } from "lucide-react";
import { playAudio } from "../utils/audio";
import confetti from "canvas-confetti";

interface StudyTimerProps {
  theme: string;
  volume: number;
}

export function StudyTimer({ theme, volume }: StudyTimerProps) {
  // Preset time selections in minutes
  const presets = [1, 5, 10, 15, 25];
  
  const [duration, setDuration] = useState<number>(10 * 60); // Default to 10 minutes (in seconds)
  const [timeLeft, setTimeLeft] = useState<number>(10 * 60);
  const [isActive, setIsActive] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [completedSessionsCount, setCompletedSessionsCount] = useState<number>(0);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Sync timeLeft when duration changes (only if not active)
  useEffect(() => {
    if (!isActive) {
      setTimeLeft(duration);
    }
  }, [duration, isActive]);

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // Timer tick effect
  useEffect(() => {
    if (isActive && !isPaused) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleTimerComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive, isPaused]);

  // Triggered when timer counts down to 0
  const handleTimerComplete = () => {
    setIsActive(false);
    setIsPaused(false);
    setCompletedSessionsCount((prev) => prev + 1);

    // Blast joyful confetti!
    try {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 },
        colors: ["#ec4899", "#3b82f6", "#f59e0b", "#10b981", "#8b5cf6"]
      });
    } catch {}

    // Formulate a gentle character-specific voice congratulations
    let congratsText = "Beep beep! Ding dong! Focus study time is completed! Yay, sweetheart! You did an amazing job! Take a small break, stretch your body and have a strawberry juice!";
    
    switch (theme) {
      case "theme-kuromi":
        congratsText = "Hahaha! Time's up! Look at you, working so hard! Even Kuromi thinks you did awesome! Go get a black chocolate candy, then let's study again!";
        break;
      case "theme-cinnamoroll":
        congratsText = "La la la~ The sky clock chimed! Focus study session completed! Cinnamoroll is flying around to bring you a soft sweet marshmallow break!";
        break;
      case "theme-purin":
        congratsText = "Yum yum! Time's up! You worked super-duper hard! Pompompurin has prepared a cool, delicious custard pudding for your sweet break!";
        break;
      case "theme-dark":
        congratsText = "Focus mission completed! Today's cosmic study capsule has successfully landed. You performed exceptionally well! Time to rest your eyes.";
        break;
    }

    playAudio(congratsText, volume);
  };

  // Preset button action
  const handleSelectPreset = (minutes: number) => {
    setDuration(minutes * 60);
    setTimeLeft(minutes * 60);
    setIsActive(false);
    setIsPaused(false);
    playAudio(`Timer set to ${minutes} minutes. Let's do this!`, volume);
  };

  // Custom adjustments (+/- 1 minute)
  const handleAdjustMinutes = (amount: number) => {
    const currentMin = Math.floor(duration / 60);
    const nextMin = Math.max(1, Math.min(60, currentMin + amount));
    setDuration(nextMin * 60);
    setTimeLeft(nextMin * 60);
    setIsActive(false);
    setIsPaused(false);
    playAudio(`Adjusted timer to ${nextMin} minutes`, volume);
  };

  const handleStart = () => {
    setIsActive(true);
    setIsPaused(false);
    
    let voiceMsg = "Let's start focusing! Ready, set, go!";
    switch (theme) {
      case "theme-kuromi":
        voiceMsg = "Focus mode activated! Show me what you got, rockstar!";
        break;
      case "theme-cinnamoroll":
        voiceMsg = "Yay! Let's study peacefully like a soft fluffy cloud! Focus time starts now!";
        break;
      case "theme-purin":
        voiceMsg = "🍮 focus pudding activated! Let's do some sweet learning together!";
        break;
      case "theme-dark":
        voiceMsg = "Initiating space exploration focus timer. Smooth learning voyage!";
        break;
    }
    playAudio(voiceMsg, volume);
  };

  const handlePause = () => {
    setIsPaused(true);
    playAudio("Timer paused. Take a breath!", volume);
  };

  const handleResume = () => {
    setIsPaused(false);
    playAudio("Resuming study timer. Let's keep going!", volume);
  };

  const handleReset = () => {
    setIsActive(false);
    setIsPaused(false);
    setTimeLeft(duration);
    playAudio("Timer reset to start", volume);
  };

  // Formatting helper
  const formatTime = (seconds: number): string => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  // SVG Progress Ring calculations
  const radius = 52;
  const stroke = 8;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const progressPercent = duration > 0 ? (timeLeft / duration) * 100 : 0;
  const strokeDashoffset = circumference - (progressPercent / 100) * circumference;

  return (
    <div className="bg-sanrio-card border-2 border-sanrio-border rounded-3xl p-5 shadow-xs hover:shadow-sm transition-all duration-300">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        
        {/* Left segment: title, presets & description */}
        <div className="space-y-2.5 flex-1 w-full text-center sm:text-left">
          <div className="flex items-center justify-center sm:justify-start gap-1.5">
            <Timer className="w-5 h-5 text-sanrio-accent animate-pulse" />
            <h4 className="text-sm font-black text-sanrio-text flex items-center gap-1.5">
              <span>番茄专注计时器</span>
              <span className="text-[9px] bg-amber-100 dark:bg-amber-950 text-amber-600 px-1.5 py-0.5 rounded font-extrabold uppercase">
                Pomodoro
              </span>
            </h4>
          </div>
          <p className="text-[11px] text-sanrio-muted max-w-sm">
            设置宝贝自己的“专注学习时间”，时间到会响起专属萌宠声优提醒，培养良好专注习惯喔！🍅
          </p>

          {/* Quick presets row */}
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-1">
            {presets.map((min) => (
              <button
                key={min}
                onClick={() => handleSelectPreset(min)}
                className={`px-2.5 py-1 rounded-lg border text-[10px] font-black transition-all cursor-pointer active:scale-95 ${
                  duration === min * 60 && !isActive
                    ? "bg-sanrio-primary text-white border-sanrio-primary"
                    : "bg-sanrio-bg bg-opacity-40 hover:bg-sanrio-secondary hover:bg-opacity-20 border-sanrio-border text-sanrio-text"
                }`}
              >
                {min} 分钟
              </button>
            ))}
          </div>

          {/* Minute Adjuster buttons */}
          <div className="flex items-center justify-center sm:justify-start gap-1.5">
            <span className="text-[10px] font-bold text-sanrio-muted">增减时间:</span>
            <button
              onClick={() => handleAdjustMinutes(-1)}
              disabled={isActive}
              className="w-6 h-6 rounded bg-sanrio-bg border border-sanrio-border text-[11px] font-black text-sanrio-text disabled:opacity-40 hover:bg-sanrio-secondary hover:bg-opacity-20 flex items-center justify-center cursor-pointer active:scale-95"
            >
              -1
            </button>
            <button
              onClick={() => handleAdjustMinutes(1)}
              disabled={isActive}
              className="w-6 h-6 rounded bg-sanrio-bg border border-sanrio-border text-[11px] font-black text-sanrio-text disabled:opacity-40 hover:bg-sanrio-secondary hover:bg-opacity-20 flex items-center justify-center cursor-pointer active:scale-95"
            >
              +1
            </button>
            
            {completedSessionsCount > 0 && (
              <span className="ml-auto sm:ml-4 text-[10px] bg-green-50 dark:bg-green-950 text-green-600 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                <span>已专注 {completedSessionsCount} 次</span>
              </span>
            )}
          </div>
        </div>

        {/* Right segment: Clock Ring and Action buttons */}
        <div className="flex items-center gap-4 bg-sanrio-bg bg-opacity-30 p-3 rounded-2xl border border-sanrio-border shrink-0 w-full sm:w-auto justify-center">
          
          {/* Ring Clock */}
          <div className="relative w-24 h-24 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                stroke="rgba(244, 143, 177, 0.15)"
                fill="transparent"
                strokeWidth={stroke}
                r={normalizedRadius}
                cx={radius}
                cy={radius}
              />
              <circle
                stroke="var(--color-sanrio-accent, #ec4899)"
                fill="transparent"
                strokeWidth={stroke}
                strokeDasharray={circumference + " " + circumference}
                style={{ strokeDashoffset }}
                strokeLinecap="round"
                r={normalizedRadius}
                cx={radius}
                cy={radius}
                className="transition-all duration-300"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-base font-black text-sanrio-text font-mono tracking-tight">
                {formatTime(timeLeft)}
              </span>
              <span className="text-[8px] text-sanrio-muted font-bold -mt-0.5 uppercase">
                {isActive ? (isPaused ? "已暂停" : "专注中") : "准备好"}
              </span>
            </div>
          </div>

          {/* Play/Pause/Stop controllers */}
          <div className="flex flex-col gap-1.5">
            {!isActive ? (
              <button
                onClick={handleStart}
                className="flex items-center justify-center gap-1 py-1.5 px-3 rounded-xl bg-sanrio-primary hover:opacity-95 text-white text-xs font-black shadow-sm transition-all active:scale-95 cursor-pointer"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>开始专注</span>
              </button>
            ) : (
              <>
                {isPaused ? (
                  <button
                    onClick={handleResume}
                    className="flex items-center justify-center gap-1 py-1.5 px-3 rounded-xl bg-green-500 hover:bg-green-600 text-white text-xs font-black shadow-sm transition-all active:scale-95 cursor-pointer"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>继续</span>
                  </button>
                ) : (
                  <button
                    onClick={handlePause}
                    className="flex items-center justify-center gap-1 py-1.5 px-3 rounded-xl bg-orange-400 hover:bg-orange-500 text-white text-xs font-black shadow-sm transition-all active:scale-95 cursor-pointer"
                  >
                    <Pause className="w-3.5 h-3.5 fill-current" />
                    <span>暂停</span>
                  </button>
                )}
                
                <button
                  onClick={handleReset}
                  className="flex items-center justify-center gap-1 py-1 px-3 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-opacity-80 transition-all active:scale-95 cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>重置</span>
                </button>
              </>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
