import React, { useState, useEffect } from "react";
import { Unit, Word, Sentence, vocabularyData } from "../data/vocabulary";
import { ChevronLeft, Check, X, Award, HelpCircle, ArrowRight, RefreshCw, Volume2, Sparkles, AlertCircle, Bookmark } from "lucide-react";
import { playAudio } from "../utils/audio";
import confetti from "canvas-confetti";
import { StudyTimer } from "./StudyTimer";
import { motion, AnimatePresence } from "motion/react";
import { PerfectScoreCelebration } from "./PerfectScoreCelebration";

interface QuizProps {
  selectedUnit: Unit | null;
  grade: string;
  volume: number;
  addMistake: (mistake: { word: string; translation: string; phonetic: string; grade: string; unitName: string }) => void;
  removeMistake: (word: string) => void;
  onBackToDashboard: () => void;
  onMarkUnitCompleted?: (unitKey: string) => void;
  completedUnits: string[];
  theme: string;
}

interface Question {
  type: "multiple-choice" | "spelling" | "sentence-order";
  title: string;
  translationCue: string;
  correctAnswer: string;
  wordObj?: Word;
  sentenceObj?: Sentence;
  // Multiple choice fields
  options: string[];
  // Spelling fields
  scrambledLetters: string[];
  spelledAnswer: string[];
  // Sentence ordering fields
  scrambledWords: string[];
  orderedSentence: string[];
}

export function Quiz({
  selectedUnit,
  grade,
  volume,
  addMistake,
  removeMistake,
  onBackToDashboard,
  onMarkUnitCompleted,
  completedUnits,
  theme
}: QuizProps) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);
  const [correctStreak, setCorrectStreak] = useState<number>(0);
  const [showStreakMilestone, setShowStreakMilestone] = useState<boolean>(false);
  const [showPerfectCelebration, setShowPerfectCelebration] = useState<boolean>(false);

  const getMilestoneCharacter = () => {
    switch (theme) {
      case "theme-melody":
        return {
          emoji: "🌸🐰",
          name: "My Melody",
          mascot: "美乐蒂",
          bgGradient: "from-pink-100 to-rose-100 dark:from-pink-950 dark:to-rose-950",
          accentText: "text-pink-600 dark:text-pink-400",
          borderClass: "border-pink-300 dark:border-pink-800",
          buttonClass: "bg-pink-500 hover:bg-pink-600 text-white",
          encouragement: "哇！你太厉害了，甜心！已经连续答对 5 道题啦！美乐蒂为你送上一朵草莓花花，继续保持哟！🌸🍓",
          greeting: "甜蜜五连对！"
        };
      case "theme-kuromi":
        return {
          emoji: "😈🖤",
          name: "Kuromi",
          mascot: "库洛米",
          bgGradient: "from-purple-100 to-slate-200 dark:from-purple-950 dark:to-slate-900",
          accentText: "text-purple-600 dark:text-purple-400",
          borderClass: "border-purple-300 dark:border-purple-800",
          buttonClass: "bg-purple-600 hover:bg-purple-700 text-white",
          encouragement: "哼哼，还挺有一套嘛！五连对到手！不愧是我的摇滚小达人！库洛米给你点赞，快冲向下一个挑战！💀⚡",
          greeting: "酷炫五连对！"
        };
      case "theme-cinnamoroll":
        return {
          emoji: "☁️🐶",
          name: "Cinnamoroll",
          mascot: "大耳狗",
          bgGradient: "from-sky-100 to-blue-100 dark:from-sky-950 dark:to-blue-950",
          accentText: "text-sky-500",
          borderClass: "border-sky-300 dark:border-sky-800",
          buttonClass: "bg-sky-500 hover:bg-sky-600 text-white",
          encouragement: "哇塞！你像白云一样轻盈地飞跃了 5 道难关！大耳狗在云朵上为你转圈圈欢呼，太棒啦！☁️🌟",
          greeting: "云端五连对！"
        };
      case "theme-purin":
        return {
          emoji: "🍮🐶",
          name: "Pompompurin",
          mascot: "布丁狗",
          bgGradient: "from-amber-100 to-yellow-100 dark:from-amber-950 dark:to-yellow-950",
          accentText: "text-amber-600 dark:text-amber-400",
          borderClass: "border-amber-300 dark:border-amber-800",
          buttonClass: "bg-amber-500 hover:bg-amber-600 text-white",
          encouragement: "布丁奇迹！连续答对 5 题啦！奖励你一个超大焦糖布丁，上面还带着甜甜的樱桃哦！继续加油鸭！🍮🍒",
          greeting: "布丁五连对！"
        };
      case "theme-dark":
      default:
        return {
          emoji: "🚀🌟",
          name: "Cosmic Star",
          mascot: "星空探索家",
          bgGradient: "from-indigo-100 to-slate-200 dark:from-indigo-950 dark:to-slate-900",
          accentText: "text-indigo-600 dark:text-indigo-400",
          borderClass: "border-indigo-300 dark:border-indigo-800",
          buttonClass: "bg-indigo-600 hover:bg-indigo-700 text-white",
          encouragement: "轨道已锁定！连续答对 5 题！你的星空智慧能量已经完美校准！优秀的探索家，请继续领航星际学习！🌌☄️",
          greeting: "超凡五连对！"
        };
    }
  };
  
  // Audio playback for correct/wrong sounds (gentle tone)
  const playFeedBack = (isCorrect: boolean) => {
    if (isCorrect) {
      playAudio("Excellent!", volume);
    } else {
      playAudio("Let's try again!", volume);
    }
  };

  /**
   * Gen questions list based on active unit
   */
  const generateQuiz = () => {
    if (!selectedUnit) return;

    const unitWords = selectedUnit.words || [];
    const unitSentences = selectedUnit.sentences || [];
    const unitName = selectedUnit.unit;

    // Get general grade pool for distractor choices (preventing infinite loop)
    const gradeKey = `grade_${grade.toLowerCase()}`;
    const allGradeUnits = vocabularyData[gradeKey] || [];
    const generalPool: Word[] = [];
    allGradeUnits.forEach((u) => {
      u.words.forEach((w) => {
        generalPool.push(w);
      });
    });

    const generatedQuestions: Question[] = [];

    // 1. Generate questions for words
    unitWords.forEach((wordObj) => {
      // Type A: Multiple choice translating Chinese to English
      const targetWord = wordObj.word;
      
      // Algorithm to robustly pick exactly 3 distinct distractors from generalPool
      const poolFiltered = generalPool.filter((w) => w.word !== targetWord);
      const uniqueDistractors = Array.from(new Set(poolFiltered.map(w => w.word)))
        .map(wName => poolFiltered.find(item => item.word === wName) as Word)
        .filter(Boolean);

      // Shuffle distractor array and pull 3
      const shuffledDistractors = [...uniqueDistractors].sort(() => Math.random() - 0.5);
      const chosenDistractors = shuffledDistractors.slice(0, 3).map((w) => w.word);
      
      // Fallback in case pool is extremely tiny (mock safety)
      while (chosenDistractors.length < 3) {
        const fillers = ["happy", "classroom", "friend", "pencil"];
        const nextFiller = fillers.find(f => f !== targetWord && !chosenDistractors.includes(f));
        if (nextFiller) chosenDistractors.push(nextFiller);
        else chosenDistractors.push(`apple_${chosenDistractors.length}`);
      }

      // Mix option deck
      const finalOptions = [...chosenDistractors, targetWord].sort(() => Math.random() - 0.5);

      generatedQuestions.push({
        type: "multiple-choice",
        title: `请选择 "${wordObj.translation}" 的正确英文单词：`,
        translationCue: wordObj.translation,
        correctAnswer: targetWord,
        wordObj,
        options: finalOptions,
        scrambledLetters: [],
        spelledAnswer: [],
        scrambledWords: [],
        orderedSentence: []
      });

      // Type B: Alphabet spelling card
      const letters = targetWord.split("");
      const scrambled = [...letters].sort(() => Math.random() - 0.5);

      generatedQuestions.push({
        type: "spelling",
        title: `请帮小熊拼出 "${wordObj.translation}" (${wordObj.word}) 吧：`,
        translationCue: wordObj.translation,
        correctAnswer: targetWord,
        wordObj,
        options: [],
        scrambledLetters: scrambled,
        spelledAnswer: [],
        scrambledWords: [],
        orderedSentence: []
      });
    });

    // 2. Generate questions for sentences
    unitSentences.forEach((sentenceObj) => {
      // Type C: Sentence order arranger
      const rawWords = sentenceObj.english.replace(/[.,!?]/g, "").split(" ");
      const scrambled = [...rawWords].sort(() => Math.random() - 0.5);

      generatedQuestions.push({
        type: "sentence-order",
        title: `请给下面的单词排排队，拼出句子 "${sentenceObj.chinese}"：`,
        translationCue: sentenceObj.chinese,
        correctAnswer: sentenceObj.english,
        sentenceObj,
        options: [],
        scrambledLetters: [],
        spelledAnswer: [],
        scrambledWords: scrambled,
        orderedSentence: []
      });
    });

    // Shuffle final mixed questions list to keep it refreshing
    setQuestions(generatedQuestions.sort(() => Math.random() - 0.5));
    setCurrentQuestionIdx(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setScore(0);
    setQuizFinished(false);
    setCorrectStreak(0);
    setShowStreakMilestone(false);
    setShowPerfectCelebration(false);
  };

  useEffect(() => {
    generateQuiz();
  }, [selectedUnit]);

  if (!selectedUnit || questions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 space-y-4 text-center max-w-sm mx-auto px-4">
        <div className="w-16 h-16 rounded-full bg-sanrio-secondary bg-opacity-30 flex items-center justify-center text-4xl">
          🔮
        </div>
        <h3 className="text-xl font-bold text-sanrio-text">请先选择一个课程单元喔</h3>
        <p className="text-xs text-sanrio-muted">
          在仪表盘选择单元即可在此参加随堂趣味测试，测完便能标记通关喔！
        </p>
        <button
          onClick={onBackToDashboard}
          className="px-5 py-2.5 rounded-full bg-sanrio-primary text-white font-bold text-xs"
        >
          挑选单元 🌸
        </button>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIdx];

  // Multiple Choice handle selection
  const handleSelectOption = (option: string) => {
    if (isAnswered) return;
    setSelectedOption(option);
  };

  // Spelling letter clicks
  const handleSpellingLetterClick = (letter: string, index: number) => {
    if (isAnswered) return;
    
    // Append to spelled deck
    const newSpelled = [...currentQuestion.spelledAnswer, letter];
    
    // Remove from scrambled available options
    const newScrambled = [...currentQuestion.scrambledLetters];
    newScrambled.splice(index, 1);

    // Update state inline
    const updatedQuestions = [...questions];
    updatedQuestions[currentQuestionIdx] = {
      ...currentQuestion,
      spelledAnswer: newSpelled,
      scrambledLetters: newScrambled
    };
    setQuestions(updatedQuestions);
  };

  const handleClearSpelling = () => {
    if (isAnswered) return;
    if (!currentQuestion.wordObj) return;

    const letters = currentQuestion.wordObj.word.split("");
    const scrambled = [...letters].sort(() => Math.random() - 0.5);

    const updatedQuestions = [...questions];
    updatedQuestions[currentQuestionIdx] = {
      ...currentQuestion,
      spelledAnswer: [],
      scrambledLetters: scrambled
    };
    setQuestions(updatedQuestions);
  };

  // Sentence Order word clicks
  const handleWordClick = (word: string, index: number) => {
    if (isAnswered) return;

    const newOrdered = [...currentQuestion.orderedSentence, word];
    const newScrambled = [...currentQuestion.scrambledWords];
    newScrambled.splice(index, 1);

    const updatedQuestions = [...questions];
    updatedQuestions[currentQuestionIdx] = {
      ...currentQuestion,
      orderedSentence: newOrdered,
      scrambledWords: newScrambled
    };
    setQuestions(updatedQuestions);
  };

  const handleClearSentence = () => {
    if (isAnswered) return;
    if (!currentQuestion.sentenceObj) return;

    const rawWords = currentQuestion.sentenceObj.english.replace(/[.,!?]/g, "").split(" ");
    const scrambled = [...rawWords].sort(() => Math.random() - 0.5);

    const updatedQuestions = [...questions];
    updatedQuestions[currentQuestionIdx] = {
      ...currentQuestion,
      orderedSentence: [],
      scrambledWords: scrambled
    };
    setQuestions(updatedQuestions);
  };

  // Submit Answer check
  const handleSubmitAnswer = () => {
    if (isAnswered) return;

    let correct = false;

    if (currentQuestion.type === "multiple-choice") {
      if (selectedOption === currentQuestion.correctAnswer) {
        correct = true;
      }
    } else if (currentQuestion.type === "spelling") {
      const resultWord = currentQuestion.spelledAnswer.join("");
      if (resultWord.toLowerCase() === currentQuestion.correctAnswer.toLowerCase()) {
        correct = true;
      }
    } else if (currentQuestion.type === "sentence-order") {
      const resultSentence = currentQuestion.orderedSentence.join(" ").toLowerCase();
      const targetSentence = currentQuestion.correctAnswer.replace(/[.,!?]/g, "").toLowerCase();
      if (resultSentence === targetSentence) {
        correct = true;
      }
    }

    setIsAnswered(true);
    playFeedBack(correct);

    if (correct) {
      setScore((prev) => prev + 1);
      // Play high voice sound
      if (currentQuestion.wordObj) {
        playAudio(currentQuestion.wordObj.word, volume);
        // Remove from mistakes if correct
        removeMistake(currentQuestion.wordObj.word);
      } else if (currentQuestion.sentenceObj) {
        playAudio(currentQuestion.sentenceObj.english, volume);
      }

      setCorrectStreak((prev) => {
        const next = prev + 1;
        if (next > 0 && next % 5 === 0) {
          setShowStreakMilestone(true);
          // Play celebratory sound or message after a tiny delay so the answer audio can be heard
          setTimeout(() => {
            const milestoneChar = getMilestoneCharacter();
            playAudio(milestoneChar.encouragement, volume);
            try {
              confetti({
                particleCount: 50,
                spread: 60,
                origin: { y: 0.75 }
              });
            } catch (err) {
              console.warn("Milestone confetti blocked or failed:", err);
            }
          }, 1000);
        }
        return next;
      });
    } else {
      setCorrectStreak(0);
      // Add word to mistakes bookmarked database on top state coordinator
      if (currentQuestion.wordObj) {
        addMistake({
          word: currentQuestion.wordObj.word,
          translation: currentQuestion.wordObj.translation,
          phonetic: currentQuestion.wordObj.phonetic,
          grade,
          unitName: selectedUnit.unit
        });
      }
    }
  };

  // Skip and continue to next question
  const handleNextQuestion = () => {
    setSelectedOption(null);
    setIsAnswered(false);

    if (currentQuestionIdx < questions.length - 1) {
      setCurrentQuestionIdx((prev) => prev + 1);
    } else {
      // Quiz finished congratulations!
      setQuizFinished(true);
      if (score === questions.length) {
        // Glorious 100% full-score celebratory animation!
        setShowPerfectCelebration(true);
        playAudio("Brilliant! Perfect score on this unit!", volume);
        
        const duration = 3 * 1000;
        const animationEnd = Date.now() + duration;
        const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 1000 };

        const randomInRange = (min: number, max: number) => {
          return Math.random() * (max - min) + min;
        };

        const interval = window.setInterval(() => {
          const timeLeft = animationEnd - Date.now();

          if (timeLeft <= 0) {
            return clearInterval(interval);
          }

          const particleCount = 50 * (timeLeft / duration);
          try {
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
          } catch (err) {
            console.warn("Confetti animation blocked or failed:", err);
          }
        }, 250);
      } else if (score >= Math.floor(questions.length * 0.7)) {
        // Trigger multi colored confetti with robust try-catch
        try {
          confetti({
            particleCount: 180,
            spread: 80,
            origin: { y: 0.55 }
          });
        } catch (err) {
          console.warn("Confetti animation blocked or failed:", err);
        }
        playAudio("Brilliant score! Congratulations!", volume);
      }
    }
  };

  const handleFinishUnit = () => {
    const key = `${grade.toLowerCase()}_${selectedUnit.unit.toLowerCase()}`;
    if (onMarkUnitCompleted) {
      onMarkUnitCompleted(key);
    }
    onBackToDashboard();
  };

  const scorePercentage = Math.round((score / questions.length) * 100);

  return (
    <div id="quiz-screen" className="max-w-xl mx-auto px-4 py-2 space-y-6">
      {/* 👑 Perfect 100% Score Sanrio-Themed Celebration Overlay */}
      <PerfectScoreCelebration
        isOpen={showPerfectCelebration}
        onClose={() => setShowPerfectCelebration(false)}
        theme={theme}
        volume={volume}
        unitTitle={selectedUnit?.unit || ""}
        score={questions.length}
      />

      {/* 🌟 5-in-a-row correct streak Sanrio Mascot pop-up */}
      <AnimatePresence>
        {showStreakMilestone && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 no-print"
          >
            <motion.div
              initial={{ scale: 0.85, y: 50, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.85, y: 50, opacity: 0 }}
              transition={{ type: "spring", damping: 20, stiffness: 250 }}
              className={`w-full max-w-sm rounded-[2.5rem] bg-gradient-to-b ${getMilestoneCharacter().bgGradient} p-8 text-center border-4 ${getMilestoneCharacter().borderClass} relative shadow-2xl overflow-hidden transition-all duration-300`}
            >
              {/* Decorative top badges */}
              <div className="absolute top-3 right-3">
                <span className="text-2xl animate-pulse">✨</span>
              </div>
              <div className="absolute top-3 left-3">
                <span className="text-2xl animate-pulse">✨</span>
              </div>

              {/* Character Mascot & Circle */}
              <div className="flex justify-center mb-4">
                <div className="w-24 h-24 rounded-full bg-white/85 dark:bg-black/40 border-2 border-dashed border-pink-300 flex items-center justify-center text-5xl relative shadow-md">
                  <span className="select-none">{getMilestoneCharacter().emoji}</span>
                  <div className="absolute -bottom-1.5 -right-1.5 bg-yellow-400 text-white rounded-full p-1 shadow-sm border border-white">
                    <Sparkles className="w-4 h-4 fill-current text-white" />
                  </div>
                </div>
              </div>

              <div className="space-y-1.5 mb-5">
                <div className="text-[10px] uppercase font-black tracking-widest text-sanrio-muted">
                  Streak Milestone!
                </div>
                <h3 className={`text-xl font-black ${getMilestoneCharacter().accentText} flex items-center justify-center gap-1`}>
                  <span>{getMilestoneCharacter().mascot} • {getMilestoneCharacter().greeting}</span>
                </h3>
                <div className="inline-flex items-center gap-1 px-3 py-1 bg-white/80 dark:bg-black/35 rounded-full border border-sanrio-border text-[11px] font-extrabold text-sanrio-text">
                  <span>🔥 连续答对 {correctStreak} 题</span>
                </div>
              </div>

              {/* Dialog bubble */}
              <div className="relative bg-white/95 dark:bg-slate-900/90 rounded-2xl p-4 border border-sanrio-border shadow-xs text-left mb-6">
                <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-white dark:bg-slate-900 border-t border-l border-sanrio-border rotate-45"></div>
                <p className="text-xs font-bold text-sanrio-text text-center leading-relaxed">
                  “{getMilestoneCharacter().encouragement}”
                </p>
              </div>

              {/* Close Button */}
              <button
                onClick={() => {
                  setShowStreakMilestone(false);
                  playAudio("Go go go! Keep studying!", volume);
                }}
                className={`w-full py-3.5 rounded-2xl text-xs font-black transition-all transform active:scale-95 shadow-md flex items-center justify-center gap-1 cursor-pointer ${getMilestoneCharacter().buttonClass}`}
              >
                <span>开心收下，继续答题 💖</span>
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Upper header */}
      <div className="flex items-center justify-between no-print">
        <button
          onClick={onBackToDashboard}
          className="text-xs font-bold text-sanrio-primary hover:underline flex items-center gap-1 cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>退出测验</span>
        </button>
        <div className="text-xs font-bold text-sanrio-accent bg-sanrio-secondary bg-opacity-30 border border-sanrio-border px-3.5 py-1 rounded-full">
          趣味课堂测验 🧸
        </div>
      </div>

      {/* 🍅 番茄专注计时器 (Pomodoro Study Timer) */}
      <StudyTimer theme={theme} volume={volume} />

      {/* 🏁 SCORE PAGE / FINISHED DISPLAY */}
      {quizFinished ? (
        <div className="bg-sanrio-card border-2 border-sanrio-border rounded-3xl p-6 text-center space-y-6 shadow-md animate-fadeIn">
          <div className="flex justify-center">
            <div className="w-20 h-20 rounded-full bg-yellow-100 flex items-center justify-center text-4xl animate-bounce">
              🏆
            </div>
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-black text-sanrio-text">测验圆满完成啦！🎉</h2>
            <p className="text-xs text-sanrio-muted">
              这是关于 <strong className="text-sanrio-accent">{selectedUnit.unit} ({selectedUnit.title})</strong> 的趣味评测
            </p>
          </div>

          {/* Dynamic Badge design based on Active score */}
          <div className="bg-sanrio-bg bg-opacity-50 max-w-sm mx-auto p-4 rounded-2xl border-2 border-dashed border-sanrio-border">
            <div className="text-xs text-sanrio-muted font-bold tracking-wide uppercase">你的最后得分</div>
            <div className="text-5xl font-black text-sanrio-text mt-1">{score} / {questions.length}</div>
            
            <div className="mt-3.5 pt-3.5 border-t border-sanrio-border text-sm font-sub">
              {scorePercentage === 100 ? (
                <div className="text-pink-600 font-extrabold flex flex-col items-center justify-center gap-1 bg-pink-50 dark:bg-pink-950/20 p-2.5 rounded-xl border border-pink-200 dark:border-pink-900 animate-pulse">
                  <div className="flex items-center gap-1 text-pink-600 dark:text-pink-400 font-black">
                    <Sparkles className="w-4 h-4 text-pink-500 animate-spin" />
                    <span>👑 哇！100% 满分完美通关！👑</span>
                    <Sparkles className="w-4 h-4 text-pink-500 animate-spin" />
                  </div>
                  <span className="text-xs text-pink-500 dark:text-pink-400 font-semibold mt-0.5">恭喜宝贝获得极具荣耀的 “💖 满分完美勋章”！</span>
                  <button
                    onClick={() => {
                      setShowPerfectCelebration(true);
                      playAudio("Let's celebrate your perfect score again!", volume);
                    }}
                    className="mt-2.5 px-3 py-1.5 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-xl text-[10px] font-black hover:opacity-95 shadow-xs transition-all active:scale-95 cursor-pointer flex items-center gap-1 justify-center mx-auto"
                  >
                    <span>🎉 重温萌宠满分大庆祝</span>
                  </button>
                </div>
              ) : scorePercentage >= 90 ? (
                <div className="text-green-600 font-bold flex items-center justify-center gap-1">
                  <Sparkles className="w-4 h-4 text-orange-400" />
                  <span>荣获 “👑 大耳狗闪亮皇冠” 勋章！</span>
                </div>
              ) : scorePercentage >= 70 ? (
                <div className="text-yellow-600 font-bold flex items-center justify-center gap-1">
                  <Award className="w-4 h-4 text-orange-400" />
                  <span>荣获 “🐰 美乐蒂开心奖章” 勋章！</span>
                </div>
              ) : (
                <div className="text-amber-600 font-medium">
                  <span>继续加油！多玩几次翻卡，你会越来越棒的！🌱</span>
                </div>
              )}
            </div>
          </div>

          {/* Controls Footer */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <button
              onClick={generateQuiz}
              className="py-3 px-6 rounded-2xl border-2 border-sanrio-border bg-sanrio-card text-sanrio-text text-xs font-bold hover:bg-sanrio-secondary hover:bg-opacity-25 active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              <span>重新测验</span>
            </button>
            <button
              onClick={handleFinishUnit}
              className="py-3 px-6 rounded-2xl bg-sanrio-primary text-white text-xs font-bold hover:opacity-90 active:scale-95 transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>标记通关并返回</span>
            </button>
          </div>
        </div>
      ) : (
        /* 🕹️ ACTIVE TESTING CAROUSEL STAGE */
        <div className="bg-sanrio-card border-2 border-sanrio-border rounded-3xl p-5 sm:p-6 space-y-6 shadow-sm">
          {/* Progress row */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-sanrio-muted">
              <span>随堂测验正在进行中...</span>
              <span>第 {currentQuestionIdx + 1} 题 / 共 {questions.length} 题</span>
            </div>
            {/* Progress segment bar */}
            <div className="w-full h-2 bg-sanrio-bg rounded-full overflow-hidden">
              <div
                className="h-full bg-sanrio-primary transition-all duration-300"
                style={{ width: `${((currentQuestionIdx + 1) / questions.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Question title prompt */}
          <div className="space-y-1 bg-sanrio-bg bg-opacity-40 p-4 rounded-2xl border border-sanrio-border">
            <div className="text-xs text-sanrio-muted font-bold flex items-center gap-1">
              <HelpCircle className="w-3.5 h-3.5 text-sanrio-primary" />
              <span>题目要求：</span>
            </div>
            <h3 className="text-base font-extrabold text-sanrio-text leading-snug">
              {currentQuestion.title}
            </h3>
          </div>

          {/* QUESTION TYPE SPECIFIC INTERACTION PANELS */}
          
          {/* 1. Multiple choice layout */}
          {currentQuestion.type === "multiple-choice" && (
            <div className="grid grid-cols-1 gap-2.5">
              {currentQuestion.options.map((opt, oIdx) => {
                const isSelected = selectedOption === opt;
                // Color codes after submissions
                let btnStyle = "border-sanrio-border hover:bg-sanrio-secondary hover:bg-opacity-20 bg-sanrio-card text-sanrio-text";
                if (isAnswered) {
                  if (opt === currentQuestion.correctAnswer) {
                    btnStyle = "border-green-400 bg-green-100 text-green-700 font-bold";
                  } else if (isSelected) {
                    btnStyle = "border-red-400 bg-red-100 text-red-700";
                  } else {
                    btnStyle = "opacity-50 border-sanrio-border bg-sanrio-card text-sanrio-text";
                  }
                } else if (isSelected) {
                  btnStyle = "border-sanrio-primary bg-sanrio-primary text-white font-bold";
                }

                return (
                  <button
                    key={oIdx}
                    onClick={() => handleSelectOption(opt)}
                    disabled={isAnswered}
                    className={`w-full py-3.5 px-4 rounded-2xl border-2 text-left text-sm transition-all duration-150 flex items-center justify-between cursor-pointer ${btnStyle}`}
                  >
                    <span>{opt}</span>
                    {isAnswered && opt === currentQuestion.correctAnswer && <Check className="w-4 h-4 text-green-600" />}
                    {isAnswered && isSelected && opt !== currentQuestion.correctAnswer && <X className="w-4 h-4 text-red-600" />}
                  </button>
                );
              })}
            </div>
          )}

          {/* 2. Alphabet drag and spelling layout */}
          {currentQuestion.type === "spelling" && (
            <div className="space-y-5">
              {/* Output Spelled Slot Box */}
              <div className="min-h-14 bg-sanrio-bg p-3 rounded-2xl border-2 border-dashed border-sanrio-border flex flex-wrap gap-2 items-center justify-center">
                {currentQuestion.spelledAnswer.length === 0 ? (
                  <span className="text-xs text-sanrio-muted italic select-none">按顺序点击底下卡片，拼出完整单词⭐</span>
                ) : (
                  currentQuestion.spelledAnswer.map((char, charIdx) => (
                    <div
                      key={charIdx}
                      className="w-10 h-10 rounded-xl bg-sanrio-primary text-white flex items-center justify-center text-sm font-black shadow-sm"
                    >
                      {char}
                    </div>
                  ))
                )}
              </div>

              {/* Scrambled Available Letters Deck */}
              <div className="space-y-2 text-center">
                <div className="text-[10px] text-sanrio-muted font-black uppercase">可供选择的字母包：</div>
                <div className="flex flex-wrap justify-center gap-2">
                  {currentQuestion.scrambledLetters.map((char, index) => (
                    <button
                      key={index}
                      onClick={() => handleSpellingLetterClick(char, index)}
                      disabled={isAnswered}
                      className="w-11 h-11 rounded-xl border-2 border-sanrio-border bg-sanrio-card hover:border-sanrio-primary hover:bg-sanrio-secondary hover:bg-opacity-35 text-sanrio-text text-sm font-bold flex items-center justify-center shadow-sm disabled:opacity-40 transition-all cursor-pointer"
                    >
                      {char}
                    </button>
                  ))}
                </div>
              </div>

              {/* Reset button inside test */}
              {!isAnswered && (
                <div className="text-center">
                  <button
                    onClick={handleClearSpelling}
                    className="text-xs text-sanrio-accent hover:underline font-bold"
                  >
                    重新拼写 ↩️
                  </button>
                </div>
              )}
            </div>
          )}

          {/* 3. Sentence ordering block arranger */}
          {currentQuestion.type === "sentence-order" && (
            <div className="space-y-5">
              {/* Construction slot board */}
              <div className="min-h-16 bg-sanrio-bg p-3.5 rounded-2xl border-2 border-dashed border-sanrio-border flex flex-wrap gap-2.5 items-center justify-center">
                {currentQuestion.orderedSentence.length === 0 ? (
                  <span className="text-xs text-sanrio-muted italic select-none">点击底下的单词，将它们安排在句子正确位置 🌸</span>
                ) : (
                  currentQuestion.orderedSentence.map((word, wIdx) => (
                    <div
                      key={wIdx}
                      className="px-3 py-1.5 rounded-xl bg-sanrio-primary text-white text-xs font-bold shadow-xs"
                    >
                      {word}
                    </div>
                  ))
                )}
              </div>

              {/* Scrambled Available Words */}
              <div className="space-y-2 text-center">
                <div className="text-[10px] text-sanrio-muted font-black uppercase">单词池：</div>
                <div className="flex flex-wrap justify-center gap-2.5">
                  {currentQuestion.scrambledWords.map((word, index) => (
                    <button
                      key={index}
                      onClick={() => handleWordClick(word, index)}
                      disabled={isAnswered}
                      className="px-3.5 py-2 rounded-xl border-2 border-sanrio-border bg-sanrio-card hover:border-sanrio-primary text-sanrio-text text-xs font-semibold disabled:opacity-40 transition-all cursor-pointer"
                    >
                      {word}
                    </button>
                  ))}
                </div>
              </div>

              {!isAnswered && (
                <div className="text-center">
                  <button
                    onClick={handleClearSentence}
                    className="text-xs text-sanrio-accent hover:underline font-bold"
                  >
                    重选单词 ↩️
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Evaluation banner */}
          {isAnswered && (
            <div className="space-y-2">
              <div className="pt-4 border-t border-dashed border-sanrio-border">
                {/* Result stamp */}
                {(currentQuestion.type === "multiple-choice" && selectedOption === currentQuestion.correctAnswer) ||
                (currentQuestion.type === "spelling" && currentQuestion.spelledAnswer.join("").toLowerCase() === currentQuestion.correctAnswer.toLowerCase()) ||
                (currentQuestion.type === "sentence-order" && currentQuestion.orderedSentence.join(" ").toLowerCase() === currentQuestion.correctAnswer.replace(/[.,!?]/g, "").toLowerCase()) ? (
                  <div className="bg-green-50 border border-green-200 text-green-700 rounded-2xl p-4 flex gap-3 items-start text-xs leading-relaxed animate-fadeIn">
                    <Check className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <div className="font-bold">非常正确！你太棒啦！🎉</div>
                      <div>最标准发音是：<strong>{currentQuestion.correctAnswer}</strong></div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-red-50 border border-red-200 text-red-700 rounded-2xl p-4 flex gap-3 items-start text-xs leading-relaxed animate-fadeIn">
                    <X className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <div className="font-bold">错过了，别灰心，下次一定对！🌸</div>
                      <div>不要着急，标准答案是：<strong className="text-sanrio-accent underline font-mono">{currentQuestion.correctAnswer}</strong></div>
                      {currentQuestion.wordObj && (
                        <div className="text-gray-500 text-[10px]">这个单词已同步记录到错题本，稍后我们可以去巩固哦！</div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Action Footer triggers */}
          <div className="pt-4 border-t border-sanrio-border flex justify-end">
            {!isAnswered ? (
              <button
                onClick={handleSubmitAnswer}
                disabled={
                  (currentQuestion.type === "multiple-choice" && !selectedOption) ||
                  (currentQuestion.type === "spelling" && currentQuestion.spelledAnswer.length === 0) ||
                  (currentQuestion.type === "sentence-order" && currentQuestion.orderedSentence.length === 0)
                }
                className="w-full sm:w-auto py-3 px-6 rounded-2xl bg-sanrio-primary text-white text-xs font-bold shadow-md hover:bg-opacity-90 disabled:opacity-50 transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <span>提交答案</span>
                <Check className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleNextQuestion}
                className="w-full sm:w-auto py-3 px-6 rounded-2xl bg-sanrio-accent text-white text-xs font-bold shadow-md hover:opacity-95 transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <span>{currentQuestionIdx < questions.length - 1 ? "下一题" : "查看最后分数"}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
